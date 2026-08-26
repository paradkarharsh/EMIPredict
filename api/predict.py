"""
Prediction Router for EMIPredict AI.
Handles Classification (Eligibility) and Regression (Max Safe EMI) endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends
import pandas as pd
import numpy as np
from typing import Dict, Any, List

from api.schemas import (
    LoanApplicationInput,
    EligibilityResponse,
    MaxEMIResponse,
    FullPredictionResponse,
    FinancialRatios,
    SensitivityPoint
)

router = APIRouter(prefix="/predict", tags=["Prediction"])

LABEL_MAP = {
    0: "Eligible",
    1: "High_Risk",
    2: "Not_Eligible"
}

def compute_financial_ratios(data: LoanApplicationInput) -> Dict[str, Any]:
    """Calculates deterministic cashflow ratios and underwriting variables."""
    tot_exp = (
        data.monthly_rent + data.school_fees + data.college_fees +
        data.travel_expenses + data.groceries_utilities + data.other_monthly_expenses
    )
    disp_income = data.monthly_salary - tot_exp - data.current_emi_amount

    annual_rate = 0.12
    monthly_rate = annual_rate / 12.0
    tenure = max(1, data.requested_tenure)
    pow_factor = (1 + monthly_rate) ** tenure
    req_emi = data.requested_amount * monthly_rate * pow_factor / (pow_factor - 1)

    dti = (data.current_emi_amount + req_emi) / (data.monthly_salary + 1e-5) * 100.0
    exp_ratio = tot_exp / (data.monthly_salary + 1e-5) * 100.0
    afford_ratio = max(0.0, disp_income) / (data.monthly_salary + 1e-5) * 100.0

    # Composite risk score (0-100)
    c_score_pts = np.clip((data.credit_score - 300) / 550.0 * 50.0, 0, 50)
    emp_pts = np.clip(data.years_of_employment / 15.0 * 15.0, 0, 15)
    emp_bonus = 10.0 if data.employment_type == "Government" else (7.0 if data.employment_type == "Private" else 4.0)
    loan_pen = 0.0 if data.existing_loans == "Yes" else 15.0
    risk_score = float(np.clip(c_score_pts + emp_pts + emp_bonus + loan_pen, 0, 100))

    return {
        "total_monthly_expenses": round(tot_exp, 2),
        "disposable_income": round(disp_income, 2),
        "projected_requested_emi": round(req_emi, 2),
        "debt_to_income_ratio": round(dti, 2),
        "expense_to_income_ratio": round(exp_ratio, 2),
        "affordability_ratio": round(afford_ratio, 2),
        "composite_risk_score": round(risk_score, 1)
    }

def generate_eligibility_explanation(label: str, ratios: Dict[str, Any], credit_score: int) -> str:
    """Generates an insightful plain-language underwriting rationale."""
    dti = ratios["debt_to_income_ratio"]
    disp = ratios["disposable_income"]
    
    if label == "Eligible":
        return (
            f"Applicant qualifies for standard approval with a healthy CIBIL score of {credit_score} "
            f"and a manageable projected debt-to-income ratio of {dti:.1f}%. "
            f"Net monthly disposable surplus of ₹{disp:,.0f} provides strong cushion against default."
        )
    elif label == "High_Risk":
        if credit_score < 680:
            return (
                f"Applicant exhibits elevated risk due to a subprime/near-prime credit score of {credit_score}. "
                f"Projected total debt obligation represents {dti:.1f}% of gross income. "
                "Recommend manual review, tenure extension, or co-borrower endorsement."
            )
        else:
            return (
                f"Credit score of {credit_score} is solid, but high debt commitments result in a {dti:.1f}% DTI ratio. "
                "Applicant qualifies under high-risk tier; consider reducing requested principal or extending tenure."
            )
    else:
        return (
            f"Application declined due to unsustainable leverage ({dti:.1f}% DTI) and negative or minimal disposable surplus (₹{disp:,.0f}). "
            f"Credit profile (Score: {credit_score}) does not offset current active commitments."
        )

def generate_sensitivity_curve(requested_amount: float, max_safe_emi: float) -> List[SensitivityPoint]:
    """Generates amortization curve across standard repayment horizons."""
    tenures = [6, 12, 18, 24, 36, 48, 60, 72, 84]
    annual_rate = 0.12
    monthly_rate = annual_rate / 12.0
    curve = []

    for t in tenures:
        pf = (1 + monthly_rate) ** t
        eq_emi = requested_amount * monthly_rate * pf / (pf - 1)
        curve.append(SensitivityPoint(
            tenure_months=t,
            required_emi=round(eq_emi, 2),
            is_affordable=bool(eq_emi <= max_safe_emi)
        ))
    return curve

def get_model_pipeline():
    from api.main import model_store
    if not model_store.get("ready", False):
        raise HTTPException(status_code=503, detail="ML inference models not initialized.")
    return model_store["classifier"], model_store["regressor"], model_store["preprocessor"]


@router.post("/eligibility", response_model=EligibilityResponse)
async def predict_eligibility(payload: LoanApplicationInput):
    """Evaluates 3-tier credit risk classification (Eligible, High_Risk, Not_Eligible)."""
    classifier, _, preprocessor = get_model_pipeline()
    
    input_dict = payload.model_dump()
    raw_df = pd.DataFrame([input_dict])

    try:
        X_trans = preprocessor.transform(raw_df)
        pred_idx = int(classifier.predict(X_trans)[0])
        label = LABEL_MAP.get(pred_idx, "Unknown")

        if hasattr(classifier, "predict_proba"):
            raw_probs = classifier.predict_proba(X_trans)[0]
            probs = {
                "Eligible": float(raw_probs[0]),
                "High_Risk": float(raw_probs[1]),
                "Not_Eligible": float(raw_probs[2])
            }
            confidence = float(raw_probs[pred_idx])
        else:
            probs = {"Eligible": 0.333, "High_Risk": 0.333, "Not_Eligible": 0.334}
            confidence = 0.34

        ratios = compute_financial_ratios(payload)
        explanation = generate_eligibility_explanation(label, ratios, payload.credit_score)

        return EligibilityResponse(
            prediction=label,
            prediction_code=pred_idx,
            confidence=round(confidence, 4),
            probabilities={k: round(v, 4) for k, v in probs.items()},
            financial_ratios=FinancialRatios(**ratios),
            explanation=explanation
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification inference failure: {str(e)}")


@router.post("/max-emi", response_model=MaxEMIResponse)
async def predict_max_emi(payload: LoanApplicationInput):
    """Predicts continuous maximum safe monthly EMI cap in INR."""
    _, regressor, preprocessor = get_model_pipeline()

    input_dict = payload.model_dump()
    raw_df = pd.DataFrame([input_dict])

    try:
        X_trans = preprocessor.transform(raw_df)
        pred_max_emi = float(regressor.predict(X_trans)[0])
        pred_max_emi = max(500.0, min(50000.0, round(pred_max_emi, 2)))

        ratios = compute_financial_ratios(payload)
        disp = ratios["disposable_income"]
        foir = ((payload.current_emi_amount + pred_max_emi) / (payload.monthly_salary + 1e-5)) * 100.0
        buffer = max(0.0, disp - pred_max_emi)

        sensitivity = generate_sensitivity_curve(payload.requested_amount, pred_max_emi)

        explanation = (
            f"Based on net cashflow, living obligations, and credit stability score, committing up to "
            f"₹{pred_max_emi:,.2f} per month maintains a conservative risk margin without triggering debt distress."
        )

        return MaxEMIResponse(
            max_monthly_emi=round(pred_max_emi, 2),
            disposable_income=round(disp, 2),
            foir_percentage=round(foir, 2),
            buffer_remaining=round(buffer, 2),
            sensitivity_curve=sensitivity,
            explanation=explanation
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Regression inference failure: {str(e)}")


@router.post("/full", response_model=FullPredictionResponse)
async def predict_full(payload: LoanApplicationInput):
    """Convenience endpoint returning both Eligibility and Max Safe EMI in a single call."""
    eligibility_res = await predict_eligibility(payload)
    affordability_res = await predict_max_emi(payload)

    return FullPredictionResponse(
        eligibility=eligibility_res,
        affordability=affordability_res
    )
