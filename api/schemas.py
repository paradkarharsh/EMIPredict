"""
Pydantic Schemas for EMIPredict AI API.
Defines input payloads and response formats for inference, metrics, and dataset stats.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Dict, List, Optional, Any


class LoanApplicationInput(BaseModel):
    """22 applicant and loan request features matching the dataset schema."""
    # 1. Demographics
    age: int = Field(..., ge=18, le=100, description="Applicant age in years")
    gender: str = Field(..., description="Gender: Male, Female, Other")
    marital_status: str = Field(..., description="Marital Status: Single, Married")
    education: str = Field(..., description="Education Level: High School, Graduate, Post Graduate, Professional")

    # 2. Employment & Income
    monthly_salary: float = Field(..., ge=5000, description="Gross monthly income in INR")
    employment_type: str = Field(..., description="Employment Type: Private, Government, Self-employed")
    years_of_employment: int = Field(..., ge=0, le=60, description="Total years of work experience")
    company_type: str = Field(..., description="Company Type: Private Ltd, MNC, Public Sector, Startup")

    # 3. Housing & Family
    house_type: str = Field(..., description="House Ownership: Rented, Own, Family")
    monthly_rent: float = Field(default=0.0, ge=0, description="Monthly rent in INR")
    family_size: int = Field(..., ge=1, le=20, description="Total household members")
    dependents: int = Field(..., ge=0, le=15, description="Number of financial dependents")

    # 4. Monthly Obligations
    school_fees: float = Field(default=0.0, ge=0, description="Monthly school fees in INR")
    college_fees: float = Field(default=0.0, ge=0, description="Monthly college fees in INR")
    travel_expenses: float = Field(default=0.0, ge=0, description="Monthly commuting expenses in INR")
    groceries_utilities: float = Field(default=0.0, ge=0, description="Monthly groceries and utility bills in INR")
    other_monthly_expenses: float = Field(default=0.0, ge=0, description="Other recurring monthly expenses in INR")

    # 5. Credit Profile & Request Details
    existing_loans: str = Field(..., description="Existing active loans: Yes, No")
    current_emi_amount: float = Field(default=0.0, ge=0, description="Current monthly EMI obligations in INR")
    credit_score: int = Field(..., ge=300, le=850, description="CIBIL / Credit score (300-850)")
    bank_balance: float = Field(default=0.0, ge=0, description="Liquid savings bank balance in INR")
    emergency_fund: float = Field(default=0.0, ge=0, description="Emergency fund reserve in INR")
    emi_scenario: str = Field(..., description="Loan domain: E-commerce Shopping EMI, Home Appliances EMI, Vehicle EMI, Personal Loan EMI, Education EMI")
    requested_amount: float = Field(..., ge=1000, description="Requested principal loan amount in INR")
    requested_tenure: int = Field(..., ge=1, le=120, description="Requested loan tenure in months")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "age": 32,
                "gender": "Male",
                "marital_status": "Single",
                "education": "Graduate",
                "monthly_salary": 65000.0,
                "employment_type": "Private",
                "years_of_employment": 6,
                "company_type": "Private Ltd",
                "house_type": "Rented",
                "monthly_rent": 12000.0,
                "family_size": 3,
                "dependents": 1,
                "school_fees": 3000.0,
                "college_fees": 0.0,
                "travel_expenses": 4000.0,
                "groceries_utilities": 10000.0,
                "other_monthly_expenses": 3000.0,
                "existing_loans": "Yes",
                "current_emi_amount": 8000.0,
                "credit_score": 740,
                "bank_balance": 120000.0,
                "emergency_fund": 50000.0,
                "emi_scenario": "Personal Loan EMI",
                "requested_amount": 150000.0,
                "requested_tenure": 24
            }
        }
    )


class FinancialRatios(BaseModel):
    total_monthly_expenses: float
    disposable_income: float
    projected_requested_emi: float
    debt_to_income_ratio: float
    expense_to_income_ratio: float
    affordability_ratio: float
    composite_risk_score: float


class EligibilityResponse(BaseModel):
    prediction: str = Field(..., description="Eligible, High_Risk, or Not_Eligible")
    prediction_code: int = Field(..., description="0: Eligible, 1: High_Risk, 2: Not_Eligible")
    confidence: float = Field(..., description="Probability of predicted class")
    probabilities: Dict[str, float] = Field(..., description="Probability distribution across classes")
    financial_ratios: FinancialRatios
    explanation: str = Field(..., description="Plain-language underwriting rationale")


class SensitivityPoint(BaseModel):
    tenure_months: int
    required_emi: float
    is_affordable: bool


class MaxEMIResponse(BaseModel):
    max_monthly_emi: float = Field(..., description="Maximum safe monthly installment cap in INR")
    disposable_income: float
    foir_percentage: float
    buffer_remaining: float
    sensitivity_curve: List[SensitivityPoint]
    explanation: str


class FullPredictionResponse(BaseModel):
    eligibility: EligibilityResponse
    affordability: MaxEMIResponse


class ModelMetricItem(BaseModel):
    model_name: str
    is_production: bool = False
    accuracy: Optional[float] = None
    f1_score: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    roc_auc: Optional[float] = None
    rmse: Optional[float] = None
    mae: Optional[float] = None
    r2_score: Optional[float] = None
    mape: Optional[float] = None
    run_id: Optional[str] = None


class ModelPerformanceResponse(BaseModel):
    classification_models: List[ModelMetricItem]
    regression_models: List[ModelMetricItem]
    winning_classifier: str
    winning_regressor: str
    figures: List[str]


class ExplorerStatsResponse(BaseModel):
    total_records: int
    eligibility_breakdown: Dict[str, int]
    scenario_breakdown: Dict[str, int]
    mean_salary: float
    mean_credit_score: float
    mean_requested_amount: float
    scatter_sample: List[Dict[str, Any]]
    credit_box_stats: Dict[str, Dict[str, float]]
