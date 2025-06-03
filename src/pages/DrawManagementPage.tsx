import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { executeDraw, rerunDraw } from "@services/drawService";
import Spinner from "@components/Spinner";
import MaskedMSISDN from "@components/MaskedMSISDN";
import CsvDrawUploader from "@components/CsvDrawUploader";
import { DrawRequest, DrawResponse } from "@types/Draw";

export default function DrawManagementPage() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [result, setResult] = useState<DrawResponse | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mutation for PostHog/Date‐only draw
  const drawMutation = useMutation(executeDraw, {
    onSuccess: (data: DrawResponse) => {
      setShowAnimation(false);
      setResult(data);
    },
    onError: (err: any) => {
      setShowAnimation(false);
      setError(err.response?.data?.error || "Draw failed");
    },
  });

  // Mutation for rerun
  const rerunMutation = useMutation((id: string) => rerunDraw(id), {
    onSuccess: (data: DrawResponse) => {
      setShowAnimation(false);
      setResult(data);
    },
    onError: (err: any) => {
      setShowAnimation(false);
      setError(err.response?.data?.error || "Rerun failed");
    },
  });

  // Execute a date‐only draw (PostHog) with 3s delay for animation
  const handleExecute = () => {
    if (!selectedDate) return;
    setError(null);
    setResult(null);
    setShowAnimation(true);
    setTimeout(() => {
      drawMutation.mutate({ date: selectedDate });
    }, 3000);
  };

  // Rerun an existing draw
  const handleRerun = () => {
    if (!result) return;
    if (!confirm("This draw has already been run. Confirm rerun?")) return;
    setError(null);
    setShowAnimation(true);
    setTimeout(() => {
      rerunMutation.mutate(result.drawId);
    }, 3000);
  };

  // Called by CsvDrawUploader: directly runs a CSV‐based draw
  const onCsvDraw = (payload: { draw_date: string; msisdn_entries: { msisdn: string; points: number }[] }) => {
    setError(null);
    setResult(null);
    setShowAnimation(true);
    // Reuse the same executeDraw mutation, it expects { date, msisdn_entries }
    setTimeout(() => {
      drawMutation.mutate({
        date: payload.draw_date,
        msisdns: payload.msisdn_entries,
      } as unknown as DrawRequest);
      // We coerce to DrawRequest; your service layer should handle the query shape.
    }, 3000);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Draw Management</h2>

      {/* ─── CSV Uploader (msisdn,points) ───────────────────────────────────────────────────── */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-xl font-medium mb-2">Upload CSV for Weighted Draw</h3>
        <CsvDrawUploader apiUrl={import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1"} onSubmit={onCsvDraw} />
        {error && <p className="mt-3 text-red-500">{error}</p>}
      </div>

      {/* ─── POSTHOG / DATE‐ONLY Draw ───────────────────────────────────────────────────────── */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <label className="block text-gray-700 mb-2">Or: Select Draw Date (PostHog)</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border rounded"
        />
        <div className="mt-4 space-x-2">
          <button
            onClick={handleExecute}
            disabled={drawMutation.isLoading || rerunMutation.isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            {showAnimation ? <Spinner /> : "Execute Draw"}
          </button>
          {result && (
            <button
              onClick={handleRerun}
              disabled={rerunMutation.isLoading}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              {showAnimation ? <Spinner /> : "Rerun Draw"}
            </button>
          )}
        </div>
        {error && <p className="mt-3 text-red-500">{error}</p>}
      </div>

      {/* ─── Show Results ────────────────────────────────────────────────────────────────────── */}
      {result && (
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-xl font-semibold mb-2">Draw Results for {result.date}</h3>
          <table className="min-w-full border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 border">Prize Tier</th>
                <th className="px-4 py-2 border">Position</th>
                <th className="px-4 py-2 border">MSISDN</th>
              </tr>
            </thead>
            <tbody>
              {result.winners.map((w, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
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
