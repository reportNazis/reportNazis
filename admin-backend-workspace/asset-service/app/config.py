"""
Asset Service Configuration.

Centralized configuration management using python-decouple for environment variables.
All secrets and configuration values are loaded from environment variables.
"""
import logging
from functools import lru_cache

from decouple import config

logger = logging.getLogger(__name__)


class Settings:
    """
    Application settings loaded from environment variables.
    
    Attributes:
        MINIO_ENDPOINT: MinIO server endpoint (host:port).
        MINIO_ACCESS_KEY: MinIO access key for authentication.
        MINIO_SECRET_KEY: MinIO secret key for authentication.
        MINIO_BUCKET: Default bucket name for asset storage.
        MINIO_SECURE: Whether to use HTTPS for MinIO connection.
        ASSET_SERVICE_TOKEN: Shared token for service-to-service authentication.
        GC_INTERVAL_HOURS: Interval between garbage collection runs.
        GC_MAX_AGE_HOURS: Maximum age for temporary files before deletion.
    """
    
    # MinIO Configuration
    MINIO_ENDPOINT: str = config('MINIO_ENDPOINT', default='minio:9000')
    MINIO_ACCESS_KEY: str = config('MINIO_ACCESS_KEY', default='')
    MINIO_SECRET_KEY: str = config('MINIO_SECRET_KEY', default='')
    MINIO_BUCKET: str = config('MINIO_BUCKET', default='assets')
    MINIO_SECURE: bool = config('MINIO_SECURE', default=False, cast=bool)
    
    # Service Authentication
    ASSET_SERVICE_TOKEN: str = config('ASSET_SERVICE_TOKEN', default='')
    
    # Garbage Collection Settings
    GC_INTERVAL_HOURS: int = config('GC_INTERVAL_HOURS', default=24, cast=int)
    GC_MAX_AGE_HOURS: int = config('GC_MAX_AGE_HOURS', default=24, cast=int)
    
    # Logging
    LOG_LEVEL: str = config('LOG_LEVEL', default='INFO')
    
    def __init__(self) -> None:
        """Initialize settings and validate required configuration."""
        self._validate()
    
    def _validate(self) -> None:
        """
        Validate that required configuration is present.
        
        Raises:
            ValueError: If required configuration is missing.
        """
        if not self.MINIO_ACCESS_KEY:
            logger.warning("MINIO_ACCESS_KEY not set - MinIO operations will fail")
        if not self.MINIO_SECRET_KEY:
            logger.warning("MINIO_SECRET_KEY not set - MinIO operations will fail")
        if not self.ASSET_SERVICE_TOKEN:
            logger.warning("ASSET_SERVICE_TOKEN not set - auth will reject all requests")


@lru_cache
def get_settings() -> Settings:
    """
    Get cached application settings.
    
    Returns:
        Settings: Application settings instance.
    """
    return Settings()
