"""
Classification Model Training & MLflow Logging Module for EMIPredict AI.
Trains Logistic Regression, Random Forest, XGBoost, and Gradient Boosting Classifiers.
Logs all hyperparameters, accuracy, precision, recall, f1_score, roc_auc (macro/OvR),
and confusion matrix artifacts to MLflow experiment 'EMIPredict_Classification'.
"""

import os
import sys
import pathlib
import joblib
import pandas as pd
import matplotlib.pyplot as plt

sys.path.append(str(pathlib.Path(__file__).parent.parent))
os.environ["MLFLOW_ALLOW_FILE_STORE"] = "true"

import mlflow

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from xgboost import XGBClassifier

from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, ConfusionMatrixDisplay
)

LABEL_MAPPING = {"Eligible": 0, "High_Risk": 1, "Not_Eligible": 2}
INV_LABEL_MAPPING = {v: k for k, v in LABEL_MAPPING.items()}

def train_and_eval_classifiers(data_dir: str = "data/processed", model_dir: str = "models", tracking_uri: str = "./mlruns") -> None:
    mlflow.set_tracking_uri(tracking_uri)
    mlflow.set_experiment("EMIPredict_Classification")
    
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
    
    print("Transforming features for classification...")
    X_train = pipeline.transform(train_df)
    y_train = train_df["emi_eligibility"].map(LABEL_MAPPING).values
    
    X_val = pipeline.transform(val_df)
    y_val = val_df["emi_eligibility"].map(LABEL_MAPPING).values
    
    X_test = pipeline.transform(test_df)
    y_test = test_df["emi_eligibility"].map(LABEL_MAPPING).values
    
    models = {
        "Logistic_Regression": LogisticRegression(max_iter=150, random_state=42, C=1.0),
        "Decision_Tree": DecisionTreeClassifier(max_depth=10, random_state=42),
        "Random_Forest": RandomForestClassifier(n_estimators=30, max_depth=10, max_samples=0.2, random_state=42, n_jobs=-1),
        "XGBoost": XGBClassifier(n_estimators=40, max_depth=5, learning_rate=0.1, random_state=42, n_jobs=-1, tree_method="hist", eval_metric="mlogloss")
    }
    
    results = {}
    artifact_dir = pathlib.Path("reports/figures/confusion_matrices")
    artifact_dir.mkdir(parents=True, exist_ok=True)
    
    for name, model in models.items():
        print(f"\n--- Training {name} ---")
        with mlflow.start_run(run_name=name) as run:
            model.fit(X_train, y_train)
            
            # Predict on Test set
            y_pred = model.predict(X_test)
            if hasattr(model, "predict_proba"):
                y_prob = model.predict_proba(X_test)
            else:
                y_prob = None
                
            acc = accuracy_score(y_test, y_pred)
            prec = precision_score(y_test, y_pred, average="macro")
            rec = recall_score(y_test, y_pred, average="macro")
            f1 = f1_score(y_test, y_pred, average="macro")
            
            if y_prob is not None:
                roc_auc = roc_auc_score(y_test, y_prob, multi_class="ovr", average="macro")
            else:
                roc_auc = 0.0
                
            print(f"{name} Metrics -> Accuracy: {acc:.4f}, F1: {f1:.4f}, Precision: {prec:.4f}, Recall: {rec:.4f}, ROC_AUC: {roc_auc:.4f}", flush=True)
            
            # Log Hyperparameters
            params = model.get_params()
            for k, v in params.items():
                if isinstance(v, (int, float, str, bool)):
                    mlflow.log_param(k, v)
                    
            # Log Metrics
            mlflow.log_metric("accuracy", float(acc))
            mlflow.log_metric("precision", float(prec))
            mlflow.log_metric("recall", float(rec))
            mlflow.log_metric("f1_score", float(f1))
            mlflow.log_metric("roc_auc", float(roc_auc))
            
            # Create & Log Confusion Matrix Artifact
            cm = confusion_matrix(y_test, y_pred)
            fig, ax = plt.subplots(figsize=(6, 5))
            disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=["Eligible", "High_Risk", "Not_Eligible"])
            disp.plot(ax=ax, cmap="Blues", values_format="d")
            ax.set_title(f"Confusion Matrix - {name}")
            cm_path = artifact_dir / f"cm_{name}.png"
            plt.tight_layout()
            plt.savefig(cm_path)
            plt.close()
            
            mlflow.log_artifact(str(cm_path))
            
            # Save lightweight sklearn/xgboost model artifact to MLflow run dir
            temp_model_path = artifact_dir / f"{name}.pkl"
            joblib.dump(model, temp_model_path)
            mlflow.log_artifact(str(temp_model_path))
            
            results[name] = {
                "run_id": run.info.run_id,
                "accuracy": acc,
                "f1_score": f1,
                "precision": prec,
                "recall": rec,
                "roc_auc": roc_auc
            }
            
    print("\n" + "=" * 60, flush=True)
    print("CLASSIFICATION TRAINING SUMMARY", flush=True)
    print("=" * 60, flush=True)
    res_df = pd.DataFrame(results).T.sort_values(by="f1_score", ascending=False)
    print(res_df, flush=True)
    print("=" * 60, flush=True)

if __name__ == "__main__":
    train_and_eval_classifiers()
