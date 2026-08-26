export interface LoanApplicationInput {
  // 1. Demographics
  age: number;
  gender: string;
  marital_status: string;
  education: string;

  // 2. Employment & Income
  monthly_salary: number;
  employment_type: string;
  years_of_employment: number;
  company_type: string;

  // 3. Housing & Family
  house_type: string;
  monthly_rent: number;
  family_size: number;
  dependents: number;

  // 4. Monthly Obligations
  school_fees: number;
  college_fees: number;
  travel_expenses: number;
  groceries_utilities: number;
  other_monthly_expenses: number;

  // 5. Credit Profile & Request Details
  existing_loans: string;
  current_emi_amount: number;
  credit_score: number;
  bank_balance: number;
  emergency_fund: number;
  emi_scenario: string;
  requested_amount: number;
  requested_tenure: number;
}

export interface FinancialRatios {
  total_monthly_expenses: number;
  disposable_income: number;
  projected_requested_emi: number;
  debt_to_income_ratio: number;
  expense_to_income_ratio: number;
  affordability_ratio: number;
  composite_risk_score: number;
}

export interface EligibilityResponse {
  prediction: "Eligible" | "High_Risk" | "Not_Eligible" | string;
  prediction_code: number;
  confidence: number;
  probabilities: {
    Eligible: number;
    High_Risk: number;
    Not_Eligible: number;
    [key: string]: number;
  };
  financial_ratios: FinancialRatios;
  explanation: string;
}

export interface SensitivityPoint {
  tenure_months: number;
  required_emi: number;
  is_affordable: boolean;
}

export interface MaxEMIResponse {
  max_monthly_emi: number;
  disposable_income: number;
  foir_percentage: number;
  buffer_remaining: number;
  sensitivity_curve: SensitivityPoint[];
  explanation: string;
}

export interface FullPredictionResponse {
  eligibility: EligibilityResponse;
  affordability: MaxEMIResponse;
}

export interface ModelMetricItem {
  model_name: string;
  is_production: boolean;
  accuracy?: number;
  f1_score?: number;
  precision?: number;
  recall?: number;
  roc_auc?: number;
  rmse?: number;
  mae?: number;
  r2_score?: number;
  mape?: number;
  run_id?: string;
}

export interface ModelPerformanceResponse {
  classification_models: ModelMetricItem[];
  regression_models: ModelMetricItem[];
  winning_classifier: string;
  winning_regressor: string;
  figures: string[];
}

export interface ScatterPoint {
  monthly_salary: number;
  max_monthly_emi: number;
  credit_score: number;
  emi_eligibility: string;
  emi_scenario: string;
}

export interface BoxStats {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
}

export interface ExplorerStatsResponse {
  total_records: number;
  eligibility_breakdown: Record<string, number>;
  scenario_breakdown: Record<string, number>;
  mean_salary: number;
  mean_credit_score: number;
  mean_requested_amount: number;
  scatter_sample: ScatterPoint[];
  credit_box_stats: Record<string, BoxStats>;
}
