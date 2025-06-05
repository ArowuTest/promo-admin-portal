// src/pages/PrizeStructurePage.tsx
import React, { useEffect, useState } from 'react';
import {
  fetchPrizeStructures,
  createPrizeStructure,
  deletePrizeStructure,
  updatePrizeStructure,
  PrizeStructure,
  PrizeTier,
} from '../services/prizeService';

export default function PrizeStructurePage() {
  const [structures, setStructures] = useState<PrizeStructure[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for creating/editing
  const [formName, setFormName] = useState<string>('');
  const [formDate, setFormDate] = useState<string>('');
  const [formTiers, setFormTiers] = useState<PrizeTier[]>([]); // each tier has TierName, Amount, Quantity, RunnerUpCount, OrderIndex
  const [editingId, setEditingId] = useState<string | null>(null);

  const refreshList = () => {
    setLoading(true);
    fetchPrizeStructures()
      .then((all) => {
        setStructures(all);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load prize structures');
        setLoading(false);
      });
  };

  useEffect(() => {
    refreshList();
  }, []);

  const resetForm = () => {
    setFormName('');
    setFormDate('');
    setFormTiers([]);
    setEditingId(null);
  };

  const handleAddTier = () => {
    setFormTiers([
      ...formTiers,
      {
        ID: '',
        PrizeStructureID: '',
        TierName: '',
        Amount: 0,
        Quantity: 1,
        RunnerUpCount: 0,
        OrderIndex: formTiers.length + 1,
      },
    ]);
  };

  const handleTierChange = (
    idx: number,
    key: keyof PrizeTier,
    value: string | number
  ) => {
    const newTiers = [...formTiers];
    // @ts-ignore
    newTiers[idx][key] = value;
    setFormTiers(newTiers);
  };

  const handleSubmit = async () => {
    setError(null);
    const payload = {
      name: formName,
      effective: formDate, // e.g. "2025-06-04"
      tiers: formTiers.map((t, idx) => ({
        TierName: t.TierName,
        Amount: t.Amount,
        Quantity: t.Quantity,
        RunnerUpCount: t.RunnerUpCount,
        OrderIndex: idx + 1,
      })),
    };

    try {
      if (editingId) {
        await updatePrizeStructure(editingId, payload);
      } else {
        await createPrizeStructure(payload);
      }
      resetForm();
      refreshList();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save');
    }
  };

  const startEdit = (ps: PrizeStructure) => {
    setEditingId(ps.id);
    setFormName(ps.name);
    setFormDate(ps.effective.split('T')[0]);
    setFormTiers(
      ps.tiers.map((t) => ({
        ID: t.ID,
        PrizeStructureID: ps.id,
        TierName: t.TierName,
        Amount: t.Amount,
        Quantity: t.Quantity,
        RunnerUpCount: t.RunnerUpCount,
        OrderIndex: t.OrderIndex,
      }))
    );
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this prize structure?')) return;
    try {
      await deletePrizeStructure(id);
      refreshList();
    } catch {
      setError('Failed to delete');
    }
  };

  return (
    <div>
      <h1>Prize Structures</h1>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div style={{ marginBottom: '1.5rem' }}>
        <h2>{editingId ? 'Edit Prize Structure' : 'Create Prize Structure'}</h2>
        <div>
          <label>
            Name{' '}
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Effective Date{' '}
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
            />
          </label>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <h3>Tiers</h3>
          {formTiers.map((t, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid #ccc',
                padding: '0.5rem',
                marginBottom: '0.5rem',
              }}
            >
              <div>
                <label>
                  Tier Name:{' '}
                  <input
                    type="text"
                    value={t.TierName}
                    onChange={(e) => handleTierChange(idx, 'TierName', e.target.value)}
                  />
                </label>
              </div>
              <div>
                <label>
                  Amount:{' '}
                  <input
                    type="number"
                    value={t.Amount}
                    onChange={(e) => handleTierChange(idx, 'Amount', Number(e.target.value))}
                  />
                </label>
              </div>
              <div>
                <label>
                  # Winners (Quantity):{' '}
                  <input
                    type="number"
                    value={t.Quantity}
                    onChange={(e) =>
                      handleTierChange(idx, 'Quantity', Number(e.target.value))
                    }
                  />
                </label>
              </div>
              <div>
                <label>
                  # Runner‐ups:{' '}
                  <input
                    type="number"
                    value={t.RunnerUpCount}
                    onChange={(e) =>
                      handleTierChange(idx, 'RunnerUpCount', Number(e.target.value))
                    }
                  />
                </label>
              </div>
            </div>
          ))}
          <button onClick={handleAddTier}>+ Add Tier</button>
        </div>

        <button style={{ marginTop: '1rem' }} onClick={handleSubmit}>
          {editingId ? 'Update Structure' : 'Create Structure'}
        </button>
      </div>

      <hr />

      <h2>Existing Prize Structures</h2>
      {loading ? (
        <div>Loading…</div>
      ) : structures.length === 0 ? (
        <div>No prize structures defined.</div>
      ) : (
        <ul>
          {structures.map((ps) => (
            <li key={ps.id} style={{ marginBottom: '1rem' }}>
              <strong>{ps.name}</strong> (Effective: {ps.effective.split('T')[0]}) – 
              {ps.tiers.length} tier(s)
              <button
                style={{ marginLeft: '1rem' }}
                onClick={() => startEdit(ps)}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(ps.id)}
                style={{ marginLeft: '0.5rem', color: 'red' }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
