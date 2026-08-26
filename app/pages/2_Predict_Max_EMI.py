"""
Streamlit Page: Predict Max Safe EMI (Regression & Sensitivity Engine).
Calculates maximum safe monthly EMI in INR and plots tenure sensitivity curves.
"""

import streamlit as st
import sys
import pathlib
import joblib
import pandas as pd
import plotly.graph_objects as go

sys.path.append(str(pathlib.Path(__file__).parent.parent.parent))
from src.feature_engineering import FinancialFeatureAdder
import __main__
setattr(__main__, 'FinancialFeatureAdder', FinancialFeatureAdder)

st.set_page_config(page_title="Predict Max EMI - EMIPredict AI", page_icon="💰", layout="wide")

st.title("💰 Maximum Safe EMI Affordability Engine")
st.caption("Predict maximum safe monthly installment limit (INR) to protect borrowers from debt distress.")

@st.cache_resource
def load_regression_pipeline():
    model_path = pathlib.Path("models/best_regressor.pkl")
    prep_path = pathlib.Path("models/preprocessor.pkl")
    
    if not model_path.exists() or not prep_path.exists():
        st.error("Model artifacts missing in models/. Execute full pipeline first.")
        st.stop()
        
    model = joblib.load(model_path)
    preprocessor = joblib.load(prep_path)
    return model, preprocessor

try:
    regressor_model, preprocessor_pipeline = load_regression_pipeline()
except Exception as e:
    st.error(f"Error loading regression models: {e}")
    st.stop()

with st.form("max_emi_form"):
    st.subheader("📋 Borrower Financial Parameters")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("#### 1. Income & Demographics")
        monthly_salary = st.number_input("Monthly Salary (INR)", min_value=15000, max_value=500000, value=75000, step=2000)
        age = st.number_input("Age", min_value=25, max_value=60, value=34, step=1)
        employment_type = st.selectbox("Employment Type", ["Private", "Government", "Self-employed"])
        years_of_employment = st.number_input("Years of Employment", min_value=0, max_value=40, value=7, step=1)
        gender = st.selectbox("Gender", ["Male", "Female"])
        marital_status = st.selectbox("Marital Status", ["Single", "Married"])
        education = st.selectbox("Education Level", ["High School", "Graduate", "Post Graduate", "Professional"])
        company_type = st.selectbox("Company Type", ["Private Ltd", "MNC", "Public Sector", "Startup"])

    with col2:
        st.markdown("#### 2. Expenses & Obligations")
        house_type = st.selectbox("House Ownership", ["Rented", "Own", "Family"])
        monthly_rent = st.number_input("Monthly Rent (INR)", min_value=0, max_value=100000, value=14000 if house_type=="Rented" else 0, step=1000)
        family_size = st.number_input("Family Size", min_value=1, max_value=10, value=4, step=1)
        dependents = st.number_input("Dependents", min_value=0, max_value=8, value=2, step=1)
        school_fees = st.number_input("School Fees (INR)", min_value=0, max_value=50000, value=4000, step=500)
        college_fees = st.number_input("College Fees (INR)", min_value=0, max_value=100000, value=0, step=1000)
        travel_expenses = st.number_input("Travel Expenses (INR)", min_value=500, max_value=30000, value=5000, step=500)
        groceries_utilities = st.number_input("Groceries & Utilities (INR)", min_value=1000, max_value=50000, value=12000, step=1000)
        other_expenses = st.number_input("Other Expenses (INR)", min_value=500, max_value=40000, value=3000, step=500)

    with col3:
        st.markdown("#### 3. Credit & Loan Scenario")
        existing_loans = st.selectbox("Existing Active Loans?", ["Yes", "No"])
        current_emi = st.number_input("Current EMI Amount (INR)", min_value=0, max_value=100000, value=5000 if existing_loans=="Yes" else 0, step=1000)
        credit_score = st.slider("CIBIL / Credit Score", min_value=300, max_value=850, value=760, step=5)
        bank_balance = st.number_input("Bank Balance (INR)", min_value=1000, max_value=2000000, value=180000, step=5000)
        emergency_fund = st.number_input("Emergency Fund (INR)", min_value=0, max_value=1000000, value=80000, step=5000)
        emi_scenario = st.selectbox("EMI Scenario", [
            "E-commerce Shopping EMI",
            "Home Appliances EMI",
            "Vehicle EMI",
            "Personal Loan EMI",
            "Education EMI"
        ])
        requested_amount = st.number_input("Requested Loan Amount (INR)", min_value=5000, max_value=2000000, value=250000, step=5000)
        requested_tenure = st.number_input("Requested Tenure (Months)", min_value=3, max_value=84, value=36, step=3)

    calc_btn = st.form_submit_button("💰 Compute Maximum Safe EMI", use_container_width=True)

if calc_btn:
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

    with st.spinner("Calculating maximum safe installment capacity..."):
        X_trans = preprocessor_pipeline.transform(raw_input_df)
        predicted_max_emi = float(regressor_model.predict(X_trans)[0])
        predicted_max_emi = max(500.0, min(50000.0, round(predicted_max_emi, 2)))

    st.subheader("💵 Affordability Results")
    
    rc1, rc2, rc3 = st.columns(3)
    rc1.metric("Predicted Max Safe Monthly EMI", f"₹{predicted_max_emi:,.2f}")
    
    # Calculate FOIR & Disposable Income
    tot_exp = monthly_rent + school_fees + college_fees + travel_expenses + groceries_utilities + other_expenses
    disp_income = monthly_salary - tot_exp - current_emi
    foir_pct = ((current_emi + predicted_max_emi) / (monthly_salary + 1e-5)) * 100
    
    rc2.metric("Remaining Monthly Disposable Buffer", f"₹{(disp_income - predicted_max_emi):,.2f}")
    rc3.metric("Projected FOIR Cap Usage", f"{foir_pct:.1f}%")

    st.divider()
    st.subheader("📈 Tenure Sensitivity Analysis")
    st.caption("Compare predicted maximum safe EMI against required monthly installment across different tenure options.")
    
    tenures = [6, 12, 18, 24, 36, 48, 60, 72, 84]
    annual_rate = 0.12
    monthly_rate = annual_rate / 12.0
    
    required_emis = []
    total_repayments = []
    
    for t in tenures:
        pf = (1 + monthly_rate) ** t
        eq_emi = requested_amount * monthly_rate * pf / (pf - 1)
        required_emis.append(round(eq_emi, 2))
        total_repayments.append(round(eq_emi * t, 2))
        
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=tenures, y=required_emis, mode="lines+markers", name="Required Monthly EMI (INR)", line=dict(color="#3B82F6", width=3)))
    fig.add_trace(go.Scatter(x=tenures, y=[predicted_max_emi]*len(tenures), mode="lines", name="Max Safe EMI Limit", line=dict(color="#EF4444", width=2, dash="dash")))
    
    fig.update_layout(
        title="Required EMI vs Maximum Safe EMI Across Tenures",
        xaxis_title="Loan Tenure (Months)",
        yaxis_title="Monthly EMI (INR)",
        hovermode="x unified",
        height=400
    )
    st.plotly_chart(fig, use_container_width=True)
