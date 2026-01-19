"""
Garbage Collector Tests.

Tests for the garbage collection logic including:
- Deletion of expired temporary objects
- Skipping of confirmed objects (race condition prevention)
- Cleanup of soft-deleted objects
"""
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch

import pytest

from app.minio_client import AssetStatus


class TestGarbageCollection:
    """Tests for garbage collection logic."""
    
    def test_gc_deletes_expired_temporary_objects(self) -> None:
        """Test that GC deletes temporary objects older than max age."""
        with patch("worker.garbage_collector.get_minio_client") as mock_get_client:
            mock_client = MagicMock()
            mock_get_client.return_value = mock_client
            
            # Setup: one expired temporary object
            cutoff = datetime.now(timezone.utc) - timedelta(hours=25)
            mock_client.list_objects_by_status.side_effect = [
                [{
                    "id": "expired-temp-1",
                    "last_modified": cutoff,
                    "tags": {"status": AssetStatus.TEMPORARY},
                }],
                [],  # No deleted objects
            ]
            mock_client.get_object_metadata.return_value = {
                "tags": {"status": AssetStatus.TEMPORARY},
            }
            
            from worker.garbage_collector import run_garbage_collection
            
            stats = run_garbage_collection(mock_client)
            
            assert stats["deleted_temporary"] == 1
            mock_client.delete_object.assert_called_once_with("expired-temp-1")
    
    def test_gc_skips_confirmed_objects(self) -> None:
        """Test that GC skips objects that were confirmed between scan and delete."""
        with patch("worker.garbage_collector.get_minio_client") as mock_get_client:
            mock_client = MagicMock()
            mock_get_client.return_value = mock_client
            
            # Setup: object was temporary at scan time
            cutoff = datetime.now(timezone.utc) - timedelta(hours=25)
            mock_client.list_objects_by_status.side_effect = [
                [{
                    "id": "race-condition-obj",
                    "last_modified": cutoff,
                    "tags": {"status": AssetStatus.TEMPORARY},
                }],
                [],
            ]
            # But now it's permanent (confirmed between scan and delete)
            mock_client.get_object_metadata.return_value = {
                "tags": {"status": AssetStatus.PERMANENT},
            }
            
            from worker.garbage_collector import run_garbage_collection
            
            stats = run_garbage_collection(mock_client)
            
            assert stats["deleted_temporary"] == 0
            assert stats["skipped_confirmed"] == 1
            mock_client.delete_object.assert_not_called()
    
    def test_gc_deletes_soft_deleted_objects(self) -> None:
        """Test that GC permanently deletes soft-deleted objects."""
        with patch("worker.garbage_collector.get_minio_client") as mock_get_client:
            mock_client = MagicMock()
            mock_get_client.return_value = mock_client
            
            # Setup: one soft-deleted object
            mock_client.list_objects_by_status.side_effect = [
                [],  # No temporary objects
                [{
                    "id": "soft-deleted-1",
                    "last_modified": datetime.now(timezone.utc),
                    "tags": {"status": AssetStatus.DELETED},
                }],
            ]
            
            from worker.garbage_collector import run_garbage_collection
            
            stats = run_garbage_collection(mock_client)
            
            assert stats["deleted_soft"] == 1
            mock_client.delete_object.assert_called_once_with("soft-deleted-1")
    
    def test_gc_does_not_delete_recent_temporary_objects(self) -> None:
        """Test that GC does not delete temporary objects younger than max age."""
        with patch("worker.garbage_collector.get_minio_client") as mock_get_client:
            mock_client = MagicMock()
            mock_get_client.return_value = mock_client
            
            # Setup: recent temporary object (should not be returned by list)
            mock_client.list_objects_by_status.side_effect = [
                [],  # No objects older than cutoff
                [],
            ]
            
            from worker.garbage_collector import run_garbage_collection
            
            stats = run_garbage_collection(mock_client)
            
            assert stats["deleted_temporary"] == 0
            mock_client.delete_object.assert_not_called()
    
    def test_gc_handles_errors_gracefully(self) -> None:
        """Test that GC continues processing after errors."""
        with patch("worker.garbage_collector.get_minio_client") as mock_get_client:
            mock_client = MagicMock()
            mock_get_client.return_value = mock_client
            
            # Setup: two objects, first delete fails
            cutoff = datetime.now(timezone.utc) - timedelta(hours=25)
            mock_client.list_objects_by_status.side_effect = [
                [
                    {"id": "fail-obj", "last_modified": cutoff, "tags": {}},
                    {"id": "success-obj", "last_modified": cutoff, "tags": {}},
                ],
                [],
            ]
            mock_client.get_object_metadata.side_effect = [
                {"tags": {"status": AssetStatus.TEMPORARY}},
                {"tags": {"status": AssetStatus.TEMPORARY}},
            ]
            mock_client.delete_object.side_effect = [
                Exception("Simulated failure"),
                True,
            ]
            
            from worker.garbage_collector import run_garbage_collection
            
            stats = run_garbage_collection(mock_client)
            
            assert stats["errors"] == 1
            assert stats["deleted_temporary"] == 1
            assert mock_client.delete_object.call_count == 2
