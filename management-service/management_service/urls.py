from django.urls import path, include
from django.contrib import admin

urlpatterns = [
    path('api/mgmt/admin/', admin.site.urls),
    path('api/mgmt/invites/', include('mgmt_app.urls')),
]
