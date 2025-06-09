import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listDraws } from '@services/drawService';
import { fetchWinnersByDrawId } from '@services/winnersService';
import type { WinnerRecord } from '@types/Winner';
import type { PrizeStructure } from '@types/Prize';
import Spinner from '@components/Spinner';
import Modal from '@components/Modal';
import { useAuth } from '@contexts/AuthContext';
import MaskedMSISDN from '@components/MaskedMSISDN';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid';

interface WinnersData {
    winners: WinnerRecord[];
    prizeStructure: PrizeStructure;
}

const processWinnersForTable = (data?: WinnersData) => {
    if (!data || !data.winners || !data.prizeStructure) return null;
    const { winners, prizeStructure } = data;
    const results: { [key: string]: { winner: WinnerRecord, runners: WinnerRecord[] }[] } = {};

    prizeStructure.Tiers.forEach(tier => {
        const mainWinners = winners.filter(w => w.prize_tier === tier.TierName && !w.is_runner_up).sort((a, b) => a.position - b.position);
        const runnerUps = winners.filter(w => w.prize_tier === tier.TierName && w.is_runner_up).sort((a, b) => a.position - b.position);
        
        const tierResults = [];
        for (let i = 0; i < mainWinners.length; i++) {
            const winner = mainWinners[i];
            const associatedRunners = runnerUps.slice(i * tier.RunnerUpCount, (i + 1) * tier.RunnerUpCount);
            tierResults.push({ winner, runners: associatedRunners });
        }
        results[tier.TierName] = tierResults;
    });
    return results;
};


function WinnersModal({ draw, onClose }: { draw: any; onClose: () => void }) {
    const { user } = useAuth();
    const [unmasked, setUnmasked] = useState(false);

    const { data, isLoading, isError } = useQuery<WinnersData, Error>({
        queryKey: ['winners', draw.ID],
        queryFn: () => fetchWinnersByDrawId(draw.ID),
        enabled: !!draw.ID,
    });
    
    const formattedResults = processWinnersForTable(data);

    return (
        <Modal isOpen={!!draw.ID} onClose={onClose} title={`Winners for Draw - ${new Date(draw.DrawDate).toLocaleDateString()}`}>
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">Executed on: {new Date(draw.CreatedAt).toLocaleString()}</p>
                {user?.role === 'SUPERADMIN' && (
                    <button onClick={() => setUnmasked(!unmasked)} className="text-sm bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300">
                        {unmasked ? 'Mask Numbers' : 'Reveal Numbers'}
                    </button>
                )}
            </div>
            {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
            {isError && <p className="text-red-500 p-4">Could not load winners for this draw.</p>}
            {formattedResults && (
                <div className="space-y-6 max-h-96 overflow-y-auto">
                    {Object.entries(formattedResults).map(([tierName, prizeRows]) => (
                         <div key={tierName}>
                             <h3 className="font-semibold text-md text-indigo-700 border-b pb-1 mb-2">{tierName}</h3>
                             <div className="overflow-x-auto">
                                 <table className="min-w-full text-sm">
                                     <thead className="bg-gray-50">
                                         <tr>
                                             <th className="px-2 py-1 text-left font-medium text-gray-500">Winner</th>
                                             {Array(data?.prizeStructure.Tiers.find(t=>t.TierName === tierName)?.RunnerUpCount || 0).fill(0).map((_, i) => (
                                                 <th key={i} className="px-2 py-1 text-left font-medium text-gray-500">Runner Up {i + 1}</th>
                                             ))}
                                         </tr>
                                     </thead>
                                     <tbody>
                                         {prizeRows.map((row, rowIndex) => (
                                             <tr key={rowIndex} className="border-t">
                                                <td className="px-2 py-2 font-mono">{unmasked ? row.winner.msisdn_full : row.winner.msisdn_masked}</td>
                                                 {row.runners.map((runner) => (
                                                     <td key={runner.id} className="px-2 py-2 font-mono">{unmasked ? runner.msisdn_full : runner.msisdn_masked}</td>
                                                 ))}
                                                 {Array((data?.prizeStructure.Tiers.find(t=>t.TierName === tierName)?.RunnerUpCount || 0) - row.runners.length).fill(0).map((_, i) => (
                                                    <td key={`pad-${i}`} className="px-2 py-2 font-mono">---</td>
                                                 ))}
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             </div>
                         </div>
                    ))}
                </div>
            )}
        </Modal>
    );
}

type SortKey = 'DrawDate' | 'CreatedAt';
type SortDirection = 'asc' | 'desc';

export default function WinnersPage() {
    const [selectedDraw, setSelectedDraw] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'DrawDate', direction: 'desc' });

    const { data: draws, isLoading } = useQuery<any[], Error>({
        queryKey: ['draws'],
        queryFn: listDraws,
    });

    const handleSort = (key: SortKey) => {
        let direction: SortDirection = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedAndFilteredDraws = useMemo(() => {
        if (!draws) return [];
        let sortableItems = [...draws];

        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            sortableItems = sortableItems.filter(draw =>
                draw.ID.toLowerCase().includes(lowercasedFilter) ||
                draw.AdminUser?.username.toLowerCase().includes(lowercasedFilter)
            );
        }

        sortableItems.sort((a, b) => {
            const dateA = new Date(a[sortConfig.key]).getTime();
            const dateB = new Date(b[sortConfig.key]).getTime();
            if (dateA < dateB) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (dateA > dateB) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return sortableItems;
    }, [draws, searchTerm, sortConfig]);

    const renderSortArrow = (key: SortKey) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' 
            ? <ChevronUpIcon className="h-4 w-4 ml-1 inline-block" /> 
            : <ChevronDownIcon className="h-4 w-4 ml-1 inline-block" />;
    }

    return (
        <>
            {selectedDraw && <WinnersModal draw={selectedDraw} onClose={() => setSelectedDraw(null)} />}
            <div className="bg-white shadow-md rounded-lg">
                <div className="p-6 border-b flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Past Draws</h1>
                        <p className="text-sm text-gray-500">View history of all draws or search by Draw ID or Admin Username.</p>
                    </div>
                    <input
                        type="text"
                        placeholder="Search draws..."
                        className="w-full sm:w-1/3 px-3 py-2 border rounded-md"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Draw ID</th>
                                <th scope="col" onClick={() => handleSort('DrawDate')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><div className="flex items-center">Draw Date{renderSortArrow('DrawDate')}</div></th>
                                <th scope="col" onClick={() => handleSort('CreatedAt')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><div className="flex items-center">Execution Date & Time{renderSortArrow('CreatedAt')}</div></th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Executed By</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading && <tr><td colSpan={7} className="text-center py-10"><Spinner /></td></tr>}
                            {sortedAndFilteredDraws.map((draw: any) => (
                                <tr key={draw.ID}>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{draw.ID}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{new Date(draw.DrawDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(draw.CreatedAt).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{draw.AdminUser?.username || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${draw.Source === 'CSV' ? 'bg-purple-100 text-purple-800' : 'bg-cyan-100 text-cyan-800'}`}>
                                            {draw.Source || 'PostHog'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{draw.IsRerun ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Rerun</span> : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Original</span>}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => setSelectedDraw(draw)} className="text-indigo-600 hover:text-indigo-900">View Winners</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}