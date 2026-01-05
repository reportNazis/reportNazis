import logging
import uuid

logger = logging.getLogger(__name__)

class TracingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Extract trace ID from header or generate a new one
        trace_id = request.headers.get('X-Trace-ID', str(uuid.uuid4()))
        
        # Attach to request for view access
        request.trace_id = trace_id
        
        # Add to response headers
        response = self.get_response(request)
        response['X-Trace-ID'] = trace_id
        
        return response
