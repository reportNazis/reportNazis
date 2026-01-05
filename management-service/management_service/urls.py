from django.urls import path, include

urlpatterns = [
    path('api/mgmt/invites/', include('mgmt_app.urls')),
]
