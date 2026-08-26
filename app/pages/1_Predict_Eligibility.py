"""
Streamlit Page: Predict EMI Eligibility (Classification).
Evaluates applicant eligibility into Eligible, High_Risk, or Not_Eligible.
"""

import streamlit as st
import sys
import pathlib
import joblib
import pandas as pd
import numpy as np
import plotly.express as px

# Ensure project root is in sys.path
sys.path.append(str(pathlib.Path(__file__).parent.parent.parent))
from src.feature_engineering import FinancialFeatureAdder
import __main__
setattr(__main__, 'FinancialFeatureAdder', FinancialFeatureAdder)

st.set_page_config(page_title="Predict Eligibility - EMIPredict AI", page_icon="🎯", layout="wide")

st.title("🎯 EMI Eligibility Assessment Engine")
st.caption("Input applicant details across all 22 parameters to compute multi-class credit risk eligibility.")

# Load Model & Preprocessor
@st.cache_resource
def load_classification_pipeline():
    model_path = pathlib.Path("models/best_classifier.pkl")
    prep_path = pathlib.Path("models/preprocessor.pkl")
    
    if not model_path.exists() or not prep_path.exists():
        st.error("Model artifacts missing in models/. Please execute full training pipeline first.")
        st.stop()
        
    model = joblib.load(model_path)
    preprocessor = joblib.load(prep_path)
    return model, preprocessor

try:
    classifier_model, preprocessor_pipeline = load_classification_pipeline()
except Exception as e:
    st.error(f"Error loading models: {e}")
    st.stop()

# Input Form in structured tabs / expanders
with st.form("eligibility_form"):
    st.subheader("📋 Loan Application Input Form")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("#### 1. Personal Demographics")
        age = st.number_input("Age (Years)", min_value=25, max_value=60, value=32, step=1)
        gender = st.selectbox("Gender", ["Male", "Female"])
        marital_status = st.selectbox("Marital Status", ["Single", "Married"])
        education = st.selectbox("Education Level", ["High School", "Graduate", "Post Graduate", "Professional"])

    with col2:
        st.markdown("#### 2. Employment & Income")
        monthly_salary = st.number_input("Monthly Salary (INR)", min_value=15000, max_value=500000, value=65000, step=2000)
        employment_type = st.selectbox("Employment Type", ["Private", "Government", "Self-employed"])
        years_of_employment = st.number_input("Years of Employment", min_value=0, max_value=40, value=6, step=1)
        company_type = st.selectbox("Company Type", ["Private Ltd", "MNC", "Public Sector", "Startup"])

    with col3:
        st.markdown("#### 3. Housing & Family")
        house_type = st.selectbox("House Ownership", ["Rented", "Own", "Family"])
        monthly_rent = st.number_input("Monthly Rent (INR)", min_value=0, max_value=100000, value=12000 if house_type=="Rented" else 0, step=1000)
        family_size = st.number_input("Family Size", min_value=1, max_value=10, value=3, step=1)
        dependents = st.number_input("Dependents Count", min_value=0, max_value=8, value=1, step=1)

    st.divider()
    col4, col5, col6 = st.columns(3)

    with col4:
        st.markdown("#### 4. Monthly Obligations")
        school_fees = st.number_input("School Fees (INR)", min_value=0, max_value=50000, value=3000, step=500)
        college_fees = st.number_input("College Fees (INR)", min_value=0, max_value=100000, value=0, step=1000)
        travel_expenses = st.number_input("Travel Expenses (INR)", min_value=500, max_value=30000, value=4000, step=500)
        groceries_utilities = st.number_input("Groceries & Utilities (INR)", min_value=1000, max_value=50000, value=10000, step=1000)
        other_expenses = st.number_input("Other Monthly Expenses (INR)", min_value=500, max_value=40000, value=3000, step=500)

    with col5:
        st.markdown("#### 5. Credit & Financial Status")
        existing_loans = st.selectbox("Existing Active Loans?", ["Yes", "No"])
        current_emi = st.number_input("Current EMI Amount (INR)", min_value=0, max_value=100000, value=8000 if existing_loans=="Yes" else 0, step=1000)
        credit_score = st.slider("CIBIL / Credit Score", min_value=300, max_value=850, value=740, step=5)
        bank_balance = st.number_input("Bank Balance (INR)", min_value=1000, max_value=2000000, value=120000, step=5000)
        emergency_fund = st.number_input("Emergency Fund (INR)", min_value=0, max_value=1000000, value=50000, step=5000)

    with col6:
        st.markdown("#### 6. Application Details")
        emi_scenario = st.selectbox("EMI Scenario", [
            "E-commerce Shopping EMI",
            "Home Appliances EMI",
            "Vehicle EMI",
            "Personal Loan EMI",
            "Education EMI"
        ])
        requested_amount = st.number_input("Requested Loan Amount (INR)", min_value=5000, max_value=2000000, value=150000, step=5000)
        requested_tenure = st.number_input("Requested Tenure (Months)", min_value=3, max_value=84, value=24, step=3)

    submit_btn = st.form_submit_button("⚡ Evaluate EMI Eligibility", use_container_width=True)

