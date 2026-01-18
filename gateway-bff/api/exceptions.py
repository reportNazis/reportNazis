"""
Secure exception handler for DRF.

Security principle: Never expose internal error details to clients.
All exceptions are logged with full context but clients receive
generic error messages.
"""
import logging
from typing import Optional

from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def secure_exception_handler(exc: Exception, context: dict) -> Optional[Response]:
    """
    Handle exceptions securely by masking internal details.
    
    Args:
        exc: The exception that was raised.
        context: Context from the view, includes request.
        
    Returns:
        Response with generic error message, or None if unhandled.
    """
    # Get the standard DRF response
    response = exception_handler(exc, context)
    
    request = context.get('request')
    trace_id = getattr(request, 'trace_id', 'unknown') if request else 'unknown'
    
    if response is not None:
        # DRF handled it - log and sanitize
        logger.warning(
            "Request error trace_id=%s status=%d detail=%s",
            trace_id,
            response.status_code,
            exc,
        )
        
        # For 500+ errors, mask the detail
        if response.status_code >= 500:
            response.data = {'error': 'Internal server error'}
        
        return response
    
    # Unhandled exception - log full stack trace
    logger.exception(
        "Unhandled exception trace_id=%s: %s",
        trace_id,
        exc,
    )
    
    # Return generic 500 error
    return Response(
        {'error': 'Internal server error'},
        status=500,
    )
