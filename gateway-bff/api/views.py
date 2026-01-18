"""
BFF Gateway Views.

Responsible for:
- Fetching data from upstream backend services
- Translating/restructuring JSON responses for frontend consumption
- Asynchronous logging to the log service
"""
import logging
import threading
from typing import Any

import requests
from django.conf import settings
from django.core.cache import cache
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)


class HealthCheckView(APIView):
    """
    Health check endpoint for container orchestration.
    
    Returns:
        200 OK with status 'healthy' and Redis connectivity status.
    """
    
    def get(self, request: Request) -> Response:
        """
        Perform health check.
        
        Args:
            request: The incoming HTTP request.
            
        Returns:
            Response with health status.
        """
        redis_ok = False
        try:
            cache.set('health_check', 'ok', 10)
            redis_ok = cache.get('health_check') == 'ok'
        except Exception as exc:
            logger.warning("Redis health check failed: %s", exc)
        
        return Response({
            'status': 'healthy',
            'redis': 'connected' if redis_ok else 'disconnected',
        }, status=status.HTTP_200_OK)


class ProxyDataView(APIView):
    """
    Proxy endpoint that fetches data from the backend, translates it,
    and logs the request asynchronously.
    """
    
    CACHE_KEY_PREFIX = 'proxy_data'
    
    def get(self, request: Request) -> Response:
        """
        Fetch and translate data from upstream backend.
        
        Args:
            request: The incoming HTTP request with trace_id attached.
            
        Returns:
            Translated JSON response from backend.
            
        Raises:
            Upstream errors are logged and masked for security.
        """
        trace_id = getattr(request, 'trace_id', 'unknown')
        cache_key = f"{self.CACHE_KEY_PREFIX}:{request.path}"
        
        # Check cache first
        cached_response = cache.get(cache_key)
        if cached_response is not None:
            self._log_async(trace_id, 'info', {'event': 'cache_hit', 'path': request.path})
            return Response(cached_response, status=status.HTTP_200_OK)
        
        # Fetch from upstream
        try:
            upstream_data = self._fetch_upstream(trace_id)
            translated_data = self._translate_response(upstream_data)
            
            # Cache the translated response
            cache.set(cache_key, translated_data, settings.CACHE_TTL_DEFAULT)
            
            self._log_async(trace_id, 'info', {
                'event': 'cache_miss',
                'path': request.path,
                'upstream_status': 'success',
            })
            
            return Response(translated_data, status=status.HTTP_200_OK)
            
        except requests.RequestException as exc:
            logger.error("Upstream request failed for trace_id=%s: %s", trace_id, exc)
            self._log_async(trace_id, 'error', {
                'event': 'upstream_error',
                'error': str(exc),
            })
            # Security: Return generic error to client
            return Response(
                {'error': 'Service temporarily unavailable'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
    
    def _fetch_upstream(self, trace_id: str) -> dict[str, Any]:
        """
        Fetch data from the upstream backend service.
        
        Args:
            trace_id: Trace ID for distributed tracing.
            
        Returns:
            JSON response from backend.
            
        Raises:
            requests.RequestException: If upstream request fails.
        """
        response = requests.get(
            f"{settings.BACKEND_URL}/api/data/",
            headers={
                'X-Trace-ID': trace_id,
                'X-Internal-Token': settings.INTERNAL_SERVICE_TOKEN,
            },
            timeout=settings.UPSTREAM_TIMEOUT,
        )
        response.raise_for_status()
        return response.json()
    
    def _translate_response(self, upstream_data: dict[str, Any]) -> dict[str, Any]:
        """
        Translate/flatten the upstream response for frontend consumption.
        
        This is where BFF-specific transformations happen:
        - Flatten nested structures
        - Rename fields for frontend conventions
        - Filter sensitive data
        
        Args:
            upstream_data: Raw response from backend.
            
        Returns:
            Translated response suitable for frontend.
        """
        # Example translation: flatten nested user data
        translated = {
            'items': upstream_data.get('data', []),
            'meta': {
                'count': len(upstream_data.get('data', [])),
                'source': 'backend-mock',
            }
        }
        return translated
    
    def _log_async(self, trace_id: str, level: str, payload: dict[str, Any]) -> None:
        """
        Send log entry to log service asynchronously.
        
        Args:
            trace_id: Trace ID for correlation.
            level: Log level (info, warn, error).
            payload: Log payload data.
        """
        def send_log():
            try:
                requests.post(
                    f"{settings.LOG_SERVICE_URL}/api/logs/",
                    json={
                        'level': level,
                        'message': f"BFF request trace_id={trace_id}",
                        'payload': payload,
                    },
                    headers={
                        'X-Trace-ID': trace_id,
                        'X-Internal-Token': settings.INTERNAL_SERVICE_TOKEN,
                    },
                    timeout=5,
                )
            except Exception as exc:
                logger.warning("Failed to send async log: %s", exc)
        
        thread = threading.Thread(target=send_log, daemon=True)
        thread.start()