if submit_btn:
    # Build single-row DataFrame matching training feature schema
    raw_input_df = pd.DataFrame([{
        "age": age,
        "gender": gender,
        "marital_status": marital_status,
        "education": education,
        "monthly_salary": monthly_salary,
        "employment_type": employment_type,
        "years_of_employment": years_of_employment,
        "company_type": company_type,
        "house_type": house_type,
        "monthly_rent": monthly_rent,
        "family_size": family_size,
        "dependents": dependents,
        "school_fees": school_fees,
        "college_fees": college_fees,
        "travel_expenses": travel_expenses,
        "groceries_utilities": groceries_utilities,
        "other_monthly_expenses": other_expenses,
        "existing_loans": existing_loans,
        "current_emi_amount": current_emi,
        "credit_score": credit_score,
        "bank_balance": bank_balance,
        "emergency_fund": emergency_fund,
        "emi_scenario": emi_scenario,
        "requested_amount": requested_amount,
        "requested_tenure": requested_tenure
    }])

    # Preprocess & Predict
    with st.spinner("Processing features through AI classification engine..."):
        X_trans = preprocessor_pipeline.transform(raw_input_df)
        pred_class_idx = classifier_model.predict(X_trans)[0]
        
        LABEL_MAP = {0: "Eligible", 1: "High_Risk", 2: "Not_Eligible"}
        predicted_label = LABEL_MAP.get(pred_class_idx, str(pred_class_idx))
        
        if hasattr(classifier_model, "predict_proba"):
            probs = classifier_model.predict_proba(X_trans)[0]
        else:
            probs = [0.33, 0.33, 0.34]

    st.subheader("🎯 Assessment Results")
    
    res_col1, res_col2 = st.columns([1, 1])
    
    with res_col1:
        if predicted_label == "Eligible":
            st.success("### Status: ELIGIBLE ✅\nApplicant satisfies income, credit, and DTI criteria for approval.")
        elif predicted_label == "High_Risk":
            st.warning("### Status: HIGH RISK ⚠️\nApplicant exhibits elevated debt ratio or subprime credit score. Requires manual underwriting or higher interest tier.")
        else:
            st.error("### Status: NOT ELIGIBLE ❌\nApplicant exceeds safe debt-to-income limits or presents severe credit default risk.")
            
        # Key Financial Health Metrics
        tot_exp = monthly_rent + school_fees + college_fees + travel_expenses + groceries_utilities + other_expenses
        disp_inc = monthly_salary - tot_exp - current_emi
        annual_rate = 0.12
        r = annual_rate / 12.0
        pow_factor = (1 + r) ** requested_tenure
        est_emi = requested_amount * r * pow_factor / (pow_factor - 1)
        dti = (current_emi + est_emi) / (monthly_salary + 1e-5) * 100
        
        st.markdown("#### Key Financial Ratios")
        m1, m2, m3 = st.columns(3)
        m1.metric("Disposable Income", f"₹{disp_inc:,.0f}")
        m2.metric("Projected EMI", f"₹{est_emi:,.0f}")
        m3.metric("Total DTI Ratio", f"{dti:.1f}%")

    with res_col2:
        st.markdown("#### Model Probability Breakdown")
        prob_df = pd.DataFrame({
            "Class": ["Eligible", "High_Risk", "Not_Eligible"],
            "Probability": [probs[0], probs[1], probs[2]]
        })
        fig = px.bar(
            prob_df, x="Class", y="Probability",
            color="Class",
            color_discrete_map={"Eligible": "#10B981", "High_Risk": "#F59E0B", "Not_Eligible": "#EF4444"},
            text_auto=".2%",
            title="Classification Confidence Score"
        )
        fig.update_layout(yaxis_range=[0, 1], height=300)
        st.plotly_chart(fig, use_container_width=True)
