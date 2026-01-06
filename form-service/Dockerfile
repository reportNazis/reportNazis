FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy Shared Library
COPY backend-common /app/backend-common
RUN pip install /app/backend-common

# Install Service Dependencies
COPY form-service/requirements.txt /app/
RUN pip install -r requirements.txt

# Copy Service Code
COPY form-service /app

# Run Server using Shell form to expand $PORT
CMD sh -c "python manage.py runserver 0.0.0.0:$PORT"
