import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as drawService from '@services/drawService';
import { fetchValidPrizeStructuresForDate } from '@services/prizeService';
import type { PrizeStructure, PrizeTier } from '@types/Prize';
import type { DrawRequest, DrawResponse, MSISDNEntry, DrawWinner } from '@types/Draw';
import Spinner from '@components/Spinner';
import MaskedMSISDN from '@components/MaskedMSISDN';
import { useAuth } from '@contexts/AuthContext';
import Papa from 'papaparse';
import { ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';
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

export default function CsvUploadPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedPrizeStructure, setSelectedPrizeStructure] = useState<PrizeStructure | null>(null);
    const [csvEntries, setCsvEntries] = useState<MSISDNEntry[] | null>(null);
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [stage, setStage] = useState<'idle' | 'spinning' | 'results'>('idle');
    const [rerunInfo, setRerunInfo] = useState<{ drawId: string } | null>(null); // State to manage rerun
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: validPrizeStructures, isLoading: isLoadingStructures } = useQuery<PrizeStructure[], Error>({
        queryKey: ['valid-prize-structures-csv', selectedDate],
        queryFn: () => fetchValidPrizeStructuresForDate(selectedDate),
        enabled: !!selectedDate,
    });
    
    useEffect(() => {
        if (validPrizeStructures && validPrizeStructures.length > 0) {
            setSelectedPrizeStructure(validPrizeStructures[0]);
        } else {
            setSelectedPrizeStructure(null);
        }
        setRerunInfo(null); // Reset rerun state if date changes
    }, [validPrizeStructures, selectedDate]);

    const handleSuccess = (data: DrawResponse) => {
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
                if (window.confirm("A draw for this date already exists. Do you want to rerun it?")) {
                    setRerunInfo({ drawId: err.response.data.draw_id });
                    setError("Rerun confirmed. Please click 'Execute Draw' again to proceed.");
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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            drawMutation.reset();
            rerunMutation.reset();
            setError(null);
            setStage('idle');
            setRerunInfo(null);
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                complete: (results) => {
                    const validEntries = results.data
                        .map((row: any) => ({ msisdn: String(row.msisdn).trim(), points: Number(row.points) }))
                        .filter(row => row.msisdn && row.points > 0);
                    setCsvEntries(validEntries as MSISDNEntry[]);
                },
                error: () => { setError(`CSV Parsing Error.`); setCsvEntries(null); }
            });
        }
    };

    const handleExecute = () => {
        if (!selectedDate || !selectedPrizeStructure) { setError("Please select a date and a valid prize structure."); return; }
        if (!csvEntries || csvEntries.length === 0) { setError("Please upload a CSV file with valid participant entries."); return; }
        setError(null);
        setStage('idle');

        const payload: DrawRequest = {
            draw_date: selectedDate,
            prize_structure_id: selectedPrizeStructure.ID,
            msisdn_entries: csvEntries,
        };

        if (rerunInfo) {
            rerunMutation.mutate({ drawId: rerunInfo.drawId, payload });
        } else {
            drawMutation.mutate(payload);
        }
    };
    
    const canRunDraw = user?.role === 'SUPERADMIN';
    const finalLoading = drawMutation.isLoading || rerunMutation.isLoading;
    const finalResult = rerunMutation.data || drawMutation.data;
    const formattedResults = stage === 'results' && finalResult && selectedPrizeStructure ? 
        processDrawResults(finalResult.winners, selectedPrizeStructure.Tiers) : null;

    return (
        <div className="space-y-6">
            <div className="bg-white shadow-md rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-800">Execute Draw with CSV</h1>
                <p className="text-sm text-gray-500 mt-1">This page allows you to manually run a draw by uploading a CSV of participants.</p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="draw-date-csv" className="block text-sm font-medium text-gray-700">1. Select Draw Date</label>
                            <input type="date" id="draw-date-csv" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                        </div>
                        <div>
                            <label htmlFor="prize-structure-csv" className="block text-sm font-medium text-gray-700">2. Select Prize Structure</label>
                            <select id="prize-structure-csv" value={selectedPrizeStructure?.ID || ''} onChange={(e) => setSelectedPrizeStructure(validPrizeStructures?.find(p => p.ID === e.target.value) || null)} disabled={isLoadingStructures || !validPrizeStructures || validPrizeStructures.length === 0} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                <option value="">{isLoadingStructures ? 'Loading...' : 'Select a structure...'}</option>
                                {validPrizeStructures?.map(ps => <option key={ps.ID} value={ps.ID}>{ps.Name}</option>)}
                            </select>
                            {!isLoadingStructures && validPrizeStructures?.length === 0 && <p className="text-xs text-red-500 mt-1">No valid prize structures for this day.</p>}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">3. Upload Participants CSV</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <ArrowUpOnSquareIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600"><label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"><span>Upload a file</span><input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv" onChange={handleFileChange} ref={fileInputRef}/></label><p className="pl-1">or drag and drop</p></div>
                                <p className="text-xs text-gray-500">{fileName ? `${fileName} (${csvEntries?.length || 0} valid records)` : 'CSV with msisdn,points columns'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-6 border-t pt-6">
                    <button onClick={handleExecute} disabled={!canRunDraw || !selectedDate || !selectedPrizeStructure || !csvEntries || finalLoading} className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400">
                        {finalLoading ? <><Spinner /><span>Running Draw...</span></> : 'Execute Draw with CSV'}
                    </button>
                    {!canRunDraw && <p className="text-center text-sm text-yellow-600 mt-2">Only SUPERADMIN can execute draws.</p>}
                </div>
            </div>
            
            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-6 rounded-md" role="alert"><h3 className="font-bold">Error</h3><p>{error}</p></div>}
            
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