from django.urls import path, include

urlpatterns = [
    path('api/forms/', include('forms_app.urls')),
]
