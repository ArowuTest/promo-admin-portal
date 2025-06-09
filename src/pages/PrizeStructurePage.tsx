import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPrizeStructures,
  createPrizeStructure,
  updatePrizeStructure,
  deletePrizeStructure,
} from '@services/prizeService';
import type { PrizeStructure, PrizeTierPayload, PrizeStructurePayload } from '@types/Prize';
import Spinner from '@components/Spinner';
import { PlusIcon, TrashIcon } from '@heroicons/react/20/solid';

const emptyFormState: PrizeStructurePayload = {
  name: '',
  effective: new Date().toISOString().split('T')[0],
  eligible_days: [],
  tiers: [],
};

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function PrizeStructurePage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<PrizeStructurePayload>(emptyFormState);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: structures, isLoading, isError, error } = useQuery<PrizeStructure[], Error>({
    queryKey: ['prize-structures'],
    queryFn: fetchPrizeStructures,
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prize-structures'] });
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.error || 'An unexpected error occurred.');
    },
  };

  const createMutation = useMutation({ mutationFn: createPrizeStructure, ...mutationOptions });
  const updateMutation = useMutation({ mutationFn: (vars: { id: string; payload: PrizeStructurePayload }) => updatePrizeStructure(vars), ...mutationOptions });
  const deleteMutation = useMutation({ mutationFn: deletePrizeStructure, ...mutationOptions });

  const handleDayToggle = (day: string) => {
    setFormValues(prev => ({
      ...prev,
      eligible_days: prev.eligible_days.includes(day)
        ? prev.eligible_days.filter(d => d !== day)
        : [...prev.eligible_days, day],
    }));
  };

  const handleTierChange = (index: number, field: keyof PrizeTierPayload, value: string | number) => {
    const newTiers = [...formValues.tiers];
    const typedValue = (field === 'amount' || field === 'quantity' || field === 'runner_up_count' || field === 'order_index') ? Number(value) : value;
    newTiers[index] = { ...newTiers[index], [field]: typedValue };
    setFormValues({ ...formValues, tiers: newTiers });
  };

  const addTier = () => {
    const newTier: PrizeTierPayload = { tier_name: '', amount: 0, quantity: 1, runner_up_count: 0, order_index: formValues.tiers.length + 1 };
    setFormValues({ ...formValues, tiers: [...formValues.tiers, newTier] });
  };
  
  const removeTier = (index: number) => {
    setFormValues(prev => ({ ...prev, tiers: prev.tiers.filter((_, i) => i !== index) }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormValues(emptyFormState);
    setFormError(null);
  };

  const startEdit = (ps: PrizeStructure) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setEditingId(ps.ID);
    setFormValues({
        name: ps.Name,
        effective: ps.Effective.split('T')[0],
        eligible_days: ps.EligibleDays || [], // Ensure eligible_days is an array
        tiers: ps.Tiers.map(t => ({
            tier_name: t.TierName,
            amount: t.Amount,
            quantity: t.Quantity,
            runner_up_count: t.RunnerUpCount,
            order_index: t.OrderIndex,
        }))
    });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (formValues.tiers.length === 0 || formValues.eligible_days.length === 0) {
      setFormError("A prize structure must have at least one tier and one eligible day.");
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload: formValues });
    } else {
      createMutation.mutate(formValues);
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Form Section */}
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Structure' : 'Create New Prize Structure'}</h2>
          {formError && <p className="text-red-600 bg-red-50 p-3 rounded-md text-sm">{formError}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Structure Name</label>
                  <input type="text" id="name" placeholder="e.g., Weekday Draw" value={formValues.name} onChange={e => setFormValues({...formValues, name: e.target.value})} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
              </div>
              <div>
                  <label htmlFor="effective" className="block text-sm font-medium text-gray-700">Effective From Date</label>
                  <input type="date" id="effective" value={formValues.effective} onChange={e => setFormValues({...formValues, effective: e.target.value})} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
              </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Eligible Days</label>
            <div className="mt-2 grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ALL_DAYS.map(day => (
                <button type="button" key={day} onClick={() => handleDayToggle(day)}
                  className={`px-3 py-2 text-sm rounded-md border ${formValues.eligible_days.includes(day) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}>
                  {day.substring(0,3)}
                </button>
              ))}
            </div>
          </div>
          <hr/>
          <h3 className="text-lg font-medium text-gray-700">Tiers</h3>
          <div className="space-y-3">
              {formValues.tiers.map((tier, index) => (
                  <div key={index} className="grid grid-cols-2 md:grid-cols-5 gap-2 border p-4 rounded-md relative bg-gray-50">
                      <button type="button" onClick={() => removeTier(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><TrashIcon className="h-5 w-5"/></button>
                      <div className="col-span-2 md:col-span-2"><label className="text-xs text-gray-500">Tier Name</label><input type="text" placeholder="e.g., Jackpot" value={tier.tier_name} onChange={e => handleTierChange(index, 'tier_name', e.target.value)} className="w-full text-sm rounded-md border-gray-300 mt-1"/></div>
                      <div><label className="text-xs text-gray-500">Prize Amount</label><input type="number" placeholder="Amount" value={tier.amount} onChange={e => handleTierChange(index, 'amount', e.target.value)} className="w-full text-sm rounded-md border-gray-300 mt-1"/></div>
                      <div><label className="text-xs text-gray-500"># of Winners</label><input type="number" placeholder="Quantity" value={tier.quantity} onChange={e => handleTierChange(index, 'quantity', e.target.value)} className="w-full text-sm rounded-md border-gray-300 mt-1"/></div>
                      <div><label className="text-xs text-gray-500"># of Runners-up</label><input type="number" placeholder="Runner-ups" value={tier.runner_up_count} onChange={e => handleTierChange(index, 'runner_up_count', e.target.value)} className="w-full text-sm rounded-md border-gray-300 mt-1"/></div>
                  </div>
              ))}
          </div>
          <button type="button" onClick={addTier} className="w-full flex items-center justify-center space-x-2 text-sm text-indigo-600 border-2 border-dashed border-gray-300 rounded-md py-2 hover:bg-indigo-50"><PlusIcon className="h-5 w-5"/><span>Add Tier</span></button>
          <div className="flex justify-end space-x-2 pt-4">
              {editingId && <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>}
              <button type="submit" disabled={createMutation.isLoading || updateMutation.isLoading} className="w-36 justify-center flex bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">{createMutation.isLoading || updateMutation.isLoading ? <Spinner/> : (editingId ? 'Update Structure' : 'Save Structure')}</button>
          </div>
      </form>
      
      {/* List Section */}
      <div className="bg-white shadow-md rounded-lg mt-8">
        <div className="p-6"><h1 className="text-xl font-bold text-gray-800">Existing Prize Structures</h1></div>
        <div className="space-y-4 p-6">
            {isLoading && <div className="flex justify-center"><Spinner /></div>}
            {isError && <p className="text-red-500">Error loading structures: {error.message}</p>}
            
            {/* THIS IS THE FIX: Check if 'structures' exists before trying to map it. */}
            {structures && structures.map((ps) => (
                <div key={ps.ID} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-lg text-indigo-700">{ps.Name}</p>
                            <p className="text-sm text-gray-500">Effective Since: {new Date(ps.Effective).toLocaleDateString()}</p>
                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-gray-700">Applies to:</span>
                                {/* Also check if EligibleDays is not null before mapping */}
                                {ps.EligibleDays && ps.EligibleDays.map(day => <span key={day} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{day}</span>)}
                            </div>
                        </div>
                        <div className="flex space-x-2 flex-shrink-0">
                            <button onClick={() => startEdit(ps)} className="text-sm bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600">Edit</button>
                            <button onClick={() => {if(window.confirm('Are you sure?')) deleteMutation.mutate(ps.ID)}} disabled={deleteMutation.isLoading} className="text-sm bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700">Delete</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}