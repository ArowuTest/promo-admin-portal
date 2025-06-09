import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as drawService from '@services/drawService';
import { fetchValidPrizeStructuresForDate } from '@services/prizeService';
import type { PrizeStructure, PrizeTier } from '@types/Prize';
import type { DrawRequest, DrawResponse, DrawWinner } from '@types/Draw';
import Spinner from '@components/Spinner';
import MaskedMSISDN from '@components/MaskedMSISDN';
import { useAuth } from '@contexts/AuthContext';
import DrawWheel from '@components/DrawWheel';

const processDrawResults = (winners: DrawWinner[], tiers: PrizeTier[]) => {
    const results: { [key: string]: string[][] } = {};
    if (!winners || !tiers) return results;

    tiers.forEach(tier => {
        const mainWinners = winners.filter(w => w.prize_tier === tier.TierName && !w.is_runner_up).sort((a, b) => a.position - b.position);
        const runnerUps = winners.filter(w => w.prize_tier === tier.TierName && w.is_runner_up).sort((a, b) => a.position - b.position);
        
        const rows: string[][] = [];
        const numMainWinners = Math.max(tier.Quantity, mainWinners.length);

        for (let i = 0; i < numMainWinners; i++) {
            const row: string[] = [mainWinners[i]?.masked_msisdn || '---'];
            for (let j = 0; j < tier.RunnerUpCount; j++) {
                const runnerUpIndex = i * tier.RunnerUpCount + j;
                row.push(runnerUps[runnerUpIndex]?.masked_msisdn || '---');
            }
            rows.push(row);
        }
        results[tier.TierName] = rows;
    });
    return results;
};

