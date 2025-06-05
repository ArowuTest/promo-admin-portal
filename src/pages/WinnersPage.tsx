// src/pages/WinnersPage.tsx

import React, { useState, useEffect } from 'react';
import { apiClient } from '@services/apiClient';

interface Winner {
  ID: string;
  DrawID: string;
  PrizeTierID: string;
  MSISDN: string;
  Position: string;
  IsRunnerUp: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

export default function WinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<Winner[]>('/winners')
      .then((res) => {
        setWinners(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to fetch winners');
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-6">Loading winners...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">All Winners</h2>
      <div className="bg-white p-4 rounded shadow">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 border">MSISDN</th>
              <th className="px-4 py-2 border">Position</th>
              <th className="px-4 py-2 border">Prize Tier ID</th>
              <th className="px-4 py-2 border">Created At</th>
            </tr>
          </thead>
          <tbody>
            {winners.map((w) => (
              <tr key={w.ID} className="hover:bg-gray-100">
                <td className="px-4 py-2 border">{w.MSISDN}</td>
                <td className="px-4 py-2 border">{w.Position}</td>
                <td className="px-4 py-2 border">{w.PrizeTierID}</td>
                <td className="px-4 py-2 border">
                  {new Date(w.CreatedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
