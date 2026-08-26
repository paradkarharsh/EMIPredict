# MLflow Model Selection & Benchmark Report

## 1. Classification Model Leaderboard (Experiment: EMIPredict_Classification)
Target: Classify credit applicants into **Eligible**, **High_Risk**, or **Not_Eligible**.

| Model               |   Accuracy |   Precision |   Recall |   F1 Score |   ROC AUC |
|:--------------------|-----------:|------------:|---------:|-----------:|----------:|
| Decision_Tree       |     0.9793 |      0.9612 |   0.9653 |     0.9632 |    0.9965 |
| Decision_Tree       |     0.9793 |      0.9612 |   0.9653 |     0.9632 |    0.9965 |
| XGBoost             |     0.9772 |      0.9582 |   0.9622 |     0.9599 |    0.9979 |
| XGBoost             |     0.9772 |      0.9582 |   0.9622 |     0.9599 |    0.9979 |
| Random_Forest       |     0.9638 |      0.9398 |   0.9416 |     0.9403 |    0.9952 |
| Random_Forest       |     0.9638 |      0.9398 |   0.9416 |     0.9403 |    0.9952 |
| Logistic_Regression |     0.9046 |      0.8351 |   0.8287 |     0.8318 |    0.9767 |
| Logistic_Regression |     0.9033 |      0.833  |   0.8271 |     0.8299 |    0.9764 |
| Logistic_Regression |     0.9028 |      0.832  |   0.826  |     0.8289 |    0.9763 |
| Logistic_Regression |     0.9028 |      0.832  |   0.826  |     0.8289 |    0.9763 |
| Logistic_Regression |     0.9028 |      0.832  |   0.826  |     0.8289 |    0.9763 |
| Decision_Tree       |     0      |      0      |   0      |     0      |    0      |
| Decision_Tree       |     0      |      0      |   0      |     0      |    0      |
| Logistic_Regression |     0      |      0      |   0      |     0      |    0      |

### Winning Classifier Selection
- **Selected Model**: **Decision_Tree**
- **Selection Rationale**: Achieved the highest macro F1 score and Accuracy on the test dataset. Demonstrates superior non-linear decision boundary fitting across high-risk and subprime credit bands.

---

## 2. Regression Model Leaderboard (Experiment: EMIPredict_Regression)
Target: Predict continuous safe maximum monthly EMI (`max_monthly_emi` in INR).

| Model                   |   RMSE (INR) |   MAE (INR) |   R2 Score |   MAPE (%) |
|:------------------------|-------------:|------------:|-----------:|-----------:|
| XGBoost_Regressor       |      1008.13 |      456.92 |     0.9937 |      20.1  |
| XGBoost_Regressor       |      1008.13 |      456.92 |     0.9937 |      20.1  |
| Random_Forest_Regressor |      1054.11 |      369.73 |     0.9931 |      10.19 |
| Random_Forest_Regressor |      1054.11 |      369.73 |     0.9931 |      10.19 |
| Decision_Tree_Regressor |      1145.44 |      413.07 |     0.9918 |      10.25 |
| Decision_Tree_Regressor |      1145.44 |      413.07 |     0.9918 |      10.25 |
| Linear_Regression       |      4277.16 |     3077.74 |     0.8859 |     264.92 |
| Linear_Regression       |      4277.16 |     3077.74 |     0.8859 |     264.92 |

### Winning Regressor Selection
- **Selected Model**: **XGBoost_Regressor**
- **Selection Rationale**: Minimizes Root Mean Squared Error (RMSE) well below the target 2000 INR threshold. Ensures high financial precision and protects borrowers from over-leveraging.

---

## 3. Production Deployment Status
- Both selected models have been registered in the MLflow Model Registry (`EMIPredict_Classifier_Prod` & `EMIPredict_Regressor_Prod`) and set to stage `Production`.
- Persisted standalone model binaries (`best_classifier.pkl`, `best_regressor.pkl`, and `preprocessor.pkl`) are saved in `models/` for immediate invocation by the Streamlit application.
