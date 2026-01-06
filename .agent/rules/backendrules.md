---
trigger: always_on
---

# Backend Workspace Rules: Python & Django Microservice

## 1. Project Structure & Architecture
- **Service Layer Pattern:** Strictly separate business logic from Views.
  - `views.py`: Only handles request parsing, input validation calling the Service layer, and returning standard HTTP responses.
  - `services/`: Contains the actual business logic. Pure Python classes/functions preferred.
  - `selectors.py`: (Optional) Use for complex read-only queries to separate Reads (Queries) from Writes (Commands/Services).
- **App Structure:** Follow logical domain grouping. e.g., `apps/users`, `apps/billing`.

## 2. Django & DRF Implementation
- **DRF Spectacular:** All API Views must be decorated with `@extend_schema` to ensure the OpenAPI documentation is accurate.
- **Serializers:** Use `ModelSerializer` for CRUD, but explicit `Serializer` classes for complex actions or non-model inputs.
- **Pagination:** Always enforce pagination on list endpoints. Never return full table dumps.
- **ORM Optimization:** - Explicitly use `select_related` and `prefetch_related` to avoid N+1 problems.
  - Use `F()` expressions for atomic updates.

## 3. Testing (Pytest)
- **Framework:** Use `pytest` and `pytest-django`.
- **Factories:** Use `factory_boy` for creating test data. Do not use Django fixtures (JSON/XML).
- **Isolation:** Tests in `tests/unit` must not hit the database (mocking). Tests in `tests/integration` may use the DB (handled by `pytest-django` transaction rollback).
- **Conftest:** Place global fixtures in `conftest.py`.

## 4. Docker & Environment Readiness
- **Database Wait:** Ensure the entrypoint script uses a wait-strategy (e.g., `wait-for-it.sh` or a python loop) before starting the WSGI server to prevent startup race conditions with the DB container.
- **Static Files:** Ensure `collectstatic` runs during the build stage or container startup before the server starts.
- **Hosts:** Configure `ALLOWED_HOSTS` via environment variables to accept the internal Docker service name (e.g., `backend`) and `localhost`.