export default function DrawManagementPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedPrizeStructure, setSelectedPrizeStructure] = useState<PrizeStructure | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [stage, setStage] = useState<'idle' | 'spinning' | 'results'>('idle');

    const { data: validPrizeStructures, isLoading: isLoadingStructures } = useQuery<PrizeStructure[], Error>({
        queryKey: ['valid-prize-structures', selectedDate],
        queryFn: () => fetchValidPrizeStructuresForDate(selectedDate),
        enabled: !!selectedDate,
    });

    useEffect(() => {
        if (validPrizeStructures && validPrizeStructures.length > 0) {
            setSelectedPrizeStructure(validPrizeStructures[0]);
        } else {
            setSelectedPrizeStructure(null);
        }
        setStage('idle');
        setError(null);
    }, [validPrizeStructures, selectedDate]);

    const handleSuccess = () => {
        setStage('spinning');
        setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['draws'] });
            setStage('results');
        }, 3500);
    };

    const drawMutation = useMutation<DrawResponse, any, DrawRequest>({
        mutationFn: drawService.executeDraw,
        onSuccess: handleSuccess,
        onError: (err: any) => {
            if (err.response?.status === 409 && err.response?.data?.rerun_eligible) {
                if (window.confirm("A draw for this date already exists. Do you want to rerun it? This will create a new set of winners.")) {
                    const payload: DrawRequest = {
                        draw_date: selectedDate,
                        prize_structure_id: selectedPrizeStructure!.ID,
                    };
                    rerunMutation.mutate({ drawId: err.response.data.draw_id, payload });
                } else {
                    setError("Draw was not rerun.");
                }
            } else {
                setError(err.response?.data?.error || 'The draw execution failed.');
            }
            setStage('idle');
        },
    });

    const rerunMutation = useMutation<DrawResponse, Error, { drawId: string; payload: DrawRequest }>({
        mutationFn: drawService.rerunDraw,
        onSuccess: handleSuccess,
        onError: (err: any) => {
            setError(err.response?.data?.error || 'The rerun failed.');
            setStage('idle');
        },
    });

    const handleExecute = () => {
        if (!selectedDate || !selectedPrizeStructure) {
            setError("Please select a date and a valid prize structure.");
            return;
        }
        setError(null);
        setStage('idle');
        
        const payload: DrawRequest = {
            draw_date: selectedDate,
            prize_structure_id: selectedPrizeStructure.ID,
        };
        drawMutation.mutate(payload);
    };
    
    const canRunDraw = user?.role === 'SUPERADMIN';
    const finalLoading = drawMutation.isLoading || rerunMutation.isLoading;
    const finalResult = rerunMutation.data || drawMutation.data;
    const finalIsError = drawMutation.isError || rerunMutation.isError;

    const formattedResults = stage === 'results' && finalResult && selectedPrizeStructure ? 
        processDrawResults(finalResult.winners, selectedPrizeStructure.Tiers) : null;

    return (
        <div className="space-y-6">
            <div className="bg-white shadow-md rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-800">Draw Management (Live Feed)</h1>
                <p className="text-sm text-gray-500 mt-1">This page executes a draw using the live data from the main data feed (PostHog).</p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div>
                        <label htmlFor="draw-date" className="block text-sm font-medium text-gray-700">1. Select Draw Date</label>
                        <input type="date" id="draw-date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="prize-structure" className="block text-sm font-medium text-gray-700">2. Select Prize Structure</label>
                        <select id="prize-structure" value={selectedPrizeStructure?.ID || ''} onChange={(e) => setSelectedPrizeStructure(validPrizeStructures?.find(p => p.ID === e.target.value) || null)} disabled={isLoadingStructures || !validPrizeStructures || validPrizeStructures.length === 0} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                            <option value="">{isLoadingStructures ? 'Loading...' : 'Select a structure...'}</option>
                            {validPrizeStructures?.map(ps => <option key={ps.ID} value={ps.ID}>{ps.Name}</option>)}
                        </select>
                        {!isLoadingStructures && validPrizeStructures?.length === 0 && <p className="text-xs text-red-500 mt-1">No valid prize structures for this day.</p>}
                    </div>
                </div>
                <div className="mt-6 border-t pt-6">
                    <button onClick={handleExecute} disabled={!canRunDraw || !selectedDate || !selectedPrizeStructure || finalLoading} className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                        {finalLoading ? <><Spinner /><span>Running Draw...</span></> : 'Execute Draw'}
                    </button>
                    {!canRunDraw && <p className="text-center text-sm text-yellow-600 mt-2">Only SUPERADMIN can execute draws.</p>}
                </div>
            </div>

            {finalIsError && error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-6 rounded-md" role="alert"><h3 className="font-bold">Error</h3><p>{error}</p></div>}
            
            {stage === 'spinning' && (
                <div className="bg-white shadow-md rounded-lg p-6 mt-6 flex justify-center items-center flex-col">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Executing Secure Draw...</h2>
                    <DrawWheel onSpinComplete={() => {}} />
                </div>
            )}

            {stage === 'results' && formattedResults && (
                <div className="bg-white shadow-md rounded-lg p-6 mt-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Draw Results for {selectedDate}</h2>
                    <div className="space-y-6">
                        {Object.entries(formattedResults).map(([tierName, prizeRows]) => {
                            const tierInfo = selectedPrizeStructure?.Tiers.find(t=>t.TierName === tierName);
                            const runnerUpCount = tierInfo?.RunnerUpCount || 0;
                            return (
                                <div key={tierName}>
                                    <h3 className="font-semibold text-lg text-indigo-800 border-b pb-1 mb-2">{tierName}</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead>
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-600">Winner</th>
                                                    {Array(runnerUpCount).fill(0).map((_, i) => (
                                                        <th key={i} className="px-3 py-2 text-left text-sm font-semibold text-gray-600">Runner Up {i + 1}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {prizeRows.map((row, rowIndex) => (
                                                    <tr key={rowIndex} className="border-t">
                                                        {row.map((msisdn, colIndex) => (
                                                            <td key={colIndex} className="px-3 py-3 font-mono text-sm"><MaskedMSISDN msisdn={msisdn} /></td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}