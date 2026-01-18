"""Gateway BFF URL Configuration."""
from django.urls import path, include

urlpatterns = [
    path('api/bff/', include('api.urls')),
]
