"""API URL routing for the BFF Gateway."""
from django.urls import path

from api.views import ProxyDataView, HealthCheckView

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('data/', ProxyDataView.as_view(), name='proxy-data'),
]
