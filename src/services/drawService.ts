// src/services/drawService.ts
import apiClient from './apiClient';

export interface CsvUploadPayload {
  file: File;
  drawDate: string; // "2025-06-04"
  prizeStructureID: string;
}

export interface ExecuteDrawPayload {
  drawDate: string;
  prizeStructureID: string;
}

/**
 * 1) POST /api/v1/draws/upload-csv
 *    (expects FormData: file, draw_date, prize_structure_id)
 */
export function uploadCsvEntries(payload: CsvUploadPayload): Promise<void> {
  const form = new FormData();
  form.append('file', payload.file);
  form.append('draw_date', payload.drawDate);
  form.append('prize_structure_id', payload.prizeStructureID);

  return apiClient
    .post('/draws/upload-csv', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(() => {});
}

/**
 * 2) POST /api/v1/draws/execute
 *    (expects JSON body: { draw_date: string, prize_structure_id: string })
 */
export function executeDraw(payload: ExecuteDrawPayload): Promise<void> {
  return apiClient.post('/draws/execute', {
    draw_date: payload.drawDate,
    prize_structure_id: payload.prizeStructureID,
  }).then(() => {});
}
