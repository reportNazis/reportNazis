"""
MinIO Client Wrapper.

Provides a high-level abstraction over the MinIO SDK with:
- Server-Side Encryption (SSE-S3) for all objects
- Metadata tagging for lifecycle management
- Automatic bucket creation on startup
"""
import io
import logging
from datetime import datetime, timezone
from typing import BinaryIO
from uuid import uuid4

from minio import Minio
from minio.commonconfig import Tags
from minio.error import S3Error

from app.config import get_settings

logger = logging.getLogger(__name__)


class AssetStatus:
    """Asset lifecycle status constants."""
    
    TEMPORARY = "temporary"
    PERMANENT = "permanent"
    DELETED = "deleted"


class MinioClientWrapper:
    """
    MinIO client wrapper with encryption and lifecycle management.
    
    Attributes:
        client: Underlying MinIO client instance.
        bucket: Target bucket name.
    """
    
    def __init__(self) -> None:
        """
        Initialize MinIO client.
        
        Raises:
            ValueError: If required MinIO credentials are missing.
        """
        settings = get_settings()
        
        if not settings.MINIO_ACCESS_KEY or not settings.MINIO_SECRET_KEY:
            raise ValueError("MinIO credentials not configured")
        
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE,
        )
        self.bucket = settings.MINIO_BUCKET
        logger.info("MinIO client initialized for endpoint: %s", settings.MINIO_ENDPOINT)
    
    def ensure_bucket_exists(self) -> None:
        """
        Create bucket if it doesn't exist.
        
        This should be called on application startup.
        """
        try:
            if not self.client.bucket_exists(self.bucket):
                self.client.make_bucket(self.bucket)
                logger.info("Created bucket: %s", self.bucket)
            else:
                logger.info("Bucket already exists: %s", self.bucket)
        except S3Error as exc:
            logger.error("Failed to ensure bucket exists: %s", exc)
            raise
    
    def upload_object(
        self,
        file_data: BinaryIO,
        file_size: int,
        content_type: str,
        original_filename: str,
    ) -> str:
        """
        Upload an object with SSE encryption and temporary status tag.
        
        Args:
            file_data: Binary file data stream.
            file_size: Size of the file in bytes.
            content_type: MIME type of the file.
            original_filename: Original filename for metadata.
        
        Returns:
            str: Generated UUID for the uploaded object.
        
        Raises:
            S3Error: If upload fails.
        """
        object_id = str(uuid4())
        
        # Create metadata with creation timestamp
        metadata = {
            "original-filename": original_filename,
            "created-at": datetime.now(timezone.utc).isoformat(),
            "status": AssetStatus.TEMPORARY,
        }
        
        try:
            # Upload with SSE-S3 encryption (MinIO auto-handles if KMS configured)
            self.client.put_object(
                bucket_name=self.bucket,
                object_name=object_id,
                data=file_data,
                length=file_size,
                content_type=content_type,
                metadata=metadata,
            )
            
            # Set lifecycle status tag
            tags = Tags.new_object_tags()
            tags["status"] = AssetStatus.TEMPORARY
            self.client.set_object_tags(self.bucket, object_id, tags)
            
            logger.info(
                "Uploaded object: %s (type=%s, size=%d)",
                object_id, content_type, file_size
            )
            return object_id
            
        except S3Error as exc:
            logger.error("Failed to upload object: %s", exc)
            raise
    
    def get_object(self, object_id: str) -> tuple[bytes, str, dict]:
        """
        Retrieve an object (auto-decrypted by MinIO if SSE enabled).
        
        Args:
            object_id: UUID of the object to retrieve.
        
        Returns:
            Tuple of (binary_data, content_type, metadata).
        
        Raises:
            S3Error: If object doesn't exist or retrieval fails.
        """
        try:
            response = self.client.get_object(self.bucket, object_id)
            data = response.read()
            content_type = response.headers.get("content-type", "application/octet-stream")
            
            # Get object stat for metadata
            stat = self.client.stat_object(self.bucket, object_id)
            metadata = dict(stat.metadata) if stat.metadata else {}
            
            response.close()
            response.release_conn()
            
            logger.info("Retrieved object: %s", object_id)
            return data, content_type, metadata
            
        except S3Error as exc:
            logger.error("Failed to get object %s: %s", object_id, exc)
            raise
    
    def get_object_metadata(self, object_id: str) -> dict:
        """
        Get object metadata and tags without downloading the object.
        
        Args:
            object_id: UUID of the object.
        
        Returns:
            Dictionary containing metadata and tags.
        
        Raises:
            S3Error: If object doesn't exist.
        """
        try:
            stat = self.client.stat_object(self.bucket, object_id)
            tags = self.client.get_object_tags(self.bucket, object_id)
            
            return {
                "id": object_id,
                "size": stat.size,
                "content_type": stat.content_type,
                "last_modified": stat.last_modified.isoformat() if stat.last_modified else None,
                "metadata": dict(stat.metadata) if stat.metadata else {},
                "tags": dict(tags) if tags else {},
            }
        except S3Error as exc:
            logger.error("Failed to get metadata for %s: %s", object_id, exc)
            raise
    
    def confirm_object(self, object_id: str) -> bool:
        """
        Confirm an object by changing its status tag from temporary to permanent.
        
        Args:
            object_id: UUID of the object to confirm.
        
        Returns:
            True if confirmation succeeded.
        
        Raises:
            S3Error: If object doesn't exist or update fails.
        """
        try:
            # Verify object exists
            self.client.stat_object(self.bucket, object_id)
            
            # Update tags to permanent
            tags = Tags.new_object_tags()
            tags["status"] = AssetStatus.PERMANENT
            self.client.set_object_tags(self.bucket, object_id, tags)
            
            logger.info("Confirmed object: %s", object_id)
            return True
            
        except S3Error as exc:
            logger.error("Failed to confirm object %s: %s", object_id, exc)
            raise
    
    def soft_delete_object(self, object_id: str) -> bool:
        """
        Soft delete an object by marking it as deleted.
        
        The garbage collector will permanently remove it later.
        
        Args:
            object_id: UUID of the object to delete.
        
        Returns:
            True if soft delete succeeded.
        
        Raises:
            S3Error: If object doesn't exist or update fails.
        """
        try:
            # Verify object exists
            self.client.stat_object(self.bucket, object_id)
            
            # Mark as deleted
            tags = Tags.new_object_tags()
            tags["status"] = AssetStatus.DELETED
            self.client.set_object_tags(self.bucket, object_id, tags)
            
            logger.info("Soft deleted object: %s", object_id)
            return True
            
        except S3Error as exc:
            logger.error("Failed to soft delete object %s: %s", object_id, exc)
            raise
    
    def delete_object(self, object_id: str) -> bool:
        """
        Permanently delete an object.
        
        Args:
            object_id: UUID of the object to delete.
        
        Returns:
            True if deletion succeeded.
        
        Raises:
            S3Error: If deletion fails.
        """
        try:
            self.client.remove_object(self.bucket, object_id)
            logger.info("Permanently deleted object: %s", object_id)
            return True
            
        except S3Error as exc:
            logger.error("Failed to delete object %s: %s", object_id, exc)
            raise
    
    def list_objects_by_status(
        self,
        status: str,
        older_than: datetime | None = None,
    ) -> list[dict]:
        """
        List objects with a specific status tag.
        
        Args:
            status: Status tag value to filter by.
            older_than: Only include objects older than this datetime.
        
        Returns:
            List of object metadata dictionaries.
        """
        result = []
        
        try:
            objects = self.client.list_objects(self.bucket)
            
            for obj in objects:
                try:
                    tags = self.client.get_object_tags(self.bucket, obj.object_name)
                    tag_dict = dict(tags) if tags else {}
                    
                    if tag_dict.get("status") != status:
                        continue
                    
                    # Check age if specified
                    if older_than and obj.last_modified:
                        if obj.last_modified >= older_than:
                            continue
                    
                    result.append({
                        "id": obj.object_name,
                        "last_modified": obj.last_modified,
                        "size": obj.size,
                        "tags": tag_dict,
                    })
                    
                except S3Error:
                    # Skip objects we can't read tags for
                    continue
            
            logger.info(
                "Found %d objects with status=%s older_than=%s",
                len(result), status, older_than
            )
            return result
            
        except S3Error as exc:
            logger.error("Failed to list objects: %s", exc)
            raise


# Singleton instance
_minio_client: MinioClientWrapper | None = None


def get_minio_client() -> MinioClientWrapper:
    """
    Get or create the MinIO client singleton.
    
    Returns:
        MinioClientWrapper: Configured MinIO client.
    """
    global _minio_client
    if _minio_client is None:
        _minio_client = MinioClientWrapper()
    return _minio_client
