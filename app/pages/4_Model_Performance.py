"""
Streamlit Page: MLflow Model Performance Dashboard.
Reads logged MLflow metrics from ./mlruns and displays comparative metrics,
leaderboards, and confusion matrix artifacts.
"""

import streamlit as st
import os
import pathlib
import pandas as pd
import plotly.express as px

os.environ["MLFLOW_ALLOW_FILE_STORE"] = "true"

import mlflow
from mlflow.tracking import MlflowClient

st.set_page_config(page_title="Model Performance - EMIPredict AI", page_icon="📈", layout="wide")

st.title("📈 Model Performance & MLflow Leaderboard")
st.caption("Live experiment tracking metrics sourced from local MLflow store (./mlruns).")

@st.cache_data
def load_mlflow_metrics(tracking_uri: str = "./mlruns"):
    mlflow.set_tracking_uri(tracking_uri)
    client = MlflowClient()
    
    cls_data = []
    reg_data = []
    
    # Classification Experiment
    try:
        cls_exp = client.get_experiment_by_name("EMIPredict_Classification")
        if cls_exp is not None:
            cls_runs = client.search_runs(experiment_ids=[cls_exp.experiment_id])
            for r in cls_runs:
                cls_data.append({
                    "Model": r.data.tags.get("mlflow.runName", "Unknown"),
                    "Accuracy": r.data.metrics.get("accuracy", 0.0),
                    "F1 Score": r.data.metrics.get("f1_score", 0.0),
                    "Precision": r.data.metrics.get("precision", 0.0),
                    "Recall": r.data.metrics.get("recall", 0.0),
                    "ROC AUC": r.data.metrics.get("roc_auc", 0.0),
                    "Run ID": r.info.run_id
                })
    except Exception as e:
        st.warning(f"Note loading classification MLflow metrics: {e}")
        
    # Regression Experiment
    try:
        reg_exp = client.get_experiment_by_name("EMIPredict_Regression")
        if reg_exp is not None:
            reg_runs = client.search_runs(experiment_ids=[reg_exp.experiment_id])
            for r in reg_runs:
                reg_data.append({
                    "Model": r.data.tags.get("mlflow.runName", "Unknown"),
                    "RMSE (INR)": r.data.metrics.get("rmse", 0.0),
                    "MAE (INR)": r.data.metrics.get("mae", 0.0),
                    "R2 Score": r.data.metrics.get("r2", 0.0),
                    "MAPE (%)": r.data.metrics.get("mape", 0.0),
                    "Run ID": r.info.run_id
                })
    except Exception as e:
        st.warning(f"Note loading regression MLflow metrics: {e}")
        
    return pd.DataFrame(cls_data), pd.DataFrame(reg_data)

cls_df, reg_df = load_mlflow_metrics()

tab1, tab2 = st.tabs(["🎯 Classification Models", "💰 Regression Models"])

with tab1:
    st.subheader("Classification Leaderboard (Target: > 90% Accuracy)")
    if not cls_df.empty:
        cls_df_sorted = cls_df.sort_values(by="F1 Score", ascending=False)
        st.dataframe(cls_df_sorted.style.highlight_max(axis=0, subset=["Accuracy", "F1 Score", "Precision", "Recall", "ROC AUC"]), use_container_width=True)
        
        c1, c2 = st.columns(2)
        with c1:
            fig_cls = px.bar(
                cls_df_sorted, x="Model", y=["Accuracy", "F1 Score", "ROC AUC"],
                barmode="group", title="Classification Metrics Comparison",
                text_auto=".3f"
            )
            fig_cls.update_layout(yaxis_range=[0.7, 1.0])
            st.plotly_chart(fig_cls, use_container_width=True)
            
        with c2:
            st.subheader("Confusion Matrix Artifacts")
            cm_dir = pathlib.Path("reports/figures/confusion_matrices")
            if cm_dir.exists():
                cm_files = list(cm_dir.glob("*.png"))
                if cm_files:
                    selected_cm = st.selectbox("Select Model Confusion Matrix", [f.name for f in cm_files])
                    st.image(str(cm_dir / selected_cm), caption=f"Confusion Matrix: {selected_cm}")
                else:
                    st.info("Confusion matrix plots will appear after running train_classification.py.")
    else:
        st.info("No classification runs logged yet. Execute `python src/train_classification.py` to populate.")

with tab2:
    st.subheader("Regression Leaderboard (Target: RMSE < ₹2,000)")
    if not reg_df.empty:
        reg_df_sorted = reg_df.sort_values(by="RMSE (INR)", ascending=True)
        st.dataframe(reg_df_sorted.style.highlight_min(axis=0, subset=["RMSE (INR)", "MAE (INR)", "MAPE (%)"]), use_container_width=True)
        
        c3, c4 = st.columns(2)
        with c3:
            fig_reg1 = px.bar(
                reg_df_sorted, x="Model", y="RMSE (INR)",
                color="Model", title="Root Mean Squared Error (Lower is Better)",
                text_auto=".1f"
            )
            st.plotly_chart(fig_reg1, use_container_width=True)
            
        with c4:
            fig_reg2 = px.bar(
                reg_df_sorted, x="Model", y="R2 Score",
                color="Model", title="R² Variance Explained (Higher is Better)",
                text_auto=".4f"
            )
            fig_reg2.update_layout(yaxis_range=[0.8, 1.0])
            st.plotly_chart(fig_reg2, use_container_width=True)
    else:
        st.info("No regression runs logged yet. Execute `python src/train_regression.py` to populate.")
