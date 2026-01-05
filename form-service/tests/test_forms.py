import pytest
from rest_framework.test import APIClient
from forms_app.models import FormConfig, FormResponse

@pytest.mark.django_db
class TestFormService:
    def test_get_form(self):
        # Setup: Create a FormConfig
        FormConfig.objects.create(
            form_id="test-form",
            schema={"questions": [{"key": "q1", "label": "Test?"}]}
        )
        
        client = APIClient()
        response = client.get('/api/forms/test-form/')
        
        assert response.status_code == 200
        assert response.data['schema']['questions'][0]['key'] == 'q1'

    def test_submit_response(self):
        # Setup
        FormConfig.objects.create(form_id="test-form-submit", schema={})
        
        client = APIClient()
        payload = {"answers": {"q1": "yes"}}
        headers = {'HTTP_X_TRACE_ID': 'trace-123'}
        
        response = client.post('/api/forms/test-form-submit/response/', payload, format='json', **headers)
        
        assert response.status_code == 201
        assert FormResponse.objects.count() == 1
        assert response.headers['X-Trace-ID'] == 'trace-123'
