import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.core.config import settings

# Setup logging to see what's happening in the terminal
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="MedRAG Voice Assistant")

# --- CORS CONFIGURATION ---
# This allows your React app (localhost:3000) to talk to this Backend (localhost:8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROUTE INCLUSION ---
# This adds '/api' to every route inside routes.py
app.include_router(router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    """Run when the server starts."""
    logger.info("--- MedRAG Backend Starting ---")
    logger.info(f"Host: {settings.APP_HOST} | Port: {settings.APP_PORT}")
    
    # Ensure the temp folder for audio exists
    os.makedirs("temp", exist_ok=True)

@app.get("/health")
async def health_check():
    """Used to verify the server is alive."""
    return {
        "status": "healthy",
        "model": settings.BEDROCK_MODEL_ID,
        "region": settings.AWS_DEFAULT_REGION
    }