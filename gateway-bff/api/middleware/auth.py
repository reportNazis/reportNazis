"""
JWT Authentication Middleware.

Validates JWT tokens using Zitadel's JWKS endpoint with local caching.
Security controls:
- Token expiration validation
- Issuer validation
- Audience validation
- Signature verification via JWKS
"""
import logging
from typing import Callable, Optional

import jwt
from django.conf import settings
from django.http import HttpRequest, HttpResponse, JsonResponse
from jwt import PyJWKClient, PyJWKClientError

logger = logging.getLogger(__name__)

# Initialize JWKS client with caching
_jwks_client: Optional[PyJWKClient] = None


def get_jwks_client() -> PyJWKClient:
    """
    Get or create the JWKS client singleton.
    
    Returns:
        Configured PyJWKClient with caching enabled.
    """
    global _jwks_client
    if _jwks_client is None:
        jwks_url = f"{settings.ZITADEL_ISSUER}/.well-known/jwks.json"
        _jwks_client = PyJWKClient(
            jwks_url,
            cache_jwk_set=True,
            lifespan=settings.JWKS_CACHE_TTL,
        )
        logger.info("Initialized JWKS client for issuer: %s", settings.ZITADEL_ISSUER)
    return _jwks_client


class JWTAuthMiddleware:
    """
    Middleware to validate JWT tokens from Authorization header.
    
    Exempt paths:
    - /api/bff/health/ (health check)
    
    On validation failure:
    - Returns 401 Unauthorized with generic error message
    - Logs detailed error for debugging
    """
    
    EXEMPT_PATHS = frozenset([
        '/api/bff/health/',
    ])
    
    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]):
        """
        Initialize middleware.
        
        Args:
            get_response: Next middleware or view in the chain.
        """
        self.get_response = get_response
    
    def __call__(self, request: HttpRequest) -> HttpResponse:
        """
        Process the request and validate JWT if required.
        
        Args:
            request: Incoming HTTP request.
            
        Returns:
            Response from downstream or 401 if auth fails.
        """
        # Skip auth for exempt paths
        if request.path in self.EXEMPT_PATHS:
            return self.get_response(request)
        
        # Extract token from Authorization header
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return self._unauthorized_response('Missing or invalid Authorization header')
        
        token = auth_header[7:]  # Strip 'Bearer ' prefix
        
        # Validate token
        try:
            claims = self._validate_token(token)
            # Attach claims to request for use in views
            request.jwt_claims = claims
            request.user_id = claims.get('sub')
        except jwt.ExpiredSignatureError:
            logger.warning("Expired JWT token for trace_id=%s", getattr(request, 'trace_id', 'unknown'))
            return self._unauthorized_response('Token expired')
        except jwt.InvalidTokenError as exc:
            logger.warning("Invalid JWT token: %s", exc)
            return self._unauthorized_response('Invalid token')
        except PyJWKClientError as exc:
            logger.error("JWKS client error: %s", exc)
            return self._unauthorized_response('Authentication service unavailable')
        
        return self.get_response(request)
    
    def _validate_token(self, token: str) -> dict:
        """
        Validate JWT token using JWKS.
        
        Args:
            token: Raw JWT token string.
            
        Returns:
            Decoded token claims.
            
        Raises:
            jwt.InvalidTokenError: If token validation fails.
            PyJWKClientError: If JWKS fetching fails.
        """
        client = get_jwks_client()
        signing_key = client.get_signing_key_from_jwt(token)
        
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=['RS256'],
            issuer=settings.ZITADEL_ISSUER,
            audience=settings.JWT_EXPECTED_AUDIENCE,
            options={
                'require': ['exp', 'iat', 'iss', 'sub'],
            }
        )
        return claims
    
    def _unauthorized_response(self, message: str) -> JsonResponse:
        """
        Create a 401 Unauthorized response.
        
        Security: Returns generic error to client, detailed message is logged.
        
        Args:
            message: Internal error message for logging.
            
        Returns:
            JSON response with 401 status.
        """
        # Generic response to avoid leaking security information
        return JsonResponse(
            {'error': 'Unauthorized'},
            status=401,
        )
