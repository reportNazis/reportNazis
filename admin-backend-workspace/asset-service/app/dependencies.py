"""
FastAPI Dependencies.

Provides dependency injection for:
- Service-to-service authentication
- Request tracing
- MinIO client access
"""
import logging
import secrets
from functools import wraps
from typing import Annotated, Callable
from uuid import uuid4

from fastapi import Depends, Header, HTTPException, Request, status

from app.config import Settings, get_settings
from app.minio_client import MinioClientWrapper, get_minio_client

logger = logging.getLogger(__name__)


async def get_trace_id(
    x_trace_id: Annotated[str | None, Header()] = None,
) -> str:
    """
    Extract or generate trace ID for distributed tracing.
    
    Args:
        x_trace_id: Optional trace ID from request header.
    
    Returns:
        str: Trace ID (existing or newly generated).
    """
    return x_trace_id or str(uuid4())


async def verify_service_token(
    x_internal_token: Annotated[str | None, Header()] = None,
    settings: Settings = Depends(get_settings),
) -> bool:
    """
    Verify the internal service token for service-to-service authentication.
    
    Args:
        x_internal_token: Token from request header.
        settings: Application settings.
    
    Returns:
        True if token is valid.
    
    Raises:
        HTTPException: 403 if token is missing or invalid.
    """
    if not x_internal_token:
        logger.warning("Missing X-Internal-Token header")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Missing authentication token",
        )
    
    if not settings.ASSET_SERVICE_TOKEN:
        logger.error("ASSET_SERVICE_TOKEN not configured - rejecting all requests")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service not properly configured",
        )
    
    # Constant-time comparison to prevent timing attacks
    if not secrets.compare_digest(x_internal_token, settings.ASSET_SERVICE_TOKEN):
        logger.warning("Invalid X-Internal-Token provided")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid authentication token",
        )
    
    return True


# Type aliases for cleaner dependency injection
ServiceTokenDep = Annotated[bool, Depends(verify_service_token)]
TraceIdDep = Annotated[str, Depends(get_trace_id)]
MinioClientDep = Annotated[MinioClientWrapper, Depends(get_minio_client)]
SettingsDep = Annotated[Settings, Depends(get_settings)]
