"""
Internal Token Middleware.

Security: Validates that requests come from trusted internal services
by checking the X-Internal-Token header against the expected token.
"""
import logging
from typing import Callable

from django.conf import settings
from django.http import HttpRequest, HttpResponse, JsonResponse

logger = logging.getLogger(__name__)


class InternalTokenMiddleware:
    """
    Middleware to validate internal service-to-service tokens.
    
    This ensures that only trusted services (like the BFF Gateway)
    can access backend endpoints. External requests are rejected.
    
    Security controls:
    - Token comparison is constant-time to prevent timing attacks
    - Failed attempts are logged for monitoring
    - Generic error responses to avoid leaking information
    """
    
    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]):
        """
        Initialize middleware.
        
        Args:
            get_response: Next middleware or view in the chain.
        """
        self.get_response = get_response
        self.expected_token = settings.INTERNAL_SERVICE_TOKEN
    
    def __call__(self, request: HttpRequest) -> HttpResponse:
        """
        Validate the internal token header.
        
        Args:
            request: Incoming HTTP request.
            
        Returns:
            Response from downstream or 403 if token invalid.
        """
        provided_token = request.headers.get('X-Internal-Token', '')
        
        # Constant-time comparison to prevent timing attacks
        if not self._constant_time_compare(provided_token, self.expected_token):
            trace_id = getattr(request, 'trace_id', 'unknown')
            logger.warning(
                "Invalid internal token from %s trace_id=%s",
                request.META.get('REMOTE_ADDR', 'unknown'),
                trace_id,
            )
            return JsonResponse(
                {'error': 'Forbidden'},
                status=403,
            )
        
        return self.get_response(request)
    
    def _constant_time_compare(self, val1: str, val2: str) -> bool:
        """
        Compare two strings in constant time.
        
        This prevents timing attacks where an attacker could
        determine the correct token character by character.
        
        Args:
            val1: First string to compare.
            val2: Second string to compare.
            
        Returns:
            True if strings are equal, False otherwise.
        """
        import hmac
        return hmac.compare_digest(val1.encode(), val2.encode())
