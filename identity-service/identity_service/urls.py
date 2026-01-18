from django.urls import path, include


urlpatterns = [
    path('api/mgmt/', include('mgmt_app.urls')),
]
