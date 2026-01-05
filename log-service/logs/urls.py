from django.urls import path
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

class IngestLogView(APIView):
    def post(self, request):
        data = request.data
        trace_id = getattr(request, 'trace_id', 'unknown')
        
        # In a real system, we'd save this to Elastic/DB.
        # For now, we print it to stdout so Docker logs capture it.
        print(f"[TraceID: {trace_id}] Log Ingested: {data}")
        
        return Response({"status": "received"}, status=status.HTTP_201_CREATED)

urlpatterns = [
    path('', IngestLogView.as_view(), name='ingest-log'),
]
