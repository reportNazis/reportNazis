"""Data app URL routing."""
from django.urls import path

from data_app.views import MockDataView

urlpatterns = [
    path('', MockDataView.as_view(), name='mock-data'),
]
