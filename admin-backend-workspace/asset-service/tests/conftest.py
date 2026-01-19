"""
Pytest Fixtures and Configuration.

Provides shared fixtures for testing the Asset Service.
"""
import io
import os
from typing import Generator
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient


# Set test environment variables before importing app
os.environ["MINIO_ENDPOINT"] = "localhost:9000"
os.environ["MINIO_ACCESS_KEY"] = "test-access-key"
os.environ["MINIO_SECRET_KEY"] = "test-secret-key"
os.environ["MINIO_BUCKET"] = "test-assets"
os.environ["ASSET_SERVICE_TOKEN"] = "test-service-token"
os.environ["GC_INTERVAL_HOURS"] = "24"
os.environ["GC_MAX_AGE_HOURS"] = "24"


@pytest.fixture
def mock_minio_client() -> Generator[MagicMock, None, None]:
    """
    Create a mock MinIO client for testing.
    
    Yields:
        MagicMock: Mocked MinIO client wrapper.
    """
    mock_client = MagicMock()
    mock_client.bucket = "test-assets"
    mock_client.upload_object.return_value = "test-uuid-1234"
    mock_client.get_object.return_value = (
        b"test file content",
        "image/png",
        {"x-amz-meta-original-filename": "test.png"},
    )
    mock_client.get_object_metadata.return_value = {
        "id": "test-uuid-1234",
        "size": 100,
        "content_type": "image/png",
        "tags": {"status": "temporary"},
    }
    mock_client.confirm_object.return_value = True
    mock_client.soft_delete_object.return_value = True
    mock_client.delete_object.return_value = True
    mock_client.list_objects_by_status.return_value = []
    
    with patch("app.dependencies.get_minio_client", return_value=mock_client):
        with patch("app.routers.health.get_minio_client", return_value=mock_client):
            yield mock_client


@pytest.fixture
def client(mock_minio_client: MagicMock) -> Generator[TestClient, None, None]:
    """
    Create a test client for the FastAPI application.
    
    Args:
        mock_minio_client: Mocked MinIO client.
    
    Yields:
        TestClient: FastAPI test client.
    """
    from app.main import app
    
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def auth_headers() -> dict:
    """
    Return authentication headers for test requests.
    
    Returns:
        dict: Headers with valid service token.
    """
    return {
        "X-Internal-Token": "test-service-token",
        "X-Trace-ID": "test-trace-id",
    }


@pytest.fixture
def invalid_auth_headers() -> dict:
    """
    Return invalid authentication headers for testing rejection.
    
    Returns:
        dict: Headers with invalid service token.
    """
    return {
        "X-Internal-Token": "wrong-token",
        "X-Trace-ID": "test-trace-id",
    }


@pytest.fixture
def sample_file() -> tuple[io.BytesIO, str]:
    """
    Create a sample file for upload testing.
    
    Returns:
        Tuple of (file data, filename).
    """
    return io.BytesIO(b"test file content"), "test-image.png"
