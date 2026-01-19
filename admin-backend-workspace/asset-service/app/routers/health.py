"""
Health Check Router.

Provides health and readiness endpoints for container orchestration.
"""
import logging

from fastapi import APIRouter
from pydantic import BaseModel

from app.minio_client import get_minio_client

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    """Health check response model."""
    
    status: str
    minio: str


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Health check endpoint for container orchestration.
    
    Returns:
        HealthResponse: Current health status of the service.
    """
    minio_status = "disconnected"
    
    try:
        client = get_minio_client()
        # Quick connectivity check
        client.client.bucket_exists(client.bucket)
        minio_status = "connected"
    except Exception as exc:
        logger.warning("MinIO health check failed: %s", exc)
    
    return HealthResponse(
        status="healthy",
        minio=minio_status,
    )


@router.get("/ready")
async def readiness_check() -> dict:
    """
    Readiness check - service is ready to accept traffic.
    
    Returns:
        dict: Ready status.
    """
    try:
        client = get_minio_client()
        client.client.bucket_exists(client.bucket)
        return {"ready": True}
    except Exception:
        return {"ready": False}
