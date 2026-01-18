import pytest
from rest_framework.test import APIClient
from mgmt_app.models import InviteCode
from datetime import timedelta
from django.utils import timezone

@pytest.mark.django_db
class TestManagementService:
    def test_create_invite(self):
        client = APIClient()
        response = client.post('/api/mgmt/invites/', {})
        
        assert response.status_code == 201
        assert 'code' in response.data
        assert InviteCode.objects.count() == 1

    def test_redeem_invite(self):
        # Setup valid code
        invite = InviteCode.objects.create(code='MAGIC-CODE', expires_at=timezone.now() + timedelta(days=1))
        
        client = APIClient()
        payload = {"code": "MAGIC-CODE", "email": "test@example.com"}
        
        # Test success
        response = client.post('/api/mgmt/invites/redeem/', payload)
        assert response.status_code == 200
        assert response.data['status'] == 'redeemed'
        
        # Invite should be inactive now
        invite.refresh_from_db()
        assert invite.is_active is False
