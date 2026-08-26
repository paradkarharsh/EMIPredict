# EMIPredict AI — Intelligent Financial Risk Assessment Platform

[![Next.js 14](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![MLflow](https://img.shields.io/badge/MLflow-Tracking%20%26%20Registry-0194E2?style=for-the-badge&logo=mlflow&logoColor=white)](https://mlflow.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-Models-22C55E?style=for-the-badge)](https://xgboost.readthedocs.io)

**EMIPredict AI** is a production-grade FinTech platform delivering intelligent credit risk classification and continuous EMI affordability quantification. Built on a dataset of 400,000 credit records across 5 loan EMI scenarios, it pairs a high-performance **FastAPI** machine learning backend with an **Apple-inspired Next.js 14 (App Router)** frontend.

---

## 🏗️ System Architecture

```
emipredict-ai/
├── api/                          # FastAPI Backend Service
│   ├── main.py                   # Loads .pkl models on startup + CORS middleware
│   ├── schemas.py                # Pydantic schemas for 22 input features & responses
│   ├── predict.py                # /predict/eligibility, /predict/max-emi, /predict/full
│   ├── models_info.py            # /models/performance, /explorer/stats
│   └── requirements.txt
├── web/                          # Next.js 14 Production Frontend
│   ├── app/
│   │   ├── page.tsx              # Cinematic Apple landing & hero
│   │   ├── predict/page.tsx      # 5-section glass form → animated dual result reveal
│   │   ├── models/page.tsx       # Model performance & MLflow leaderboard comparison
│   │   ├── explorer/page.tsx     # Dataset & portfolio explorer with Recharts
│   │   └── layout.tsx            # Global layout, glass navbar & ThemeProvider
│   ├── components/               # Navbar, Footer, CountUpNumber, StatusBadge, MetricCard
│   ├── lib/                      # Type-safe API client, types & test presets
│   ├── tailwind.config.ts        # Apple FinTech tokens, SF Pro font stack, ease-out motion
│   └── package.json
├── data/                         # 400,000 synthetic credit applications (data/raw/EMI_dataset.csv)
├── src/                          # Preprocessing, feature engineering & model training
├── models/                       # best_classifier.pkl, best_regressor.pkl, preprocessor.pkl
├── mlruns/                       # MLflow experiment tracking store
└── reports/                      # EDA, Model Comparison, and ROI impact reports
```

---

## ⚡ Quickstart Guide (Local Development)

### 1. Start the FastAPI Backend Service
```bash
# From repository root
cd emipredict-ai

# Activate Python virtual environment and install requirements
pip install -r api/requirements.txt

# Start FastAPI server on port 8000
uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload
```
API Swagger docs will be available at: `http://localhost:8000/docs`

### 2. Start the Next.js Frontend
```bash
# In a new terminal tab, navigate to web directory
cd web

# Install dependencies
npm install

# Start Next.js development server on port 3000
npm run dev
```
Open `http://localhost:3000` in your browser to experience the application.

---

## 🌐 API Contract & Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service health status & ML model initialization check |
| `POST` | `/predict/eligibility` | 3-Tier credit risk classification (`Eligible`, `High_Risk`, `Not_Eligible`) |
| `POST` | `/predict/max-emi` | Continuous regression predicting maximum safe monthly EMI (INR) |
| `POST` | `/predict/full` | Combined classification + regression + sensitivity curve in one call |
| `GET` | `/models/performance` | MLflow experiment leaderboards, metrics, and production model tags |
| `GET` | `/explorer/stats` | Dataset cohort distributions, scenario share, and scatter sample |

---

## 🏆 Model Performance Summary

### 1. Classification Leaderboard (Target: Accuracy > 90%)
| Model | Accuracy | Macro F1 | Precision | Recall | ROC AUC | Stage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Decision Tree** | **97.93%** | **0.9632** | **0.9612** | **0.9653** | **0.9965** | **Production** |
| **XGBoost Classifier** | 97.72% | 0.9599 | 0.9582 | 0.9622 | 0.9979 | Candidate |
| **Random Forest** | 96.38% | 0.9403 | 0.9398 | 0.9416 | 0.9952 | Candidate |
| **Logistic Regression** | 90.28% | 0.8289 | 0.8320 | 0.8260 | 0.9763 | Baseline |

### 2. Regression Leaderboard (Target: RMSE < ₹2,000)
| Model | RMSE (INR) | MAE (INR) | R² Score | MAPE (%) | Stage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **XGBoost Regressor** | **₹1,008.13** | **₹456.92** | **0.9937** | **20.10%** | **Production** |
| **Random Forest Regressor** | ₹1,054.11 | ₹369.73 | 0.9931 | 10.19% | Candidate |
| **Decision Tree Regressor** | ₹1,145.44 | ₹413.07 | 0.9918 | 10.25% | Candidate |
| **Linear Regression** | ₹4,277.16 | ₹3,077.74 | 0.8859 | 264.92% | Baseline |

---

## ☁️ Deployment Guidelines

### Frontend: Vercel
1. Import the repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `web`.
3. Configure Environment Variable:
   ```env
   NEXT_PUBLIC_API_URL=https://your-api-domain.railway.app
   ```
4. Deploy!

### Backend API: Railway / Render / Fly.io
1. Deploy as a Python application with root directory at repository root.
2. Build Command: `pip install -r api/requirements.txt`
3. Start Command: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
4. Ensure `models/` directory with pickle artifacts is included in the deployment bundle.
