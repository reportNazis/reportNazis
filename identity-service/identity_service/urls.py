from django.urls import path, include


urlpatterns = [
    path('api/identity/', include('identity_app.urls')),
]
