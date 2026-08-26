"""
Streamlit Page: Interactive Data Explorer.
Provides interactive Plotly exploration, filtering by EMI scenario, salary ranges, and credit scores.
"""

import streamlit as st
import pathlib
import pandas as pd
import plotly.express as px

st.set_page_config(page_title="Data Explorer - EMIPredict AI", page_icon="📊", layout="wide")

st.title("📊 Interactive Portfolio & Data Explorer")
st.caption("Explore credit applicant distributions, financial ratios, and eligibility risk tiers across EMI scenarios.")

@st.cache_data
def load_raw_dataset():
    data_path = pathlib.Path("data/raw/EMI_dataset.csv")
    if not data_path.exists():
        st.error("Raw dataset missing at data/raw/EMI_dataset.csv. Execute src/data_generation.py first.")
        st.stop()
    df = pd.read_csv(data_path)
    # Calculate derived columns for interactive charting
    df["total_expenses"] = (
        df["monthly_rent"].fillna(0) + df["school_fees"].fillna(0) + df["college_fees"].fillna(0) +
        df["travel_expenses"].fillna(0) + df["groceries_utilities"].fillna(0) + df["other_monthly_expenses"].fillna(0)
    )
    df["disposable_income"] = df["monthly_salary"].fillna(df["monthly_salary"].median()) - df["total_expenses"] - df["current_emi_amount"].fillna(0)
    return df

df = load_raw_dataset()

# Sidebar Filters
st.sidebar.header("🔍 Dataset Filters")

scenarios = ["All Scenarios"] + list(df["emi_scenario"].dropna().unique())
selected_scenario = st.sidebar.selectbox("Filter by EMI Scenario", scenarios)

min_sal, max_sal = int(df["monthly_salary"].min()), int(df["monthly_salary"].max())
salary_range = st.sidebar.slider("Monthly Salary Range (INR)", min_value=min_sal, max_value=max_sal, value=(15000, 200000), step=5000)

credit_range = st.sidebar.slider("Credit Score Range", min_value=300, max_value=850, value=(300, 850), step=10)

eligibility_filter = st.sidebar.multiselect("Eligibility Status", ["Eligible", "High_Risk", "Not_Eligible"], default=["Eligible", "High_Risk", "Not_Eligible"])

# Apply Filters
filtered_df = df.copy()

if selected_scenario != "All Scenarios":
    filtered_df = filtered_df[filtered_df["emi_scenario"] == selected_scenario]

filtered_df = filtered_df[
    (filtered_df["monthly_salary"] >= salary_range[0]) &
    (filtered_df["monthly_salary"] <= salary_range[1]) &
    (filtered_df["credit_score"] >= credit_range[0]) &
    (filtered_df["credit_score"] <= credit_range[1]) &
    (filtered_df["emi_eligibility"].isin(eligibility_filter))
]

# Summary Metrics Row
c1, c2, c3, c4 = st.columns(4)
c1.metric("Filtered Records", f"{len(filtered_df):,}")
c2.metric("Avg Monthly Salary", f"₹{filtered_df['monthly_salary'].mean():,.0f}")
c3.metric("Avg Credit Score", f"{filtered_df['credit_score'].mean():.0f}")
c4.metric("Avg Requested Amount", f"₹{filtered_df['requested_amount'].mean():,.0f}")

st.divider()

# Charts Grid
col_a, col_b = st.columns(2)

with col_a:
    st.subheader("📌 Eligibility Class Distribution")
    fig1 = px.histogram(
        filtered_df, x="emi_eligibility", color="emi_eligibility",
        color_discrete_map={"Eligible": "#10B981", "High_Risk": "#F59E0B", "Not_Eligible": "#EF4444"},
        text_auto=True, title="Applicant Count by Eligibility Status"
    )
    st.plotly_chart(fig1, use_container_width=True)

with col_b:
    st.subheader("💰 Monthly Salary vs Max Safe EMI")
    fig2 = px.scatter(
        filtered_df.sample(min(2000, len(filtered_df)), random_state=42),
        x="monthly_salary", y="max_monthly_emi", color="emi_eligibility",
        color_discrete_map={"Eligible": "#10B981", "High_Risk": "#F59E0B", "Not_Eligible": "#EF4444"},
        opacity=0.6, title="Salary vs Max Safe EMI (Sample of 2,000 Points)"
    )
    st.plotly_chart(fig2, use_container_width=True)

col_c, col_d = st.columns(2)

with col_c:
    st.subheader("💳 Credit Score vs Disposable Income")
    fig3 = px.box(
        filtered_df, x="emi_eligibility", y="credit_score", color="emi_eligibility",
        color_discrete_map={"Eligible": "#10B981", "High_Risk": "#F59E0B", "Not_Eligible": "#EF4444"},
        title="Credit Score Distribution by Risk Tier"
    )
    st.plotly_chart(fig3, use_container_width=True)

with col_d:
    st.subheader("📱 EMI Scenario Portfolio Breakdown")
    sc_counts = filtered_df["emi_scenario"].value_counts().reset_index()
    sc_counts.columns = ["Scenario", "Count"]
    fig4 = px.pie(sc_counts, names="Scenario", values="Count", title="Applications by Scenario Tier", hole=0.4)
    st.plotly_chart(fig4, use_container_width=True)

st.divider()
st.subheader("📋 Filtered Dataset Sample")
st.dataframe(filtered_df.head(100), use_container_width=True)
