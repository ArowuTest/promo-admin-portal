import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPrizeStructures, createPrizeStructure, updatePrizeStructure, deletePrizeStructure } from '@services/prizeService';
import { PrizeStructure, PrizeTier } from '@types/Prize';
import Spinner from '@components/Spinner';
import { v4 as uuidv4 } from 'uuid';

export default function PrizeStructurePage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<PrizeStructure[]>(['prizes'], fetchPrizeStructures);
  const [editing, setEditing] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<PrizeStructure>({
    id: '',
    effectiveDate: '',
    currency: '₦',
    tiers: [],
  });

  // mutations
  const createMutation = useMutation(createPrizeStructure, {
    onSuccess: () => queryClient.invalidateQueries(['prizes']),
  });
  const updateMutation = useMutation(({ id, data }: { id: string; data: PrizeStructure }) => updatePrizeStructure(id, data), {
    onSuccess: () => queryClient.invalidateQueries(['prizes']),
  });
  const deleteMutation = useMutation(deletePrizeStructure, {
    onSuccess: () => queryClient.invalidateQueries(['prizes']),
  });

  // handle edit click
  const startEdit = (ps: PrizeStructure) => {
    setEditing(ps.id);
    setFormValues(ps);
  };

  const cancelEdit = () => {
    setEditing(null);
    setFormValues({
      id: '',
      effectiveDate: '',
      currency: '₦',
      tiers: [],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.effectiveDate || formValues.tiers.length === 0) return;

    if (editing) {
      updateMutation.mutate({ id: editing, data: formValues });
    } else {
      createMutation.mutate({ ...formValues, id: uuidv4() });
    }
    cancelEdit();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this prize structure?')) {
      deleteMutation.mutate(id);
    }
  };

  const addTier = () => {
    setFormValues(prev => ({
      ...prev,
      tiers: [
        ...prev.tiers,
        { id: uuidv4(), name: '', amount: 0, quantity: 1, runnerUps: 0 },
      ],
    }));
  };
  const updateTier = (tierId: string, field: keyof PrizeTier, value: any) => {
    setFormValues(prev => ({
      ...prev,
      tiers: prev.tiers.map(t => (t.id === tierId ? { ...t, [field]: value } : t)),
    }));
  };
  const removeTier = (tierId: string) => {
    setFormValues(prev => ({
      ...prev,
      tiers: prev.tiers.filter(t => t.id !== tierId),
    }));
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Prize Structures</h2>
      <div className="space-y-6">
        {/* List existing */}
        {data?.map(ps => (
          <div key={ps.id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center">
              <div>
                <p>
                  <span className="font-semibold">Effective Date:</span> {ps.effectiveDate}
                </p>
                <p>
                  <span className="font-semibold">Currency:</span> {ps.currency}
                </p>
                <p className="mt-2 font-semibold">Tiers:</p>
                {ps.tiers.map(t => (
                  <div key={t.id} className="ml-4">
                    • {t.name}: {ps.currency}
                    {t.amount} &times; {t.quantity}{' '}
                    (Runner‐ups: {t.runnerUps})
                  </div>
                ))}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => startEdit(ps)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(ps.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Create / Edit Form */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-xl font-semibold mb-2">{editing ? 'Edit' : 'New'} Prize Structure</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700">Effective Date</label>
              <input
                type="date"
                value={formValues.effectiveDate}
                onChange={e => setFormValues({ ...formValues, effectiveDate: e.target.value })}
                required
                className="mt-1 w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700">Currency</label>
              <input
                type="text"
                value={formValues.currency}
                onChange={e => setFormValues({ ...formValues, currency: e.target.value })}
                required
                className="mt-1 w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <p className="font-semibold">Tiers:</p>
              {formValues.tiers.map(t => (
                <div key={t.id} className="flex items-end space-x-2 mb-2">
                  <div className="w-1/4">
                    <label className="block text-gray-700">Name</label>
                    <input
                      type="text"
                      value={t.name}
                      onChange={e => updateTier(t.id, 'name', e.target.value)}
                      required
                      className="mt-1 w-full px-2 py-1 border rounded"
                    />
                  </div>
                  <div className="w-1/4">
                    <label className="block text-gray-700">Amount</label>
                    <input
                      type="number"
                      value={t.amount}
                      onChange={e => updateTier(t.id, 'amount', +e.target.value)}
                      required
                      className="mt-1 w-full px-2 py-1 border rounded"
                    />
                  </div>
                  <div className="w-1/4">
                    <label className="block text-gray-700">Quantity</label>
                    <input
                      type="number"
                      value={t.quantity}
                      onChange={e => updateTier(t.id, 'quantity', +e.target.value)}
                      required
                      className="mt-1 w-full px-2 py-1 border rounded"
                    />
                  </div>
                  <div className="w-1/4">
                    <label className="block text-gray-700">Runner‐ups</label>
                    <input
                      type="number"
                      value={t.runnerUps}
                      onChange={e => updateTier(t.id, 'runnerUps', +e.target.value)}
                      required
                      className="mt-1 w-full px-2 py-1 border rounded"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTier(t.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTier}
                className="mt-2 px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
              >
                + Add Tier
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={createMutation.isLoading || updateMutation.isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {editing ? 'Update' : 'Create'}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
 
