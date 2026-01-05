from django.urls import path
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import FormConfig, FormResponse

class FormDetailView(APIView):
    def get(self, request, form_id):
        form_config = get_object_or_404(FormConfig, form_id=form_id)
        return Response({
            "form_id": form_config.form_id,
            "schema": form_config.schema
        })

class FormResponseView(APIView):
    def post(self, request, form_id):
        form_config = get_object_or_404(FormConfig, form_id=form_id)
        answers = request.data.get('answers', {})
        
        # Save response
        FormResponse.objects.create(form=form_config, answers=answers)
        
        return Response({"status": "submitted"}, status=status.HTTP_201_CREATED)

urlpatterns = [
    path('<str:form_id>/', FormDetailView.as_view()),
    path('<str:form_id>/response/', FormResponseView.as_view()),
]
