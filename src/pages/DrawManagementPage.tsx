// src/pages/DrawManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { executeDraw, uploadCsvEntries } from '../services/drawService';
import { fetchPrizeStructures } from '../services/prizeService';
import { PrizeStructure } from '../services/prizeService';

export default function DrawManagementPage() {
  const { getToken } = useAuthContext();
  const [drawDate, setDrawDate] = useState<string>('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvCount, setCsvCount] = useState<number>(0);
  const [prizeStructures, setPrizeStructures] = useState<PrizeStructure[]>([]);
  const [selectedPrizeID, setSelectedPrizeID] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Whenever drawDate changes, fetch prize‐structures whose effective == drawDate
  useEffect(() => {
    setPrizeStructures([]);
    setSelectedPrizeID('');
    setErrorMsg(null);
    setSuccessMsg(null);
    if (drawDate) {
      fetchPrizeStructures()
        .then((all) => {
          // Filter for exact match on day (backend returns ISO8601 "2025-06-04T00:00:00Z")
          const matching = all.filter((ps) => {
            // Only compare YYYY-MM-DD
            const eff = ps.effective.split('T')[0];
            return eff === drawDate;
          });
          setPrizeStructures(matching);
          if (matching.length === 1) {
            setSelectedPrizeID(matching[0].id);
          }
        })
        .catch(() => {
          setErrorMsg('Failed to load prize structures');
        });
    }
  }, [drawDate]);

  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
      // Count lines in the uploaded CSV
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        const rows = text.split(/\r?\n/).filter((r) => r.trim() !== '');
        setCsvCount(rows.length - 1); // subtract header
      };
      reader.readAsText(e.target.files[0]);
    } else {
      setCsvFile(null);
      setCsvCount(0);
    }
  };

  const handleExecute = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!drawDate) {
      setErrorMsg('Please select a draw date.');
      return;
    }
    if (!selectedPrizeID) {
      setErrorMsg('Select a prize structure for that date.');
      return;
    }

    try {
      // First, if CSV was provided, upload entries
      if (csvFile) {
        await uploadCsvEntries({
          file: csvFile,
          drawDate,
          prizeStructureID: selectedPrizeID,
        });
        setSuccessMsg(`CSV uploaded: ${csvCount} rows`);
      }

      // Then trigger the draw
      await executeDraw({ drawDate, prizeStructureID: selectedPrizeID });
      setSuccessMsg('Draw executed successfully.');
    } catch (err: any) {
      const msg =
        err.response?.data?.error || 'Draw failed (check that a prize structure exists for this date)';
      setErrorMsg(msg);
    }
  };

  return (
    <div>
      <h1>Draw Management</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Select Draw Date{' '}
          <input
            type="date"
            value={drawDate}
            onChange={(e) => {
              setDrawDate(e.target.value);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
          />
        </label>
      </div>

      {drawDate && (
        <>
          <div style={{ marginBottom: '0.5rem' }}>
            Prize Structure:{' '}
            {prizeStructures.length === 0 ? (
              <span>No prize structure defined for this date</span>
            ) : (
              <select
                value={selectedPrizeID}
                onChange={(e) => setSelectedPrizeID(e.target.value)}
              >
                <option value="">-- Choose structure –</option>
                {prizeStructures.map((ps) => (
                  <option key={ps.id} value={ps.id}>
                    {ps.name} ({ps.tiers.length} tiers)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>
              Upload CSV (Optional){' '}
              <input type="file" accept=".csv" onChange={handleCsvChange} />
            </label>
            {csvCount > 0 && <span style={{ marginLeft: '1rem' }}>{csvCount} rows loaded.</span>}
          </div>

          <button onClick={handleExecute}>Execute Draw</button>
        </>
      )}

      {errorMsg && <div style={{ color: 'red', marginTop: '1rem' }}>{errorMsg}</div>}
      {successMsg && <div style={{ color: 'green', marginTop: '1rem' }}>{successMsg}</div>}
    </div>
  );
}
