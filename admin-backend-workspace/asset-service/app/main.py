"""
Asset Service Main Application.

FastAPI application entry point with:
- Structured JSON logging
- CORS configuration (internal only)
- Startup/shutdown lifecycle hooks
- Router registration
"""
import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from pythonjsonlogger import jsonlogger

from app.config import get_settings
from app.minio_client import get_minio_client
from app.routers import assets, health


def setup_logging() -> None:
    """Configure structured JSON logging."""
    settings = get_settings()
    
    handler = logging.StreamHandler(sys.stdout)
    formatter = jsonlogger.JsonFormatter(
        fmt="%(asctime)s %(levelname)s %(name)s %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
    )
    handler.setFormatter(formatter)
    
    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.addHandler(handler)
    root_logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO))
    
    # Reduce noise from libraries
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("minio").setLevel(logging.WARNING)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager.
    
    Handles startup and shutdown tasks:
    - Initialize MinIO client
    - Ensure bucket exists
    """
    logger = logging.getLogger(__name__)
    
    # Startup
    setup_logging()
    logger.info("Asset Service starting up...")
    
    try:
        minio_client = get_minio_client()
        minio_client.ensure_bucket_exists()
        logger.info("MinIO initialized successfully")
    except Exception as exc:
        logger.error("Failed to initialize MinIO: %s", exc)
        # Don't prevent startup - health check will report unhealthy
    
    yield
    
    # Shutdown
    logger.info("Asset Service shutting down...")


# Create FastAPI application
app = FastAPI(
    title="Asset Service",
    description="Secure asset storage microservice",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc",  # ReDoc
)

# Register routers
app.include_router(health.router)
app.include_router(assets.router)


@app.get("/")
async def root() -> dict:
    """Root endpoint returning service information."""
    return {
        "service": "asset-service",
        "version": "1.0.0",
        "docs": "/docs",
    }
