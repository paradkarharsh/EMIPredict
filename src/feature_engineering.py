"""
Feature Engineering and Pipeline Module for EMIPredict AI.
Calculates key financial ratios (DTI, expense ratio, affordability, disposable income),
composite risk score, and interaction terms. Handles categorical encoding & numeric scaling.
Persists fitted preprocessor pipeline to models/preprocessor.pkl.
"""

import os
import sys
import pathlib
import joblib
import pandas as pd
import numpy as np

# Ensure module is registered in sys.modules as src.feature_engineering for clean pickling
project_root = pathlib.Path(__file__).parent.parent
if str(project_root) not in sys.path:
    sys.path.append(str(project_root))

from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

CATEGORICAL_COLS = [
    "gender", "marital_status", "education", "employment_type",
    "company_type", "house_type", "existing_loans", "emi_scenario"
]

NUMERIC_COLS = [
    "age", "monthly_salary", "years_of_employment", "monthly_rent",
    "family_size", "dependents", "school_fees", "college_fees",
    "travel_expenses", "groceries_utilities", "other_monthly_expenses",
    "current_emi_amount", "credit_score", "bank_balance", "emergency_fund",
    "requested_amount", "requested_tenure"
]

DERIVED_NUMERIC_COLS = [
    "total_monthly_expenses", "disposable_income", "estimated_requested_emi",
    "debt_to_income_ratio", "expense_to_income_ratio", "affordability_ratio",
    "risk_score", "credit_affordability_interaction"
]

class FinancialFeatureAdder(BaseEstimator, TransformerMixin):
    """Custom Scikit-Learn Transformer for financial feature calculation."""
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        df = X.copy()
        
        # 1. Total Monthly Expenses
        df["total_monthly_expenses"] = (
            df["monthly_rent"] + df["school_fees"] + df["college_fees"] +
            df["travel_expenses"] + df["groceries_utilities"] + df["other_monthly_expenses"]
        )
        
        # 2. Disposable Income
        df["disposable_income"] = df["monthly_salary"] - df["total_monthly_expenses"] - df["current_emi_amount"]
        
        # 3. Estimated Requested Monthly EMI (using ~12% interest p.a.)
        annual_rate = 0.12
        r = annual_rate / 12.0
        n = df["requested_tenure"].values
        pow_factor = (1 + r) ** n
        df["estimated_requested_emi"] = df["requested_amount"] * r * pow_factor / (pow_factor - 1)
        
        # 4. Debt to Income Ratio (DTI)
        df["debt_to_income_ratio"] = (df["current_emi_amount"] + df["estimated_requested_emi"]) / (df["monthly_salary"] + 1e-5)
        
        # 5. Expense to Income Ratio
        df["expense_to_income_ratio"] = df["total_monthly_expenses"] / (df["monthly_salary"] + 1e-5)
        
        # 6. Affordability Ratio
        df["affordability_ratio"] = df["disposable_income"] / (df["monthly_salary"] + 1e-5)
        
        # 7. Composite Risk Score (Scale 0-100: Higher is safer/lower risk)
        # Credit component (0-50 pts)
        c_score_pts = np.clip((df["credit_score"] - 300) / 550.0 * 50.0, 0, 50)
        # Employment stability component (0-25 pts)
        emp_pts = np.clip(df["years_of_employment"] / 15.0 * 15.0, 0, 15)
        emp_type_bonus = np.where(df["employment_type"] == "Government", 10.0,
                         np.where(df["employment_type"] == "Private", 7.0, 4.0))
        # Existing loan penalty (0-25 pts)
        loan_penalty = np.where(df["existing_loans"] == "Yes", 0.0, 15.0)
        
        df["risk_score"] = np.clip(c_score_pts + emp_pts + emp_type_bonus + loan_penalty, 0, 100)
        
        # 8. Interaction Feature: Credit Score * Affordability Ratio
        df["credit_affordability_interaction"] = (df["credit_score"] / 850.0) * df["affordability_ratio"]
        
        return df

sys.modules["src.feature_engineering"] = sys.modules[__name__]

def build_preprocessing_pipeline() -> Pipeline:
    """Builds full feature engineering and scaling/encoding pipeline."""
    feature_adder = FinancialFeatureAdder()
    
    all_num_cols = NUMERIC_COLS + DERIVED_NUMERIC_COLS
    
    column_transformer = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), all_num_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_COLS)
        ],
        remainder="drop"
    )
    
    pipeline = Pipeline(steps=[
        ("feature_adder", feature_adder),
        ("preprocessor", column_transformer)
    ])
    
    return pipeline

def process_and_save_features(data_dir: str = "data/processed", model_dir: str = "models") -> None:
    path_data = pathlib.Path(data_dir)
    train_path = path_data / "train.csv"
    val_path = path_data / "val.csv"
    test_path = path_data / "test.csv"
    
    if not train_path.exists():
        raise FileNotFoundError("Processed split files not found in data/processed/. Run src/preprocessing.py first.")
        
    print("Loading data splits for feature engineering...")
    train_df = pd.read_csv(train_path)
    val_df = pd.read_csv(val_path)
    test_df = pd.read_csv(test_path)
    
    print("Fitting feature engineering pipeline on training set...")
    pipeline = build_preprocessing_pipeline()
    pipeline.fit(train_df)
    
    # Save fitted preprocessor
    path_model = pathlib.Path(model_dir)
    path_model.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, path_model / "preprocessor.pkl")
    print(f"Fitted pipeline saved to {path_model / 'preprocessor.pkl'}")
    
    # Transform splits
    X_train_trans = pipeline.transform(train_df)
    X_val_trans = pipeline.transform(val_df)
    X_test_trans = pipeline.transform(test_df)
    
    print(f"Transformed X_train shape: {X_train_trans.shape}")
    print(f"Transformed X_val shape: {X_val_trans.shape}")
    print(f"Transformed X_test shape: {X_test_trans.shape}")

if __name__ == "__main__":
    process_and_save_features()
