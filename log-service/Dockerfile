FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy Shared Library
COPY backend-common /app/backend-common
RUN pip install /app/backend-common

# Install Service Dependencies
COPY log-service/requirements.txt /app/
RUN pip install -r requirements.txt

# Copy Service Code
COPY log-service /app

# Run Server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
