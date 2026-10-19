#!/usr/bin/env bash
# Deploy en el servidor: pull + rebuild sin cache + up + recarga de Nginx Proxy Manager.
# Uso: ./scripts/deploy.sh
#   NPM_CONTAINER=nginx-proxy-manager   (nombre del contenedor del proxy)
#   SITE_URL=https://christianferrer.me (URL pública para la verificación final)
set -euo pipefail

NPM_CONTAINER="${NPM_CONTAINER:-nginx-proxy-manager}"
SITE_URL="${SITE_URL:-https://christianferrer.me}"
cd "$(dirname "$0")/.."

# 1. El árbol debe estar limpio: con cambios locales `git pull` se aborta y se
#    reconstruiría el código viejo sin que nadie se entere.
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "❌ Hay cambios locales sin commitear. Guárdalos (git stash) o descártalos antes de desplegar:" >&2
  git status --short --untracked-files=no >&2
  exit 1
fi

echo "▶ git pull"
git pull --ff-only
git fetch -q
if [ "$(git rev-parse HEAD)" != "$(git rev-parse '@{u}')" ]; then
  echo "❌ HEAD no coincide con origin: el pull no se aplicó." >&2
  exit 1
fi
echo "  versión: $(git log --oneline -1)"

echo "▶ build sin cache (los contenedores actuales siguen sirviendo mientras tanto)"
docker compose build --no-cache

echo "▶ up -d"
docker compose up -d

echo "▶ esperando a que la API esté healthy"
status=""
for _ in $(seq 1 60); do
  status="$(docker inspect -f '{{.State.Health.Status}}' portfolio-api 2>/dev/null || true)"
  [ "$status" = "healthy" ] && break
  sleep 3
done
if [ "$status" != "healthy" ]; then
  echo "❌ La API no quedó healthy. Revisa: docker logs portfolio-api --tail 30" >&2
  exit 1
fi

# 2. Al recrear los contenedores cambian sus IP; Nginx resuelve los nombres al cargar su
#    configuración, así que hay que recargarlo (graceful, no corta conexiones ni otros sitios).
echo "▶ recargando $NPM_CONTAINER"
docker exec "$NPM_CONTAINER" nginx -t
docker exec "$NPM_CONTAINER" nginx -s reload

echo "▶ verificando $SITE_URL"
code=""
for _ in $(seq 1 20); do
  code="$(curl -s -o /dev/null -m 8 -w '%{http_code}' "$SITE_URL/" || true)"
  [ "$code" = "200" ] && break
  sleep 3
done
if [ "$code" != "200" ]; then
  echo "❌ $SITE_URL respondió '$code' tras el deploy." >&2
  exit 1
fi

docker compose ps
echo "✅ Deploy correcto: $SITE_URL responde 200"
