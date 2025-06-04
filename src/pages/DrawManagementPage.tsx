// src/pages/DrawManagementPage.tsx

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchPrizeStructures } from '@services/prizeService';
import { executeDraw } from '@services/drawService';
import Spinner from '@components/Spinner';
import MaskedMSISDN from '@components/MaskedMSISDN';
import { DrawResponse, DrawEntry } from '@types/Draw';

export default function DrawManagementPage() {
  // 1) State for picking a date
  const [selectedDate, setSelectedDate] = useState<string>('');
  // 2) Prize‐structure that matches that date (by ID)
  const [selectedPrizeId, setSelectedPrizeId] = useState<string>('');
  // 3) Once we execute, we’ll store the draw result here:
  const [result, setResult] = useState<DrawResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  // Fetch all prize structures (so we can filter for “effective == selectedDate”)
  const { data: structures } = useQuery(['prizeStructures'], fetchPrizeStructures);

  // Mutation: execute draw
  const drawMutation = useMutation(executeDraw, {
    onSuccess: (data: DrawResponse) => {
      setShowAnimation(false);
      setResult(data);
    },
    onError: (err: any) => {
      setShowAnimation(false);
      setError(err.response?.data?.error || 'Draw failed');
    },
  });

  // Whenever you pick a date, auto‐select the matching prize structure (if any)
  useEffect(() => {
    if (!structures) return;
    const match = structures.find((ps: any) => {
      // both are ISO‐strings; compare only “YYYY‐MM‐DD”
      return ps.effective.startsWith(selectedDate);
    });
    setSelectedPrizeId(match ? match.ID : '');
  }, [selectedDate, structures]);

  const handleExecute = () => {
    if (!selectedDate || !selectedPrizeId) {
      setError('Please choose a valid date and prize structure first.');
      return;
    }
    setError(null);
    setResult(null);
    setShowAnimation(true);

    // Fake 3‐second animation, then call API
    setTimeout(() => {
      drawMutation.mutate({
        date: selectedDate,
        prize_structure_id: selectedPrizeId,
      });
    }, 3000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Draw Management</h2>

      {/* 1) Date selector */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Draw Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      {/* 2) Prize‐structure dropdown (only show when structures are loaded) */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Prize Structure</label>
        <select
          value={selectedPrizeId}
          onChange={(e) => setSelectedPrizeId(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">-- Choose structure for that date --</option>
          {structures?.map((ps: any) => (
            <option key={ps.ID} value={ps.ID}>
              {ps.Name} (Effective {ps.effective.slice(0, 10)})
            </option>
          ))}
        </select>
      </div>

      {/* 3) Button to execute */}
      <div className="flex justify-end">
        <button
          onClick={handleExecute}
          disabled={drawMutation.isLoading || showAnimation}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {showAnimation ? <Spinner /> : 'Execute Draw'}
        </button>
      </div>

      {/* 4) Error message if API fails */}
      {error && <p className="mt-3 text-red-500">{error}</p>}

      {/* 5) Show results if draw succeeded */}
      {result && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-xl font-semibold mb-2">
            Draw Results for {result.date}
          </h3>
          <table className="min-w-full border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 border">Prize Tier</th>
                <th className="px-4 py-2 border">Position</th>
                <th className="px-4 py-2 border">MSISDN</th>
              </tr>
            </thead>
            <tbody>
              {result.winners.map((w: DrawEntry, idx: number) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-4 py-2 border">{w.prizeTier}</td>
                  <td className="px-4 py-2 border">{w.position}</td>
                  <td className="px-4 py-2 border">
                    <MaskedMSISDN msisdn={w.msisdn} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
