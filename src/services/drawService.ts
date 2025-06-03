// src/services/drawService.ts
import { apiClient } from "./apiClient";
import { DrawRequest, DrawResponse } from "@types/Draw";

/**
 * Execute a draw. If `payload.msisdn_entries` is present, the backend will
 * run a weighted draw using those CSV entries (each with msisdn + points).
 * Otherwise, it will fetch eligible MSISDNs from PostHog for the given date.
 */
export function executeDraw(payload: DrawRequest): Promise<DrawResponse> {
  // The backend expects { draw_date: string, msisdn_entries?: Array<{ msisdn, points }> }
  const body: any = {
    draw_date: payload.date,
  };
  if (payload.msisdn_entries && payload.msisdn_entries.length > 0) {
    body.msisdn_entries = payload.msisdn_entries;
  }

  return apiClient
    .post<DrawResponse>("/draws/execute", body)
    .then((res) => res.data);
}

/** Rerun an existing draw by drawId */
export function rerunDraw(drawId: string): Promise<DrawResponse> {
  return apiClient
    .post<DrawResponse>(`/draws/rerun/${drawId}`, {})
    .then((res) => res.data);
}
