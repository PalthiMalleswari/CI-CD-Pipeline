FROM python:3.12-slim as builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update && apt-get install --no-install-recommends -y \
        build-essential libpq-dev \
        && rm -rf /var/lib/apt/lists/*


COPY requirements.txt .

RUN pip wheel --wheel-dir /wheels -r requirements.txt


#======= Stage 2: Runttime ============

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

COPY --chown=appuser:appuser . .

# RUN SECRET_KEY=django-insecure-2y1v&1*xl_)hsln%p86d@d(#_#ix)-77o_0^owf&t-&ggp1qjc python manage.py collectstatic --noinput

USER appuser
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
 CMD  curl -fsS http://localhost:8000/healthz/ || exit 1

CMD ["gunicorn", "config.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "3", \
     "--timeout", "60", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]