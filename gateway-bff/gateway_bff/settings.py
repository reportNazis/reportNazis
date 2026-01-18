"""
Gateway BFF - Django settings module.

Security-hardened settings for the BFF layer between frontend and backend services.
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Security: Load from environment, never hardcode
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-dev-only-key')
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '*').split(',')

# Service Discovery via Environment Variables
BACKEND_URL = os.getenv('BACKEND_URL', 'http://backend-mock:8001')
LOG_SERVICE_URL = os.getenv('LOG_SERVICE_URL', 'http://log-service:5000')
ZITADEL_ISSUER = os.getenv('ZITADEL_ISSUER', 'http://zitadel:8080')
INTERNAL_SERVICE_TOKEN = os.getenv('INTERNAL_SERVICE_TOKEN', 'dev-internal-token')

# JWT Configuration
JWT_EXPECTED_AUDIENCE = os.getenv('JWT_AUDIENCE', 'gateway-bff')
JWKS_CACHE_TTL = int(os.getenv('JWKS_CACHE_TTL', '3600'))

INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'rest_framework',
    'visine_common',
    'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
    'visine_common.middleware.TracingMiddleware',
    'api.middleware.auth.JWTAuthMiddleware',
    'api.middleware.caching.CachingMiddleware',
]

ROOT_URLCONF = 'gateway_bff.urls'

# Redis Cache Configuration
REDIS_URL = os.getenv('REDIS_URL', 'redis://redis:6379/0')

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_URL,
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'SOCKET_CONNECT_TIMEOUT': 5,
            'SOCKET_TIMEOUT': 5,
            'COMPRESSOR': 'django_redis.compressors.zlib.ZlibCompressor',
        },
        'KEY_PREFIX': 'bff',
    }
}

# Cache TTL settings (seconds)
CACHE_TTL_DEFAULT = int(os.getenv('CACHE_TTL_DEFAULT', '300'))

# Security: No database needed for stateless gateway
DATABASES = {}

# DRF Settings
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
    ],
    'EXCEPTION_HANDLER': 'api.exceptions.secure_exception_handler',
}

# Upstream request timeout (seconds)
UPSTREAM_TIMEOUT = int(os.getenv('UPSTREAM_TIMEOUT', '30'))

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
