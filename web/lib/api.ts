import {
  LoanApplicationInput,
  FullPredictionResponse,
  EligibilityResponse,
  MaxEMIResponse,
  ModelPerformanceResponse,
  ExplorerStatsResponse,
} from "./types";

/**
 * EMIPredict AI - Frontend API Client
 * Dynamically resolves API endpoints for Local Development & Render Production Cloud
 */

export function getApiBase(): string {
  // 1. Explicit environment variable
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }

  // 2. Client-side browser runtime detection
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // When running locally in development
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0") {
      return "http://127.0.0.1:8000";
    }
    // When deployed online (e.g. Render, Vercel, Railway)
    return "https://emipredict-api.onrender.com";
  }

  // 3. Fallback for SSR / build time
  return "https://emipredict-api.onrender.com";
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error (${res.status}): ${errText || res.statusText}`);
  }
  return res.json();
}

async function safeFetch(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (err: any) {
    if (err?.name === "TypeError" || err?.message?.includes("Failed to fetch")) {
      const isLocal =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
      const target = isLocal
        ? "local FastAPI server (http://127.0.0.1:8000)"
        : "cloud API backend (https://emipredict-api.onrender.com)";
      throw new Error(
        `Unable to reach the ML backend (${target}). If the free-tier cloud instance was sleeping, please wait ~30 seconds and try again.`
      );
    }
    throw err;
  }
}

export async function fetchFullPrediction(
  data: LoanApplicationInput
): Promise<FullPredictionResponse> {
  const base = getApiBase();
  const res = await safeFetch(`${base}/predict/full`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<FullPredictionResponse>(res);
}

export async function fetchEligibility(
  data: LoanApplicationInput
): Promise<EligibilityResponse> {
  const base = getApiBase();
  const res = await safeFetch(`${base}/predict/eligibility`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<EligibilityResponse>(res);
}

export async function fetchMaxEMI(
  data: LoanApplicationInput
): Promise<MaxEMIResponse> {
  const base = getApiBase();
  const res = await safeFetch(`${base}/predict/max-emi`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<MaxEMIResponse>(res);
}

export async function fetchModelPerformance(): Promise<ModelPerformanceResponse> {
  const base = getApiBase();
  const res = await safeFetch(`${base}/models/performance`, {
    method: "GET",
  });
  return handleResponse<ModelPerformanceResponse>(res);
}

export async function fetchExplorerStats(): Promise<ExplorerStatsResponse> {
  const base = getApiBase();
  const res = await safeFetch(`${base}/explorer/stats`, {
    method: "GET",
  });
  return handleResponse<ExplorerStatsResponse>(res);
}

