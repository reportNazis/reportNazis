"""
TDD Tests for JWT Authentication Middleware.

These tests verify JWT token validation using mocked JWKS.
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
from django.test import RequestFactory
from django.http import JsonResponse

from api.middleware.auth import JWTAuthMiddleware


class TestJWTAuthMiddleware:
    """Test suite for JWTAuthMiddleware."""
    
    @pytest.fixture
    def request_factory(self):
        """Provide Django RequestFactory."""
        return RequestFactory()
    
    @pytest.fixture
    def mock_get_response(self):
        """Mock the downstream middleware/view."""
        response = Mock()
        response.status_code = 200
        return Mock(return_value=response)
    
    def test_health_endpoint_exempt_from_auth(self, request_factory, mock_get_response):
        """Health check endpoint should not require auth."""
        middleware = JWTAuthMiddleware(mock_get_response)
        
        request = request_factory.get('/api/bff/health/')
        
        response = middleware(request)
        
        # Should proceed to view without auth check
        mock_get_response.assert_called_once()
        assert response.status_code == 200
    
    def test_missing_auth_header_returns_401(self, request_factory, mock_get_response):
        """Request without Authorization header should return 401."""
        middleware = JWTAuthMiddleware(mock_get_response)
        
        request = request_factory.get('/api/bff/data/')
        
        response = middleware(request)
        
        assert response.status_code == 401
        mock_get_response.assert_not_called()
    
    def test_invalid_auth_header_format_returns_401(self, request_factory, mock_get_response):
        """Authorization header without 'Bearer ' prefix should return 401."""
        middleware = JWTAuthMiddleware(mock_get_response)
        
        request = request_factory.get('/api/bff/data/', HTTP_AUTHORIZATION='Basic token123')
        
        response = middleware(request)
        
        assert response.status_code == 401
        mock_get_response.assert_not_called()
    
    @patch('api.middleware.auth.get_jwks_client')
    @patch('api.middleware.auth.jwt.decode')
    def test_valid_token_proceeds_to_view(
        self, mock_decode, mock_jwks_client, request_factory, mock_get_response
    ):
        """Valid JWT token should proceed to the view."""
        middleware = JWTAuthMiddleware(mock_get_response)
        
        # Setup mocks
        mock_signing_key = Mock()
        mock_signing_key.key = 'test-key'
        mock_jwks_client.return_value.get_signing_key_from_jwt.return_value = mock_signing_key
        mock_decode.return_value = {'sub': 'user-123', 'exp': 9999999999}
        
        request = request_factory.get('/api/bff/data/', HTTP_AUTHORIZATION='Bearer valid.token.here')
        
        response = middleware(request)
        
        # Should proceed to view
        mock_get_response.assert_called_once()
        # Claims should be attached to request
        assert request.jwt_claims == {'sub': 'user-123', 'exp': 9999999999}
        assert request.user_id == 'user-123'
    
    @patch('api.middleware.auth.get_jwks_client')
    @patch('api.middleware.auth.jwt.decode')
    def test_expired_token_returns_401(
        self, mock_decode, mock_jwks_client, request_factory, mock_get_response
    ):
        """Expired JWT token should return 401."""
        import jwt
        middleware = JWTAuthMiddleware(mock_get_response)
        
        mock_signing_key = Mock()
        mock_signing_key.key = 'test-key'
        mock_jwks_client.return_value.get_signing_key_from_jwt.return_value = mock_signing_key
        mock_decode.side_effect = jwt.ExpiredSignatureError('Token expired')
        
        request = request_factory.get('/api/bff/data/', HTTP_AUTHORIZATION='Bearer expired.token.here')
        
        response = middleware(request)
        
        assert response.status_code == 401
        mock_get_response.assert_not_called()
    
    @patch('api.middleware.auth.get_jwks_client')
    @patch('api.middleware.auth.jwt.decode')
    def test_invalid_token_returns_401(
        self, mock_decode, mock_jwks_client, request_factory, mock_get_response
    ):
        """Invalid JWT token should return 401."""
        import jwt
        middleware = JWTAuthMiddleware(mock_get_response)
        
        mock_signing_key = Mock()
        mock_signing_key.key = 'test-key'
        mock_jwks_client.return_value.get_signing_key_from_jwt.return_value = mock_signing_key
        mock_decode.side_effect = jwt.InvalidTokenError('Invalid token')
        
        request = request_factory.get('/api/bff/data/', HTTP_AUTHORIZATION='Bearer invalid.token')
        
        response = middleware(request)
        
        assert response.status_code == 401
        mock_get_response.assert_not_called()
    
    def test_unauthorized_response_is_generic(self, request_factory, mock_get_response):
        """Unauthorized responses should not leak internal details."""
        middleware = JWTAuthMiddleware(mock_get_response)
        
        request = request_factory.get('/api/bff/data/')
        
        response = middleware(request)
        
        # Response should be generic
        import json
        data = json.loads(response.content)
        assert data == {'error': 'Unauthorized'}
        # Should not contain detailed error info
        assert 'Missing' not in str(response.content)
