import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWinners } from '@services/winnersService';
import { WinnerRecord } from '@types/Winner';
import Spinner from '@components/Spinner';
import MaskedMSISDN from '@components/MaskedMSISDN';
import { formatDate } from '@utils/formatDate';

export default function WinnersPage() {
  const { data, isLoading, error } = useQuery<WinnerRecord[]>(['winners'], fetchWinners);

  if (isLoading) return <Spinner />;
  if (error) return <p className="text-red-500">Failed to load winners</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">All Winners</h2>
      <div className="bg-white rounded shadow">
        <table className="min-w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 border">Draw ID</th>
              <th className="px-4 py-2 border">Prize Tier</th>
              <th className="px-4 py-2 border">Position</th>
              <th className="px-4 py-2 border">MSISDN</th>
              <th className="px-4 py-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {data?.map(w => (
              <tr key={w.id} className="bg-white">
                <td className="px-4 py-2 border">{w.drawId}</td>
                <td className="px-4 py-2 border">{w.prizeTier}</td>
                <td className="px-4 py-2 border">{w.position}</td>
                <td className="px-4 py-2 border">
                  <MaskedMSISDN msisdn={w.msisdn} />
                </td>
                <td className="px-4 py-2 border">{formatDate(w.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
 
