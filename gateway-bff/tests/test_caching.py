"""
TDD Tests for CachingMiddleware.

These tests verify the Redis caching behavior of the BFF Gateway.
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
from django.http import HttpRequest, JsonResponse
from django.test import RequestFactory

from api.middleware.caching import CachingMiddleware


class TestCachingMiddleware:
    """Test suite for CachingMiddleware."""
    
    @pytest.fixture
    def request_factory(self):
        """Provide Django RequestFactory."""
        return RequestFactory()
    
    @pytest.fixture
    def mock_get_response(self):
        """Mock the downstream view response."""
        response = Mock()
        response.status_code = 200
        response.data = {'test': 'data'}
        return Mock(return_value=response)
    
    def test_non_get_request_bypasses_cache(self, request_factory, mock_get_response):
        """POST, PUT, DELETE requests should bypass caching."""
        middleware = CachingMiddleware(mock_get_response)
        
        request = request_factory.post('/api/bff/data/')
        
        with patch('api.middleware.caching.cache') as mock_cache:
            middleware(request)
            
            # Cache should not be checked for POST
            mock_cache.get.assert_not_called()
    
    def test_exempt_path_bypasses_cache(self, request_factory, mock_get_response):
        """Health check endpoint should bypass caching."""
        middleware = CachingMiddleware(mock_get_response)
        
        request = request_factory.get('/api/bff/health/')
        
        with patch('api.middleware.caching.cache') as mock_cache:
            middleware(request)
            
            mock_cache.get.assert_not_called()
    
    def test_cache_hit_returns_cached_response(self, request_factory):
        """On cache hit, return cached data without calling view."""
        mock_view = Mock()  # Should not be called
        middleware = CachingMiddleware(mock_view)
        
        request = request_factory.get('/api/bff/data/')
        
        with patch('api.middleware.caching.cache') as mock_cache:
            mock_cache.get.return_value = {'cached': 'response'}
            
            response = middleware(request)
            
            # View should not be called
            mock_view.assert_not_called()
            # Response should be the cached data
            assert isinstance(response, JsonResponse)
    
    def test_cache_miss_calls_view_and_caches(self, request_factory, mock_get_response):
        """On cache miss, call view and cache the response."""
        middleware = CachingMiddleware(mock_get_response)
        
        request = request_factory.get('/api/bff/data/')
        
        with patch('api.middleware.caching.cache') as mock_cache:
            mock_cache.get.return_value = None
            
            middleware(request)
            
            # View should be called
            mock_get_response.assert_called_once()
            # Response should be cached
            mock_cache.set.assert_called_once()
    
    def test_cache_key_includes_query_params(self, request_factory, mock_get_response):
        """Cache key should be different for different query params."""
        middleware = CachingMiddleware(mock_get_response)
        
        request1 = request_factory.get('/api/bff/data/', {'page': '1'})
        request2 = request_factory.get('/api/bff/data/', {'page': '2'})
        
        key1 = middleware._build_cache_key(request1)
        key2 = middleware._build_cache_key(request2)
        
        assert key1 != key2
    
    def test_cache_key_consistent_for_same_request(self, request_factory, mock_get_response):
        """Same request should produce same cache key."""
        middleware = CachingMiddleware(mock_get_response)
        
        request1 = request_factory.get('/api/bff/data/', {'a': '1', 'b': '2'})
        request2 = request_factory.get('/api/bff/data/', {'b': '2', 'a': '1'})  # Different order
        
        key1 = middleware._build_cache_key(request1)
        key2 = middleware._build_cache_key(request2)
        
        # Keys should be same because query params are sorted
        assert key1 == key2
