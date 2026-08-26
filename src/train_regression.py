"""
Regression Model Training & MLflow Logging Module for EMIPredict AI.
Trains Linear Regression, Random Forest, XGBoost, and Gradient Boosting Regressors.
Logs all hyperparameters, RMSE, MAE, R2, and MAPE to MLflow experiment 'EMIPredict_Regression'.
Target: Regression RMSE below 2000 INR.
"""

import os
import sys
import pathlib
import joblib
import numpy as np
import pandas as pd

sys.path.append(str(pathlib.Path(__file__).parent.parent))
os.environ["MLFLOW_ALLOW_FILE_STORE"] = "true"

from src.feature_engineering import FinancialFeatureAdder

import mlflow
import mlflow.sklearn
import mlflow.xgboost

from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.tree import DecisionTreeRegressor
from xgboost import XGBRegressor

from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

def calculate_mape(y_true, y_pred) -> float:
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    mask = y_true != 0
    return float(np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100)

def train_and_eval_regressors(data_dir: str = "data/processed", model_dir: str = "models", tracking_uri: str = "./mlruns") -> None:
    mlflow.set_tracking_uri(tracking_uri)
    mlflow.set_experiment("EMIPredict_Regression")
    
    # 1. Load Data & Preprocessor
    path_data = pathlib.Path(data_dir)
    train_df = pd.read_csv(path_data / "train.csv")
    val_df = pd.read_csv(path_data / "val.csv")
    test_df = pd.read_csv(path_data / "test.csv")
    
    path_model = pathlib.Path(model_dir)
    preprocessor_path = path_model / "preprocessor.pkl"
    if not preprocessor_path.exists():
        raise FileNotFoundError("Preprocessor not found at models/preprocessor.pkl. Run src/feature_engineering.py first.")
        
    pipeline = joblib.load(preprocessor_path)
    
    print("Transforming features for regression...")
    X_train = pipeline.transform(train_df)
    y_train = train_df["max_monthly_emi"].values
    
    X_val = pipeline.transform(val_df)
    y_val = val_df["max_monthly_emi"].values
    
    X_test = pipeline.transform(test_df)
    y_test = test_df["max_monthly_emi"].values
    
    models = {
        "Linear_Regression": LinearRegression(n_jobs=-1),
        "Decision_Tree_Regressor": DecisionTreeRegressor(max_depth=10, random_state=42),
        "Random_Forest_Regressor": RandomForestRegressor(n_estimators=30, max_depth=10, max_samples=0.2, random_state=42, n_jobs=-1),
        "XGBoost_Regressor": XGBRegressor(n_estimators=40, max_depth=5, learning_rate=0.1, random_state=42, n_jobs=-1, tree_method="hist")
    }
    
    results = {}
    
    for name, model in models.items():
        print(f"\n--- Training {name} ---")
        with mlflow.start_run(run_name=name) as run:
            model.fit(X_train, y_train)
            
            y_pred = model.predict(X_test)
            
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            mape = calculate_mape(y_test, y_pred)
            
            print(f"{name} Metrics -> RMSE: {rmse:.2f} INR, MAE: {mae:.2f} INR, R2: {r2:.4f}, MAPE: {mape:.2f}%", flush=True)
            
            # Log Hyperparameters
            params = model.get_params()
            for k, v in params.items():
                if isinstance(v, (int, float, str, bool)):
                    mlflow.log_param(k, v)
                    
            # Log Metrics
            mlflow.log_metric("rmse", float(rmse))
            mlflow.log_metric("mae", float(mae))
            mlflow.log_metric("r2", float(r2))
            mlflow.log_metric("mape", float(mape))
            
            # Log Model Artifact
            art_dir = pathlib.Path("reports/figures/regression_artifacts")
            art_dir.mkdir(parents=True, exist_ok=True)
            temp_model_path = art_dir / f"{name}.pkl"
            joblib.dump(model, temp_model_path)
            mlflow.log_artifact(str(temp_model_path))
                
            results[name] = {
                "run_id": run.info.run_id,
                "rmse": rmse,
                "mae": mae,
                "r2": r2,
                "mape": mape
            }
            
    print("\n" + "=" * 60, flush=True)
    print("REGRESSION TRAINING SUMMARY", flush=True)
    print("=" * 60, flush=True)
    res_df = pd.DataFrame(results).T.sort_values(by="rmse", ascending=True)
    print(res_df, flush=True)
    print("=" * 60, flush=True)

if __name__ == "__main__":
    train_and_eval_regressors()
