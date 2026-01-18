# Build stage
FROM python:3.12-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy and install shared library
COPY backend-common /app/backend-common
RUN pip install --no-cache-dir /app/backend-common

# Install service dependencies
COPY gateway-bff/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Runtime stage - security hardened
FROM python:3.12-slim AS runtime

# Security: Create non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY gateway-bff /app

# Security: Change ownership and switch to non-root user
RUN chown -R appuser:appgroup /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/bff/health/')"

# Expose internal port (not published to host)
EXPOSE 8000

# Run with gunicorn for production
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
