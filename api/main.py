"""
EMIPredict AI - FastAPI Backend Service.
Loads ML models and preprocessor pipeline on startup and exposes REST endpoints.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import pathlib
import sys
import joblib

# Ensure project root is in sys.path for custom pickle deserialization
project_root = pathlib.Path(__file__).parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from src.feature_engineering import FinancialFeatureAdder
import __main__
setattr(__main__, 'FinancialFeatureAdder', FinancialFeatureAdder)

from api.predict import router as predict_router
from api.models_info import router as models_router

# In-memory model store
model_store = {
    "classifier": None,
    "regressor": None,
    "preprocessor": None,
    "ready": False
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager loading pickled ML models and preprocessors once on startup."""
    print("Initializing EMIPredict AI Machine Learning Runtime...")
    
    cls_path = project_root / "models" / "best_classifier.pkl"
    reg_path = project_root / "models" / "best_regressor.pkl"
    prep_path = project_root / "models" / "preprocessor.pkl"

    if not (cls_path.exists() and reg_path.exists() and prep_path.exists()):
        print("WARNING: Model pickle files not found in models/ directory.")
    else:
        model_store["classifier"] = joblib.load(cls_path)
        model_store["regressor"] = joblib.load(reg_path)
        model_store["preprocessor"] = joblib.load(prep_path)
        model_store["ready"] = True
        print("Successfully loaded Classifier, Regressor, and Feature Preprocessor into memory.")
        
    yield
    
    print("Shutting down EMIPredict AI ML Runtime.")
    model_store.clear()

app = FastAPI(
    title="EMIPredict AI API",
    description="Production-grade Financial Risk Assessment & EMI Affordability Prediction Engine",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local and deployed preview
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for confusion matrix figures and charts if directory exists
figures_dir = project_root / "reports" / "figures"
if figures_dir.exists():
    app.mount("/static/figures", StaticFiles(directory=str(figures_dir)), name="figures")

# Register API routers
app.include_router(predict_router)
app.include_router(models_router)

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "EMIPredict AI API",
        "version": "1.0.0",
        "models_loaded": model_store.get("ready", False)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
