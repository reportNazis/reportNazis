"""
Garbage Collector Worker.

A standalone worker that periodically cleans up:
1. Temporary uploads older than GC_MAX_AGE_HOURS that were never confirmed
2. Soft-deleted assets

Race Condition Prevention:
- Before deleting, we re-check the object's current status
- This prevents deleting objects that were confirmed between scan and delete
"""
import logging
import sys
import time
from datetime import datetime, timedelta, timezone

from pythonjsonlogger import jsonlogger

from app.config import get_settings
from app.minio_client import AssetStatus, MinioClientWrapper, get_minio_client

logger = logging.getLogger(__name__)


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


def run_garbage_collection(minio_client: MinioClientWrapper) -> dict:
    """
    Execute garbage collection for temporary and deleted assets.
    
    This function implements the "double-check before delete" pattern:
    1. Scan for candidates (temporary objects older than max age, or deleted objects)
    2. Before deleting each candidate, re-verify its current status
    3. Only delete if status is still temporary/deleted (prevents race conditions)
    
    Args:
        minio_client: MinIO client wrapper instance.
    
    Returns:
        dict: Summary of garbage collection results.
    """
    settings = get_settings()
    cutoff_time = datetime.now(timezone.utc) - timedelta(hours=settings.GC_MAX_AGE_HOURS)
    
    stats = {
        "scanned": 0,
        "deleted_temporary": 0,
        "deleted_soft": 0,
        "skipped_confirmed": 0,
        "errors": 0,
    }
    
    logger.info(
        "Starting garbage collection (cutoff=%s, max_age_hours=%d)",
        cutoff_time.isoformat(),
        settings.GC_MAX_AGE_HOURS,
    )
    
    # Phase 1: Collect candidates - temporary objects older than cutoff
    try:
        temporary_candidates = minio_client.list_objects_by_status(
            status=AssetStatus.TEMPORARY,
            older_than=cutoff_time,
        )
        logger.info("Found %d temporary candidates", len(temporary_candidates))
    except Exception as exc:
        logger.error("Failed to list temporary objects: %s", exc)
        temporary_candidates = []
        stats["errors"] += 1
    
    # Phase 2: Collect soft-deleted objects (delete immediately, no age check)
    try:
        deleted_candidates = minio_client.list_objects_by_status(
            status=AssetStatus.DELETED,
        )
        logger.info("Found %d soft-deleted candidates", len(deleted_candidates))
    except Exception as exc:
        logger.error("Failed to list deleted objects: %s", exc)
        deleted_candidates = []
        stats["errors"] += 1
    
    stats["scanned"] = len(temporary_candidates) + len(deleted_candidates)
    
    # Phase 3: Delete temporary candidates with race condition prevention
    for candidate in temporary_candidates:
        object_id = candidate["id"]
        
        try:
            # Re-check current status (race condition prevention)
            current_meta = minio_client.get_object_metadata(object_id)
            current_status = current_meta.get("tags", {}).get("status")
            
            if current_status == AssetStatus.TEMPORARY:
                # Double-check the timestamp
                last_modified = candidate.get("last_modified")
                if last_modified and last_modified < cutoff_time:
                    minio_client.delete_object(object_id)
                    stats["deleted_temporary"] += 1
                    logger.info("GC deleted temporary object: %s", object_id)
                else:
                    logger.debug("GC skipped (too recent): %s", object_id)
            elif current_status == AssetStatus.PERMANENT:
                stats["skipped_confirmed"] += 1
                logger.info(
                    "GC skipped (was confirmed between scan and delete): %s",
                    object_id
                )
            else:
                logger.warning(
                    "GC skipped (unexpected status %s): %s",
                    current_status, object_id
                )
                
        except Exception as exc:
            logger.error("GC error processing %s: %s", object_id, exc)
            stats["errors"] += 1
    
    # Phase 4: Delete soft-deleted objects
    for candidate in deleted_candidates:
        object_id = candidate["id"]
        
        try:
            minio_client.delete_object(object_id)
            stats["deleted_soft"] += 1
            logger.info("GC permanently deleted soft-deleted object: %s", object_id)
            
        except Exception as exc:
            logger.error("GC error deleting %s: %s", object_id, exc)
            stats["errors"] += 1
    
    logger.info(
        "Garbage collection complete: %s",
        stats,
    )
    
    return stats


def main() -> None:
    """
    Main entry point for the garbage collection worker.
    
    Runs garbage collection on a configurable interval.
    """
    setup_logging()
    settings = get_settings()
    
    logger.info(
        "Garbage Collector Worker started (interval=%dh, max_age=%dh)",
        settings.GC_INTERVAL_HOURS,
        settings.GC_MAX_AGE_HOURS,
    )
    
    # Wait for MinIO to be ready
    minio_client = None
    max_retries = 10
    retry_delay = 5
    
    for attempt in range(max_retries):
        try:
            minio_client = get_minio_client()
            minio_client.ensure_bucket_exists()
            logger.info("Connected to MinIO successfully")
            break
        except Exception as exc:
            logger.warning(
                "Failed to connect to MinIO (attempt %d/%d): %s",
                attempt + 1, max_retries, exc
            )
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
    
    if minio_client is None:
        logger.error("Failed to connect to MinIO after %d attempts", max_retries)
        sys.exit(1)
    
    # Run garbage collection loop
    interval_seconds = settings.GC_INTERVAL_HOURS * 3600
    
    while True:
        try:
            run_garbage_collection(minio_client)
        except Exception as exc:
            logger.error("Garbage collection failed: %s", exc)
        
        logger.info("Next GC run in %d hours", settings.GC_INTERVAL_HOURS)
        time.sleep(interval_seconds)


if __name__ == "__main__":
    main()
