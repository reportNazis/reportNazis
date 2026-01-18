"""
TDD Tests for Internal Token Middleware.

These tests verify service-to-service authentication.
"""
import pytest
from unittest.mock import Mock
from django.test import RequestFactory

from data_app.middleware import InternalTokenMiddleware


class TestInternalTokenMiddleware:
    """Test suite for InternalTokenMiddleware."""
    
    @pytest.fixture
    def request_factory(self):
        """Provide Django RequestFactory."""
        return RequestFactory()
    
    @pytest.fixture
    def mock_get_response(self):
        """Mock downstream view response."""
        response = Mock()
        response.status_code = 200
        return Mock(return_value=response)
    
    def test_valid_token_proceeds_to_view(self, request_factory, mock_get_response):
        """Request with valid internal token should proceed."""
        middleware = InternalTokenMiddleware(mock_get_response)
        
        request = request_factory.get(
            '/api/data/',
            HTTP_X_INTERNAL_TOKEN='dev-internal-token',  # Matches default in settings
        )
        
        response = middleware(request)
        
        mock_get_response.assert_called_once()
        assert response.status_code == 200
    
    def test_missing_token_returns_403(self, request_factory, mock_get_response):
        """Request without internal token should return 403."""
        middleware = InternalTokenMiddleware(mock_get_response)
        
        request = request_factory.get('/api/data/')
        
        response = middleware(request)
        
        assert response.status_code == 403
        mock_get_response.assert_not_called()
    
    def test_invalid_token_returns_403(self, request_factory, mock_get_response):
        """Request with wrong internal token should return 403."""
        middleware = InternalTokenMiddleware(mock_get_response)
        
        request = request_factory.get(
            '/api/data/',
            HTTP_X_INTERNAL_TOKEN='wrong-token',
        )
        
        response = middleware(request)
        
        assert response.status_code == 403
        mock_get_response.assert_not_called()
    
    def test_forbidden_response_is_generic(self, request_factory, mock_get_response):
        """Forbidden responses should not leak internal details."""
        middleware = InternalTokenMiddleware(mock_get_response)
        
        request = request_factory.get('/api/data/')
        
        response = middleware(request)
        
        import json
        data = json.loads(response.content)
        assert data == {'error': 'Forbidden'}
        # Should not contain token information
        assert 'token' not in str(response.content).lower()
