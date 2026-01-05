from pathlib import Path
import os
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-test-key-form-service'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'rest_framework',
    'visine_common',
    'forms_app',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
    'visine_common.middleware.TracingMiddleware',
]

ROOT_URLCONF = 'form_service.urls'

# Parse database configuration from $DATABASE_URL
# In docker-compose we pass DB_HOST etc, but standardizing on DATABASE_URL 
# or constructing it manually is cleaner.
# Constructing manually from individual env vars as defined in docker-compose:
DB_HOST = os.environ.get('DB_HOST', 'postgres')
DB_NAME = os.environ.get('DB_NAME', 'visine_db')
DB_USER = os.environ.get('DB_USER', 'visine')
DB_PASSWORD = os.environ.get('DB_PASSWORD', 'visine')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': DB_NAME,
        'USER': DB_USER,
        'PASSWORD': DB_PASSWORD,
        'HOST': DB_HOST,
        'PORT': '5432',
    }
}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
