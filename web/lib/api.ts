import {
  LoanApplicationInput,
  FullPredictionResponse,
  EligibilityResponse,
  MaxEMIResponse,
  ModelPerformanceResponse,
  ExplorerStatsResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error (${res.status}): ${errText || res.statusText}`);
  }
  return res.json();
}

export async function fetchFullPrediction(
  data: LoanApplicationInput
): Promise<FullPredictionResponse> {
  const res = await fetch(`${API_BASE}/predict/full`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<FullPredictionResponse>(res);
}

export async function fetchEligibility(
  data: LoanApplicationInput
): Promise<EligibilityResponse> {
  const res = await fetch(`${API_BASE}/predict/eligibility`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<EligibilityResponse>(res);
}

export async function fetchMaxEMI(
  data: LoanApplicationInput
): Promise<MaxEMIResponse> {
  const res = await fetch(`${API_BASE}/predict/max-emi`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<MaxEMIResponse>(res);
}

export async function fetchModelPerformance(): Promise<ModelPerformanceResponse> {
  const res = await fetch(`${API_BASE}/models/performance`, {
    method: "GET",
  });
  return handleResponse<ModelPerformanceResponse>(res);
}

export async function fetchExplorerStats(): Promise<ExplorerStatsResponse> {
  const res = await fetch(`${API_BASE}/explorer/stats`, {
    method: "GET",
  });
  return handleResponse<ExplorerStatsResponse>(res);
}
