"""
Asset Router Tests.

Tests for the asset CRUD endpoints including:
- Upload with temporary status
- Confirm to permanent
- Get asset
- Soft delete
- Authentication rejection
"""
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient
from minio.error import S3Error


class TestAssetUpload:
    """Tests for POST /asset/upload endpoint."""
    
    def test_upload_creates_temporary_asset(
        self,
        client: TestClient,
        auth_headers: dict,
        mock_minio_client: MagicMock,
    ) -> None:
        """Test that uploading a file creates a temporary asset."""
        response = client.post(
            "/asset/upload",
            headers=auth_headers,
            files={"file": ("test.png", b"test content", "image/png")},
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["id"] == "test-uuid-1234"
        assert data["status"] == "temporary"
        assert "confirm" in data["message"].lower()
        
        mock_minio_client.upload_object.assert_called_once()
    
    def test_upload_requires_auth(
        self,
        client: TestClient,
        invalid_auth_headers: dict,
    ) -> None:
        """Test that upload rejects invalid tokens."""
        response = client.post(
            "/asset/upload",
            headers=invalid_auth_headers,
            files={"file": ("test.png", b"test content", "image/png")},
        )
        
        assert response.status_code == 403
    
    def test_upload_requires_token(
        self,
        client: TestClient,
    ) -> None:
        """Test that upload rejects missing tokens."""
        response = client.post(
            "/asset/upload",
            files={"file": ("test.png", b"test content", "image/png")},
        )
        
        assert response.status_code == 403
    
    def test_upload_rejects_empty_file(
        self,
        client: TestClient,
        auth_headers: dict,
    ) -> None:
        """Test that uploading an empty file is rejected."""
        response = client.post(
            "/asset/upload",
            headers=auth_headers,
            files={"file": ("test.png", b"", "image/png")},
        )
        
        assert response.status_code == 400
        assert "empty" in response.json()["detail"].lower()


class TestAssetGet:
    """Tests for GET /asset/{id} endpoint."""
    
    def test_get_returns_asset_content(
        self,
        client: TestClient,
        auth_headers: dict,
        mock_minio_client: MagicMock,
    ) -> None:
        """Test that get returns the file content."""
        response = client.get(
            "/asset/test-uuid-1234",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        assert response.content == b"test file content"
        assert "image/png" in response.headers["content-type"]
    
    def test_get_returns_404_for_missing(
        self,
        client: TestClient,
        auth_headers: dict,
        mock_minio_client: MagicMock,
    ) -> None:
        """Test that get returns 404 for missing assets."""
        mock_minio_client.get_object.side_effect = S3Error(
            code="NoSuchKey",
            message="Object not found",
            resource="test",
            request_id="test",
            host_id="test",
            response=None,
        )
        
        response = client.get(
            "/asset/nonexistent",
            headers=auth_headers,
        )
        
        assert response.status_code == 404
    
    def test_get_requires_auth(
        self,
        client: TestClient,
    ) -> None:
        """Test that get rejects missing tokens."""
        response = client.get("/asset/test-uuid")
        
        assert response.status_code == 403


class TestAssetConfirm:
    """Tests for PUT /asset/confirm/{id} endpoint."""
    
    def test_confirm_changes_status_to_permanent(
        self,
        client: TestClient,
        auth_headers: dict,
        mock_minio_client: MagicMock,
    ) -> None:
        """Test that confirm changes status to permanent."""
        response = client.put(
            "/asset/confirm/test-uuid-1234",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "permanent"
        
        mock_minio_client.confirm_object.assert_called_once_with("test-uuid-1234")
    
    def test_confirm_returns_404_for_missing(
        self,
        client: TestClient,
        auth_headers: dict,
        mock_minio_client: MagicMock,
    ) -> None:
        """Test that confirm returns 404 for missing assets."""
        mock_minio_client.confirm_object.side_effect = S3Error(
            code="NoSuchKey",
            message="Object not found",
            resource="test",
            request_id="test",
            host_id="test",
            response=None,
        )
        
        response = client.put(
            "/asset/confirm/nonexistent",
            headers=auth_headers,
        )
        
        assert response.status_code == 404


class TestAssetDelete:
    """Tests for DELETE /asset/{id} endpoint."""
    
    def test_delete_soft_deletes_asset(
        self,
        client: TestClient,
        auth_headers: dict,
        mock_minio_client: MagicMock,
    ) -> None:
        """Test that delete performs soft delete."""
        response = client.delete(
            "/asset/test-uuid-1234",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "deleted"
        
        mock_minio_client.soft_delete_object.assert_called_once_with("test-uuid-1234")
    
    def test_delete_requires_auth(
        self,
        client: TestClient,
    ) -> None:
        """Test that delete rejects missing tokens."""
        response = client.delete("/asset/test-uuid")
        
        assert response.status_code == 403
