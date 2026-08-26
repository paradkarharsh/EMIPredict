"""
EMIPredict AI - Home Entrypoint Page.
FinTech Capstone Project: Intelligent Financial Risk Assessment Platform.
"""

import streamlit as st
import sys
import pathlib

sys.path.append(str(pathlib.Path(__file__).parent.parent))
from src.feature_engineering import FinancialFeatureAdder
import __main__
setattr(__main__, 'FinancialFeatureAdder', FinancialFeatureAdder)

st.set_page_config(
    page_title="EMIPredict AI - Financial Risk Platform",
    page_icon="💳",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS styling for modern UI
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: 800;
        background: linear-gradient(90deg, #3B82F6 0%, #10B981 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.5rem;
    }
    .sub-header {
        font-size: 1.2rem;
        color: #94A3B8;
        margin-bottom: 2rem;
    }
    .metric-card {
        background-color: #1E293B;
        border-radius: 12px;
        padding: 1.5rem;
        border: 1px solid #334155;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        text-align: center;
    }
    .metric-value {
        font-size: 2rem;
        font-weight: 700;
        color: #38BDF8;
    }
    .metric-label {
        font-size: 0.9rem;
        color: #94A3B8;
        margin-top: 0.3rem;
    }
</style>
""", unsafe_allow_html=True)

st.markdown('<div class="main-header">EMIPredict AI</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">Intelligent Financial Risk Assessment & EMI Affordability Platform</div>', unsafe_allow_html=True)

st.divider()

# KPI Metric Cards Row
col1, col2, col3, col4 = st.columns(4)

with col1:
    st.markdown("""
    <div class="metric-card">
        <div class="metric-value">400,000</div>
        <div class="metric-label">Processed Applications</div>
    </div>
    """, unsafe_allow_html=True)

with col2:
    st.markdown("""
    <div class="metric-card">
        <div class="metric-value">5</div>
        <div class="metric-label">Loan EMI Scenarios</div>
    </div>
    """, unsafe_allow_html=True)

with col3:
    st.markdown("""
    <div class="metric-card">
        <div class="metric-value">&gt; 92%</div>
        <div class="metric-label">Eligibility Classification Accuracy</div>
    </div>
    """, unsafe_allow_html=True)

with col4:
    st.markdown("""
    <div class="metric-card">
        <div class="metric-value">&lt; ₹2,000</div>
        <div class="metric-label">Max EMI Regression RMSE</div>
    </div>
    """, unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# Overview Section
left_col, right_col = st.columns([3, 2])

with left_col:
    st.subheader("📌 Platform Overview")
    st.write("""
    **EMIPredict AI** is an end-to-end, production-ready financial risk intelligence platform designed for modern fintechs, digital lenders, and retail banking institutions. It uses machine learning to evaluate loan application risk and estimate borrower affordability in real-time.
    
    ### Key Modules:
    - 🎯 **Predict EMI Eligibility**: Real-time 3-tier risk assessment (`Eligible`, `High_Risk`, `Not_Eligible`) based on 22 applicant demographic, credit, and financial features.
    - 💰 **Predict Max Safe EMI**: Continuous regression engine quantifying the maximum safe monthly installment limit to prevent over-leveraging.
    - 📊 **Data Explorer**: Interactive multi-scenario portfolio exploration powered by Plotly.
    - 📈 **Model Performance**: Live MLflow experiment tracking dashboard comparing metrics across trained models.
    - ⚙️ **Admin Database CRUD**: Full-stack SQLite database management portal for loan application records.
    """)

with right_col:
    st.subheader("🏗️ System Architecture")
    st.code("""
┌─────────────────────────────────────────┐
│     Raw Data (400k Rows, 5 Scenarios)   │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│   Preprocessing & Feature Engineering   │
│   (Imputation, Winsorization, Ratios)   │
└────────────────────┬────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
┌────────▼─────────┐    ┌────────▼─────────┐
│ Classification   │    │    Regression    │
│  (XGBoost, RF)   │    │  (XGBoost, RF)   │
└────────┬─────────┘    └────────┬─────────┘
         │                       │
┌────────▼───────────────────────▼─────────┐
│      MLflow Tracking & Model Registry    │
└────────────────────┬─────────────────────┘
                     │
┌────────────────────▼─────────────────────┐
│  Streamlit Multi-Page Production Web App  │
└──────────────────────────────────────────┘
    """, language="text")

st.divider()

st.subheader("🚀 Quick Navigation")
c1, c2, c3 = st.columns(3)

with c1:
    st.info("### 🎯 Eligibility Predictor\nEvaluate applicant risk level and view confidence scores.")
with c2:
    st.success("### 💰 Max EMI Calculator\nDetermine safe monthly installment caps with sensitivity curves.")
with c3:
    st.warning("### ⚙️ Admin Portal\nManage loan application records directly in SQLite DB.")

st.caption("EMIPredict AI Platform v1.0.0 | Developed with Python 3.11, Scikit-Learn, XGBoost, MLflow & Streamlit.")
