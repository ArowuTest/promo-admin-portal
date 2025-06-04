// src/pages/CsvUploadPage.tsx

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Papa from 'papaparse'; // or whatever CSV‐parser you already used
import { uploadCsvEntries } from '@services/drawService'; 
import Spinner from '@components/Spinner';

interface CsvRow {
  msisdn: string;
  points: number;
}

export default function CsvUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const uploadMutation = useMutation(uploadCsvEntries, {
    onSuccess: () => {
      setSuccess('CSV uploaded successfully.');
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'CSV upload failed');
      setSuccess(null);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a CSV file first.');
      return;
    }
    setError(null);
    setSuccess(null);

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.map((row) => ({
          msisdn: row.msisdn.trim(),
          points: Number(row.points),
        }));
        uploadMutation.mutate(data);
      },
      error: (err) => {
        setError('Error parsing CSV: ' + err.message);
      },
    });
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Upload CSV for Draw Entries</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">CSV File (msisdn, points)</label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <button
          type="submit"
          disabled={uploadMutation.isLoading}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          {uploadMutation.isLoading ? <Spinner /> : 'Upload CSV'}
        </button>
      </form>

      {error && <p className="mt-4 text-red-500">{error}</p>}
      {success && <p className="mt-4 text-green-600">{success}</p>}
    </div>
  );
}
