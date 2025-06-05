// src/pages/CsvUploadPage.tsx
import React, { useState } from 'react';
import Papa from 'papaparse';
import { uploadCsvEntries } from '../services/drawService';

export default function CsvUploadPage() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvCount, setCsvCount] = useState<number>(0);
  const [drawDate, setDrawDate] = useState<string>('');
  const [prizeStructureID, setPrizeStructureID] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
      Papa.parse(e.target.files[0], {
        complete: (results) => {
          // subtract header
          setCsvCount(results.data.length - 1);
        },
      });
    } else {
      setCsvFile(null);
      setCsvCount(0);
    }
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!csvFile || !drawDate || !prizeStructureID) {
      setErrorMsg('Please provide date, prize structure ID, and a CSV file.');
      return;
    }
    try {
      await uploadCsvEntries({ file: csvFile, drawDate, prizeStructureID });
      setSuccessMsg(`CSV uploaded (${csvCount} rows)`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Upload failed');
    }
  };

  return (
    <div>
      <h1>Upload CSV for Draw</h1>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Draw Date{' '}
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

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Prize Structure ID{' '}
          <input
            type="text"
            placeholder="Paste a Prize Structure ID"
            value={prizeStructureID}
            onChange={(e) => setPrizeStructureID(e.target.value)}
          />
        </label>
        <div style={{ fontSize: '0.85rem', color: '#666' }}>
          (You can also find prize structure IDs on the “Prize Structures” page.)
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Select CSV File{' '}
          <input type="file" accept=".csv" onChange={handleFile} />
        </label>
        {csvCount > 0 && <span style={{ marginLeft: '1rem' }}>{csvCount} rows parsed.</span>}
      </div>

      <button onClick={handleSubmit}>Upload CSV Entries</button>

      {errorMsg && <div style={{ color: 'red', marginTop: '1rem' }}>{errorMsg}</div>}
      {successMsg && <div style={{ color: 'green', marginTop: '1rem' }}>{successMsg}</div>}
    </div>
  );
}
