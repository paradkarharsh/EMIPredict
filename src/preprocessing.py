"""
Data Preprocessing Pipeline for EMIPredict AI Platform.
Performs data quality assessment, handles missing values via imputation,
eliminates duplicate records, winsorizes extreme outliers, and creates
a 70/15/15 stratified train/validation/test split.
"""

import os
import pathlib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

def perform_data_quality_assessment(df: pd.DataFrame) -> dict:
    total_rows = len(df)
    missing_summary = df.isnull().sum()
    missing_pct = (missing_summary / total_rows * 100).round(2)
    missing_df = pd.DataFrame({"Missing_Count": missing_summary, "Missing_Pct": missing_pct})
    missing_df = missing_df[missing_df["Missing_Count"] > 0]
    
    duplicate_count = df.duplicated().sum()
    
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    outlier_summary = {}
    for col in numeric_cols:
        q1 = df[col].quantile(0.25)
        q3 = df[col].quantile(0.75)
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        outliers = ((df[col] < lower_bound) | (df[col] > upper_bound)).sum()
        if outliers > 0:
            outlier_summary[col] = outliers
            
    print("=" * 60)
    print("DATA QUALITY ASSESSMENT REPORT")
    print("=" * 60)
    print(f"Total Rows: {total_rows}")
    print(f"Duplicate Rows: {duplicate_count}")
    print("\nMissing Values Table:")
    print(missing_df if not missing_df.empty else "No missing values found.")
    print("\nNumeric Outliers (IQR Method):")
    for col, count in outlier_summary.items():
        print(f"  - {col}: {count} rows ({count/total_rows*100:.2f}%)")
    print("=" * 60)
    
    return {
        "total_rows": total_rows,
        "duplicate_count": duplicate_count,
        "missing_summary": missing_df,
        "outlier_summary": outlier_summary
    }

def preprocess_data(input_path: str = "data/raw/EMI_dataset.csv", output_dir: str = "data/processed") -> None:
    raw_file = pathlib.Path(input_path)
    if not raw_file.exists():
        raise FileNotFoundError(f"Input data file not found at {input_path}. Please run src/data_generation.py first.")
        
    print(f"Loading raw dataset from {input_path}...")
    df = pd.read_csv(raw_file)
    
    # 1. Quality Assessment
    perform_data_quality_assessment(df)
    
    # 2. Drop Exact Duplicates
    initial_len = len(df)
    df = df.drop_duplicates().reset_index(drop=True)
    print(f"Dropped {initial_len - len(df)} duplicate rows. Current shape: {df.shape}")
    
    # 3. Impute Missing Values
    # Numeric imputation with median (robust to skewness/outliers)
    num_cols = df.select_dtypes(include=[np.number]).columns
    for col in num_cols:
        if df[col].isnull().sum() > 0:
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val)
            print(f"Imputed missing values in '{col}' with median: {median_val}")
            
    # Categorical imputation with mode
    cat_cols = df.select_dtypes(include=["object", "category"]).columns
    for col in cat_cols:
        if df[col].isnull().sum() > 0:
            mode_val = df[col].mode()[0]
            df[col] = df[col].fillna(mode_val)
            print(f"Imputed missing values in '{col}' with mode: {mode_val}")
            
    # 4. Outlier Capping / Winsorization (1st and 99th percentiles)
    # Exclude targets from winsorization
    features_to_cap = [c for c in num_cols if c not in ["max_monthly_emi"]]
    for col in features_to_cap:
        lower_cap = df[col].quantile(0.005)
        upper_cap = df[col].quantile(0.995)
        df[col] = np.clip(df[col], lower_cap, upper_cap)
    print("Winsorized numeric features at 0.5th and 99.5th percentiles.")
    
    # 5. Train / Validation / Test Split (70% train, 15% val, 15% test)
    # Stratified on classification target 'emi_eligibility'
    train_df, temp_df = train_test_split(
        df,
        test_size=0.30,
        random_state=42,
        stratify=df["emi_eligibility"]
    )
    
    val_df, test_df = train_test_split(
        temp_df,
        test_size=0.50,
        random_state=42,
        stratify=temp_df["emi_eligibility"]
    )
    
    out_path = pathlib.Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    
    train_file = out_path / "train.csv"
    val_file = out_path / "val.csv"
    test_file = out_path / "test.csv"
    
    train_df.to_csv(train_file, index=False)
    val_df.to_csv(val_file, index=False)
    test_df.to_csv(test_file, index=False)
    
    print(f"\nProcessed dataset splits successfully saved to {output_dir}/:")
    print(f"  - Train split: {train_df.shape} ({train_file})")
    print(f"  - Validation split: {val_df.shape} ({val_file})")
    print(f"  - Test split: {test_df.shape} ({test_file})")

if __name__ == "__main__":
    preprocess_data()
