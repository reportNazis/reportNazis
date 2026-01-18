"""
Tests for the Login endpoint that proxies authentication to Zitadel Session API.
"""
import pytest
from unittest.mock import patch, MagicMock
from django.test import Client
from rest_framework import status
import json


@pytest.fixture
def client():
    return Client()


class TestLoginView:
    """Tests for the /api/mgmt/login/ endpoint."""

    @pytest.mark.django_db
    def test_login_missing_credentials(self, client):
        """Test that login returns 400 when credentials are missing."""
        response = client.post(
            '/api/mgmt/login/',
            data={},
            content_type='application/json'
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert 'error' in data
        assert 'required' in data['error'].lower()

    @pytest.mark.django_db
    def test_login_missing_password(self, client):
        """Test that login returns 400 when password is missing."""
        response = client.post(
            '/api/mgmt/login/',
            data=json.dumps({'username': 'admin@die-linke-muc.de'}),
            content_type='application/json'
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.django_db
    @patch('mgmt_app.urls.get_zitadel_token')
    def test_login_token_file_not_found(self, mock_get_token, client):
        """Test that login returns 503 when PAT file is not available."""
        mock_get_token.return_value = None

        response = client.post(
            '/api/mgmt/login/',
            data=json.dumps({
                'username': 'admin@die-linke-muc.de',
                'password': 'test123'
            }),
            content_type='application/json'
        )
        assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE

    @pytest.mark.django_db
    @patch('mgmt_app.urls.requests.post')
    @patch('mgmt_app.urls.get_zitadel_token')
    def test_login_zitadel_session_creation_fails(self, mock_get_token, mock_post, client):
        """Test that login returns 401 when Zitadel session creation fails."""
        mock_get_token.return_value = 'fake_token'
        mock_post.return_value = MagicMock(status_code=400, text='User not found')

        response = client.post(
            '/api/mgmt/login/',
            data=json.dumps({
                'username': 'nonexistent@example.com',
                'password': 'wrongpassword'
            }),
            content_type='application/json'
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.django_db
    @patch('mgmt_app.urls.requests.patch')
    @patch('mgmt_app.urls.requests.post')
    @patch('mgmt_app.urls.get_zitadel_token')
    def test_login_zitadel_password_check_fails(self, mock_get_token, mock_post, mock_patch, client):
        """Test that login returns 401 when Zitadel password check fails."""
        mock_get_token.return_value = 'fake_token'
        
        # Session creation succeeds
        mock_post.return_value = MagicMock(
            status_code=201,
            json=lambda: {'sessionId': 'session123', 'sessionToken': 'token123'}
        )
        
        # Password check fails
        mock_patch.return_value = MagicMock(status_code=400, text='Invalid password')

        response = client.post(
            '/api/mgmt/login/',
            data=json.dumps({
                'username': 'admin@die-linke-muc.de',
                'password': 'wrongpassword'
            }),
            content_type='application/json'
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.django_db
    @patch('mgmt_app.urls.requests.patch')
    @patch('mgmt_app.urls.requests.post')
    @patch('mgmt_app.urls.get_zitadel_token')
    def test_login_success(self, mock_get_token, mock_post, mock_patch, client):
        """Test successful login flow."""
        mock_get_token.return_value = 'fake_token'
        
        # Session creation succeeds
        mock_post.return_value = MagicMock(
            status_code=201,
            json=lambda: {'sessionId': 'session123', 'sessionToken': 'token123'}
        )
        
        # Password check succeeds
        mock_patch.return_value = MagicMock(
            status_code=200,
            json=lambda: {'sessionToken': 'new_token_456'}
        )

        response = client.post(
            '/api/mgmt/login/',
            data=json.dumps({
                'username': 'admin@die-linke-muc.de',
                'password': 'oJ}5$B0(421'
            }),
            content_type='application/json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert 'sessionId' in data
        assert 'sessionToken' in data
        assert data['sessionId'] == 'session123'
        assert data['message'] == 'Login successful'
