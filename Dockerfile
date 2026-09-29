FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update && apt-get install --no-install-recommends -y \
        build-essential libpq-dev \
        && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip wheel --wheel-dir /wheels -r requirements.txt


#======= Stage 2: Runtime ============

FROM python:3.12-slim AS runtime 

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.settings

RUN apt-get update && apt-get install --no-install-recommends -y \
    libpq5 curl \
    && rm -rf /var/lib/apt/lists/*

RUN useradd --create-home --uid 1000 appuser
WORKDIR /app

COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir --no-index --find-links=/wheels /wheels/* \
    && rm -rf /wheels

# 1. Copy the application files natively as root first
COPY . .

# 2. Run collectstatic as root while providing a dummy SECRET_KEY for the compiler
RUN SECRET_KEY="build-only-dummy-secret" python manage.py collectstatic --noinput

# 3. Make the entrypoint script executable while still root
RUN chmod +x /app/entrypoint.sh

# 4. Change the ownership of the entire /app directory (including static files) to appuser
RUN chown -R appuser:appuser /app

# 5. Now safely switch privileges down to the unprivileged runtime worker
USER appuser

EXPOSE 8000

# 6. Set healthcheck back to /healthz/ since the database migrations will now successfully run
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
 CMD curl -fsS http://localhost:8000/healthz/ || exit 1

# 7. Run the entrypoint script as the container boot sequence
ENTRYPOINT ["/app/entrypoint.sh"]
