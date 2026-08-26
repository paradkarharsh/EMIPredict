"""
Synthetic Dataset Generator for EMIPredict AI Platform.
Generates 400,000 records across 5 loan EMI scenarios with 22 features and 2 targets.
Includes realistic missing values, duplicates, and financial outliers.
"""

import pathlib
import numpy as np
import pandas as pd

def generate_emi_dataset(num_records_per_scenario: int = 80000, random_state: int = 42) -> pd.DataFrame:
    np.random.seed(random_state)
    
    scenarios = [
        {"name": "E-commerce Shopping EMI", "min_amt": 10000, "max_amt": 200000, "min_ten": 3, "max_ten": 24},
        {"name": "Home Appliances EMI", "min_amt": 20000, "max_amt": 300000, "min_ten": 6, "max_ten": 36},
        {"name": "Vehicle EMI", "min_amt": 80000, "max_amt": 1500000, "min_ten": 12, "max_ten": 84},
        {"name": "Personal Loan EMI", "min_amt": 50000, "max_amt": 1000000, "min_ten": 12, "max_ten": 60},
        {"name": "Education EMI", "min_amt": 50000, "max_amt": 500000, "min_ten": 6, "max_ten": 48},
    ]

    df_list = []
    
    for sc in scenarios:
        n = num_records_per_scenario
        
        # Demographics
        age = np.random.randint(25, 61, size=n)
        gender = np.random.choice(["Male", "Female"], size=n, p=[0.58, 0.42])
        marital_status = np.random.choice(["Single", "Married"], size=n, p=[0.40, 0.60])
        education = np.random.choice(
            ["High School", "Graduate", "Post Graduate", "Professional"],
            size=n,
            p=[0.15, 0.50, 0.25, 0.10]
        )
        
        # Employment & Income
        # Realistic log-normal distribution for salary bounded between 15,000 and 200,000
        salary_raw = np.random.lognormal(mean=10.6, sigma=0.55, size=n)
        monthly_salary = np.clip(salary_raw, 15000, 200000).round(-2)
        
        employment_type = np.random.choice(
            ["Private", "Government", "Self-employed"],
            size=n,
            p=[0.60, 0.25, 0.15]
        )
        
        max_possible_exp = np.maximum(1, age - 21)
        years_of_employment = (np.random.uniform(0, 1, size=n) * max_possible_exp).astype(int)
        
        company_type = np.random.choice(
            ["Private Ltd", "MNC", "Public Sector", "Startup"],
            size=n,
            p=[0.45, 0.30, 0.15, 0.10]
        )
        
        # Housing & Family
        house_type = np.random.choice(["Rented", "Own", "Family"], size=n, p=[0.45, 0.35, 0.20])
        monthly_rent = np.where(
            house_type == "Rented",
            np.clip(monthly_salary * np.random.uniform(0.15, 0.30, size=n), 4000, 45000).round(-2),
            0.0
        )
        
        family_size = np.random.randint(1, 9, size=n)
        dependents = np.array([np.random.randint(0, max(1, fs)) for fs in family_size])
        
        # Monthly Obligations
        has_dep = dependents > 0
        school_fees = np.where(has_dep, np.random.uniform(1000, 15000, size=n).round(-2), 0.0)
        college_fees = np.where(has_dep & (age > 35), np.random.uniform(0, 25000, size=n).round(-2), 0.0)
        
        travel_expenses = np.clip(monthly_salary * np.random.uniform(0.04, 0.10, size=n), 1000, 15000).round(-2)
        groceries_utilities = np.clip(family_size * np.random.uniform(2000, 4500, size=n), 3000, 25000).round(-2)
        other_monthly_expenses = np.clip(monthly_salary * np.random.uniform(0.03, 0.08, size=n), 1000, 20000).round(-2)
        
        # Financial Status & Credit History
        existing_loans = np.random.choice(["Yes", "No"], size=n, p=[0.45, 0.55])
        current_emi_amount = np.where(
            existing_loans == "Yes",
            np.clip(monthly_salary * np.random.uniform(0.10, 0.35, size=n), 2000, 40000).round(-2),
            0.0
        )
        
        # Credit score skewed slightly towards good scores (300 to 850)
        credit_score = np.clip(np.random.normal(loc=680, scale=85, size=n), 300, 850).astype(int)
        
        bank_balance = np.clip(monthly_salary * np.random.uniform(0.5, 6.0, size=n), 5000, 500000).round(-2)
        emergency_fund = np.clip(bank_balance * np.random.uniform(0.2, 0.8, size=n), 0, 300000).round(-2)
        
        # Loan Application Details
        emi_scenario = sc["name"]
        requested_amount = np.random.uniform(sc["min_amt"], sc["max_amt"], size=n).round(-3)
        requested_tenure = np.random.choice(
            np.arange(sc["min_ten"], sc["max_ten"] + 1, 3 if sc["max_ten"] - sc["min_ten"] > 12 else 1),
            size=n
        )
        
        # Programmatic Target Generation (Affordability Formula)
        total_obligations = (
            monthly_rent + school_fees + college_fees + 
            travel_expenses + groceries_utilities + other_monthly_expenses
        )
        disposable_income = monthly_salary - total_obligations - current_emi_amount
        
        # Estimated monthly EMI for requested amount at ~12% interest p.a.
        annual_rate = 0.12
        monthly_rate = annual_rate / 12.0
        # Formula for EMI: P * r * (1+r)^n / ((1+r)^n - 1)
        pow_factor = (1 + monthly_rate) ** requested_tenure
        est_requested_emi = requested_amount * monthly_rate * pow_factor / (pow_factor - 1)
        
        total_projected_emi = current_emi_amount + est_requested_emi
        projected_dti = total_projected_emi / (monthly_salary + 1e-5)
        
        # 1. Target: max_monthly_emi (Regression)
        # Max FOIR cap based on credit score & salary
        foir_cap = 0.35 + 0.20 * ((credit_score - 300) / 550.0) + 0.10 * np.minimum(1.0, monthly_salary / 100000.0)
        max_allowable_total_emi = monthly_salary * foir_cap
        max_safe_emi_calc = np.maximum(0, max_allowable_total_emi - current_emi_amount)
        # Also cap by disposable income buffer (leave 20% disposable for savings)
        max_safe_emi_calc = np.minimum(max_safe_emi_calc, np.maximum(0, disposable_income * 0.80))
        
        # Add controlled realistic noise (stddev ~400 INR) so it's learnable with RMSE < 2000 INR
        noise_reg = np.random.normal(0, 450, size=n)
        max_monthly_emi = np.clip(max_safe_emi_calc + noise_reg, 500, 50000).round(2)
        
        # 2. Target: emi_eligibility (Classification: Eligible, High_Risk, Not_Eligible)
        # Logic with slight stochastic boundary jitter
        jitter = np.random.normal(0, 0.03, size=n)
        adjusted_dti = projected_dti + jitter
        
        eligibility = []
        for i in range(n):
            c_score = credit_score[i]
            dti = adjusted_dti[i]
            disp = disposable_income[i]
            req_emi = est_requested_emi[i]
            
            if c_score < 540 or dti > 0.58 or disp < req_emi * 0.95:
                eligibility.append("Not_Eligible")
            elif c_score < 660 or dti > 0.42 or disp < req_emi * 1.30:
                eligibility.append("High_Risk")
            else:
                eligibility.append("Eligible")
                
        scenario_df = pd.DataFrame({
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
            "other_monthly_expenses": other_monthly_expenses,
            "existing_loans": existing_loans,
            "current_emi_amount": current_emi_amount,
            "credit_score": credit_score,
            "bank_balance": bank_balance,
            "emergency_fund": emergency_fund,
            "emi_scenario": emi_scenario,
            "requested_amount": requested_amount,
            "requested_tenure": requested_tenure,
            "emi_eligibility": eligibility,
            "max_monthly_emi": max_monthly_emi
        })
        
        df_list.append(scenario_df)
        
    full_df = pd.concat(df_list, ignore_index=True)
    
    # Shuffle full dataset
    full_df = full_df.sample(frac=1.0, random_state=random_state).reset_index(drop=True)
    
    # Inject Messiness: ~3% Missing values in selected numeric/categorical columns
    n_total = len(full_df)
    missing_cols = ["monthly_rent", "years_of_employment", "credit_score", "bank_balance"]
    for col in missing_cols:
        mask = np.random.rand(n_total) < 0.03
        full_df.loc[mask, col] = np.nan
        
    # Inject Messiness: ~800 duplicate rows
    duplicate_rows = full_df.iloc[:800].copy()
    full_df = pd.concat([full_df, duplicate_rows], ignore_index=True)
    
    # Inject Messiness: ~0.1% Outliers in salary & expenses
    outlier_idx = np.random.choice(n_total, size=int(n_total * 0.001), replace=False)
    full_df.loc[outlier_idx, "monthly_salary"] = full_df.loc[outlier_idx, "monthly_salary"] * 8.5
    
    return full_df

if __name__ == "__main__":
    print("Generating synthetic EMI dataset (400,000 base records + messiness)...")
    out_dir = pathlib.Path("data/raw")
    out_dir.mkdir(parents=True, exist_ok=True)
    
    df = generate_emi_dataset(num_records_per_scenario=80000, random_state=42)
    output_path = out_dir / "EMI_dataset.csv"
    df.to_csv(output_path, index=False)
    print(f"Dataset successfully created at {output_path}")
    print(f"Dataset shape: {df.shape}")
    print(f"Target 'emi_eligibility' counts:\n{df['emi_eligibility'].value_counts(dropna=False)}")
