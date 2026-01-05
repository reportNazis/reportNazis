import pytest
from rest_framework.test import APIClient

@pytest.mark.django_db
class TestLogger:
    def test_ingest_log(self):
        client = APIClient()
        payload = {
            "level": "info",
            "message": "This is a test log based on TDD specs"
        }
        # Simulate X-Trace-ID header
        headers = {'HTTP_X_TRACE_ID': 'test-trace-id-123'}
        
        response = client.post('/api/logs/', payload, format='json', **headers)
        
        assert response.status_code == 201
        assert response.data['status'] == 'received'
        # Verify Trace ID was captured (if returned in response, though middleware attaches it to headers 
        # so checking header is better, but maybe body too?)
        # Let's check response header which middleware sets
        assert response.headers['X-Trace-ID'] == 'test-trace-id-123'
