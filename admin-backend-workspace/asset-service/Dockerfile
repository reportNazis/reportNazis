# Build stage
FROM python:3.12-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY admin-backend-workspace/asset-service/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Runtime stage - security hardened
FROM python:3.12-slim AS runtime

# Security: Create non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY admin-backend-workspace/asset-service/app /app/app
COPY admin-backend-workspace/asset-service/worker /app/worker

# Security: Change ownership and switch to non-root user
RUN chown -R appuser:appgroup /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8002/health || exit 1

# Expose internal port (not published to host)
EXPOSE 8002

# Run with uvicorn for production
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
