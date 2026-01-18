# Build stage
FROM python:3.12-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY backend-common /app/backend-common
RUN pip install --no-cache-dir /app/backend-common

COPY backend-mock/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Runtime stage
FROM python:3.12-slim AS runtime

RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY backend-mock /app

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8001

CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]
