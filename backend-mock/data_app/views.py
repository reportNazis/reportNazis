"""
Mock Data Views.

Provides sample data endpoints for the BFF Gateway to consume.
The data is intentionally nested to demonstrate BFF translation capabilities.
"""
import logging
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)


class MockDataView(APIView):
    """
    Mock data endpoint providing sample nested data.
    
    This simulates a real backend service that returns complex,
    nested JSON structures that the BFF will flatten/translate.
    """
    
    def get(self, request: Request) -> Response:
        """
        Return sample nested data structure.
        
        The structure intentionally includes nested objects
        to demonstrate BFF translation capabilities.
        
        Args:
            request: HTTP request with trace_id attached.
            
        Returns:
            Nested JSON data structure.
        """
        trace_id = getattr(request, 'trace_id', 'unknown')
        
        logger.info("Mock data requested with trace_id=%s", trace_id)
        
        # Sample nested data structure
        data = {
            'data': [
                {
                    'id': 1,
                    'type': 'item',
                    'attributes': {
                        'name': 'Sample Item 1',
                        'description': 'A mock item for testing',
                        'metadata': {
                            'created_at': '2026-01-17T12:00:00Z',
                            'updated_at': '2026-01-17T12:00:00Z',
                        },
                    },
                    'relationships': {
                        'category': {'id': 100, 'name': 'Category A'},
                    },
                },
                {
                    'id': 2,
                    'type': 'item',
                    'attributes': {
                        'name': 'Sample Item 2',
                        'description': 'Another mock item',
                        'metadata': {
                            'created_at': '2026-01-17T13:00:00Z',
                            'updated_at': '2026-01-17T13:00:00Z',
                        },
                    },
                    'relationships': {
                        'category': {'id': 101, 'name': 'Category B'},
                    },
                },
            ],
            'meta': {
                'total_count': 2,
                'page': 1,
                'per_page': 10,
            },
        }
        
        return Response(data, status=status.HTTP_200_OK)
