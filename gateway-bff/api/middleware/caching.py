"""
Redis Caching Middleware.

Provides request-level caching for GET requests.
Cache key is derived from the request path and query parameters.
"""
import hashlib
import logging
from typing import Callable

from django.core.cache import cache
from django.conf import settings
from django.http import HttpRequest, HttpResponse, JsonResponse

logger = logging.getLogger(__name__)


class CachingMiddleware:
    """
    Middleware to cache GET request responses in Redis.
    
    Behavior:
    - Only caches GET requests
    - Cache key includes path and sorted query params
    - On cache hit: returns cached response immediately
    - On cache miss: proceeds to view, caches response
    
    Note: This is a request-level cache. For more granular caching,
    use view-level caching with @cache_page or manual cache operations.
    """
    
    CACHEABLE_METHODS = frozenset(['GET', 'HEAD'])
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
        Check cache for GET requests before proceeding.
        
        Args:
            request: Incoming HTTP request.
            
        Returns:
            Cached response or fresh response from view.
        """
        # Only cache safe methods
        if request.method not in self.CACHEABLE_METHODS:
            return self.get_response(request)
        
        # Skip caching for exempt paths
        if request.path in self.EXEMPT_PATHS:
            return self.get_response(request)
        
        cache_key = self._build_cache_key(request)
        
        # Try to get from cache
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            logger.debug("Cache HIT for key: %s", cache_key)
            return JsonResponse(cached_data, safe=False)
        
        # Cache miss - proceed to view
        logger.debug("Cache MISS for key: %s", cache_key)
        response = self.get_response(request)
        
        # Only cache successful JSON responses
        if response.status_code == 200 and hasattr(response, 'data'):
            cache.set(cache_key, response.data, settings.CACHE_TTL_DEFAULT)
            logger.debug("Cached response for key: %s (TTL: %ds)", cache_key, settings.CACHE_TTL_DEFAULT)
        
        return response
    
    def _build_cache_key(self, request: HttpRequest) -> str:
        """
        Build a unique cache key for the request.
        
        Args:
            request: The HTTP request.
            
        Returns:
            Cache key string including path and query params hash.
        """
        # Sort query params for consistent cache keys
        query_string = '&'.join(
            f"{k}={v}" for k, v in sorted(request.GET.items())
        )
        
        # Hash for shorter keys
        key_source = f"{request.path}?{query_string}"
        key_hash = hashlib.md5(key_source.encode(), usedforsecurity=False).hexdigest()[:16]
        
        return f"bff:req:{key_hash}"
