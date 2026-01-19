"""
Assets Router.

Provides asset management endpoints:
- POST /upload: Upload a new asset
- GET /asset/{id}: Retrieve an asset
- DELETE /asset/{id}: Soft delete an asset
- PUT /confirm/{id}: Confirm a temporary asset
"""
import logging
from typing import Annotated

from fastapi import APIRouter, File, HTTPException, Response, UploadFile, status
from minio.error import S3Error
from pydantic import BaseModel

from app.dependencies import MinioClientDep, ServiceTokenDep, TraceIdDep
from app.minio_client import AssetStatus

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/asset", tags=["Assets"])


class AssetUploadResponse(BaseModel):
    """Response model for asset upload."""
    
    id: str
    status: str
    message: str


class AssetMetadataResponse(BaseModel):
    """Response model for asset metadata."""
    
    id: str
    status: str
    size: int
    content_type: str
    original_filename: str | None = None
    created_at: str | None = None


class AssetConfirmResponse(BaseModel):
    """Response model for asset confirmation."""
    
    id: str
    status: str
    message: str


class AssetDeleteResponse(BaseModel):
    """Response model for asset deletion."""
    
    id: str
    status: str
    message: str


@router.post(
    "/upload",
    response_model=AssetUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_asset(
    file: Annotated[UploadFile, File(description="File to upload")],
    minio_client: MinioClientDep,
    _auth: ServiceTokenDep,
    trace_id: TraceIdDep,
) -> AssetUploadResponse:
    """
    Upload a new asset.
    
    The asset is initially tagged as 'temporary' and must be confirmed
    via the PUT /confirm/{id} endpoint to become permanent.
    
    Args:
        file: The file to upload.
        minio_client: MinIO client dependency.
        _auth: Service token validation (unused but required).
        trace_id: Trace ID for logging.
    
    Returns:
        AssetUploadResponse: Upload result with asset ID.
    
    Raises:
        HTTPException: 400 if file is empty, 500 on storage error.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required",
        )
    
    # Read file content
    content = await file.read()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is empty",
        )
    
    content_type = file.content_type or "application/octet-stream"
    
    try:
        import io
        file_stream = io.BytesIO(content)
        
        object_id = minio_client.upload_object(
            file_data=file_stream,
            file_size=len(content),
            content_type=content_type,
            original_filename=file.filename,
        )
        
        logger.info(
            "Asset uploaded: id=%s, filename=%s, trace_id=%s",
            object_id, file.filename, trace_id
        )
        
        return AssetUploadResponse(
            id=object_id,
            status=AssetStatus.TEMPORARY,
            message="Asset uploaded successfully. Call PUT /confirm/{id} to make it permanent.",
        )
        
    except S3Error as exc:
        logger.error("MinIO upload error: %s, trace_id=%s", exc, trace_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to store asset",
        )


@router.get("/{asset_id}")
async def get_asset(
    asset_id: str,
    minio_client: MinioClientDep,
    _auth: ServiceTokenDep,
    trace_id: TraceIdDep,
) -> Response:
    """
    Retrieve an asset by ID.
    
    The asset is automatically decrypted by MinIO if SSE is enabled.
    
    Args:
        asset_id: UUID of the asset to retrieve.
        minio_client: MinIO client dependency.
        _auth: Service token validation.
        trace_id: Trace ID for logging.
    
    Returns:
        Response: Binary file content with appropriate content type.
    
    Raises:
        HTTPException: 404 if asset not found, 500 on storage error.
    """
    try:
        data, content_type, metadata = minio_client.get_object(asset_id)
        
        # Check if asset is soft-deleted
        meta = minio_client.get_object_metadata(asset_id)
        if meta.get("tags", {}).get("status") == AssetStatus.DELETED:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Asset not found",
            )
        
        original_filename = metadata.get("x-amz-meta-original-filename", "download")
        
        logger.info(
            "Asset retrieved: id=%s, size=%d, trace_id=%s",
            asset_id, len(data), trace_id
        )
        
        return Response(
            content=data,
            media_type=content_type,
            headers={
                "Content-Disposition": f'attachment; filename="{original_filename}"',
                "X-Asset-Id": asset_id,
            },
        )
        
    except S3Error as exc:
        if "NoSuchKey" in str(exc) or "not found" in str(exc).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Asset not found",
            )
        logger.error("MinIO get error: %s, trace_id=%s", exc, trace_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve asset",
        )


@router.get("/{asset_id}/metadata", response_model=AssetMetadataResponse)
async def get_asset_metadata(
    asset_id: str,
    minio_client: MinioClientDep,
    _auth: ServiceTokenDep,
    trace_id: TraceIdDep,
) -> AssetMetadataResponse:
    """
    Get asset metadata without downloading the file.
    
    Args:
        asset_id: UUID of the asset.
        minio_client: MinIO client dependency.
        _auth: Service token validation.
        trace_id: Trace ID for logging.
    
    Returns:
        AssetMetadataResponse: Asset metadata.
    
    Raises:
        HTTPException: 404 if asset not found.
    """
    try:
        meta = minio_client.get_object_metadata(asset_id)
        
        return AssetMetadataResponse(
            id=asset_id,
            status=meta.get("tags", {}).get("status", "unknown"),
            size=meta.get("size", 0),
            content_type=meta.get("content_type", "application/octet-stream"),
            original_filename=meta.get("metadata", {}).get("x-amz-meta-original-filename"),
            created_at=meta.get("metadata", {}).get("x-amz-meta-created-at"),
        )
        
    except S3Error as exc:
        if "NoSuchKey" in str(exc) or "not found" in str(exc).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Asset not found",
            )
        logger.error("MinIO metadata error: %s, trace_id=%s", exc, trace_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve asset metadata",
        )


@router.put("/confirm/{asset_id}", response_model=AssetConfirmResponse)
async def confirm_asset(
    asset_id: str,
    minio_client: MinioClientDep,
    _auth: ServiceTokenDep,
    trace_id: TraceIdDep,
) -> AssetConfirmResponse:
    """
    Confirm a temporary asset, making it permanent.
    
    This changes the asset's status tag from 'temporary' to 'permanent',
    preventing it from being deleted by the garbage collector.
    
    Args:
        asset_id: UUID of the asset to confirm.
        minio_client: MinIO client dependency.
        _auth: Service token validation.
        trace_id: Trace ID for logging.
    
    Returns:
        AssetConfirmResponse: Confirmation result.
    
    Raises:
        HTTPException: 404 if asset not found, 500 on storage error.
    """
    try:
        minio_client.confirm_object(asset_id)
        
        logger.info(
            "Asset confirmed: id=%s, trace_id=%s",
            asset_id, trace_id
        )
        
        return AssetConfirmResponse(
            id=asset_id,
            status=AssetStatus.PERMANENT,
            message="Asset confirmed and will not be garbage collected.",
        )
        
    except S3Error as exc:
        if "NoSuchKey" in str(exc) or "not found" in str(exc).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Asset not found",
            )
        logger.error("MinIO confirm error: %s, trace_id=%s", exc, trace_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to confirm asset",
        )


@router.delete("/{asset_id}", response_model=AssetDeleteResponse)
async def delete_asset(
    asset_id: str,
    minio_client: MinioClientDep,
    _auth: ServiceTokenDep,
    trace_id: TraceIdDep,
) -> AssetDeleteResponse:
    """
    Soft delete an asset.
    
    The asset is marked as 'deleted' but not physically removed.
    The garbage collector will permanently remove it later.
    
    Args:
        asset_id: UUID of the asset to delete.
        minio_client: MinIO client dependency.
        _auth: Service token validation.
        trace_id: Trace ID for logging.
    
    Returns:
        AssetDeleteResponse: Deletion result.
    
    Raises:
        HTTPException: 404 if asset not found, 500 on storage error.
    """
    try:
        minio_client.soft_delete_object(asset_id)
        
        logger.info(
            "Asset soft deleted: id=%s, trace_id=%s",
            asset_id, trace_id
        )
        
        return AssetDeleteResponse(
            id=asset_id,
            status=AssetStatus.DELETED,
            message="Asset marked for deletion. It will be permanently removed later.",
        )
        
    except S3Error as exc:
        if "NoSuchKey" in str(exc) or "not found" in str(exc).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Asset not found",
            )
        logger.error("MinIO delete error: %s, trace_id=%s", exc, trace_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete asset",
        )
