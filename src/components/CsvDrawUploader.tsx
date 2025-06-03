// src/components/CsvDrawUploader.tsx
import React, { useState } from "react";

type MSISDNEntry = {
  msisdn: string;
  points: number;
};

type Props = {
  apiUrl: string; // e.g. "http://localhost:8080/api/v1"
};

export default function CsvDrawUploader({ apiUrl }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [drawDate, setDrawDate] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");

  // Handle file selection
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
    setStatusMessage("");
  }

  // Parse CSV: expects header row: msisdn,points
  function parseCsv(file: File): Promise<MSISDNEntry[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
        const list: MSISDNEntry[] = [];
        for (let i = 1; i < lines.length; i++) {
          // split by comma (no quoted fields handling here)
          const cols = lines[i].split(",");
          if (cols.length < 2) continue;
          const msisdn = cols[0].trim();
          const pts = parseInt(cols[1].trim(), 10);
          if (msisdn && !isNaN(pts) && pts > 0) {
            list.push({ msisdn, points: pts });
          }
        }
        resolve(list);
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      reader.readAsText(file);
    });
  }

  // Handle “Run Draw” click
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!drawDate) {
      setStatusMessage("Please select a draw date.");
      return;
    }
    if (!selectedFile) {
      setStatusMessage("Please select a CSV file.");
      return;
    }

    setStatusMessage("Parsing CSV...");
    let entries: MSISDNEntry[];
    try {
      entries = await parseCsv(selectedFile);
      if (entries.length === 0) {
        setStatusMessage("CSV contains no valid msisdn & points rows.");
        return;
      }
    } catch (err) {
      setStatusMessage("Error parsing CSV: " + (err as Error).message);
      return;
    }

    setStatusMessage(`Found ${entries.length} rows. Executing draw...`);

    // Send { draw_date, msisdn_entries } to backend
    try {
      const resp = await fetch(`${apiUrl}/draws/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draw_date: drawDate,
          msisdn_entries: entries,
        }),
      });
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`${resp.status} ${errText}`);
      }
      const data = await resp.json();
      setStatusMessage("Draw succeeded. Check console for winners.");
      console.log("Draw winners:", data.winners);
    } catch (err) {
      setStatusMessage("Draw failed: " + (err as Error).message);
    }
  }

  return (
    <div className="p-4 bg-white shadow-md rounded-lg max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Upload CSV for Draw</h2>
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="block font-medium mb-1" htmlFor="draw-date">
            Draw Date:
          </label>
          <input
            type="date"
            id="draw-date"
            value={drawDate}
            onChange={(e) => setDrawDate(e.target.value)}
            className="border px-2 py-1 w-full rounded"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Choose a date matching an existing prize structure.
          </p>
        </div>

        <div className="mb-3">
          <label className="block font-medium mb-1" htmlFor="csv-file">
            Select CSV File (msisdn,points):
          </label>
          <input
            type="file"
            id="csv-file"
            accept=".csv"
            onChange={onFileChange}
          />
          <p className="text-sm text-gray-500 mt-1">
            CSV must have two columns: <code>msisdn,points</code> (e.g.
            <code>08012345678,3</code>).
          </p>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Run Draw
        </button>
      </form>

      {statusMessage && (
        <div className="mt-4 text-sm text-gray-800">{statusMessage}</div>
      )}
    </div>
  );
}
