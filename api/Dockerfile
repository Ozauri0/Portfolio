FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:1-alpine

WORKDIR /app

# Usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 apiuser

# Dependencias de producción (instaladas con bun)
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

# Copiar código fuente
COPY . .

# Crear directorio público con permisos correctos para escritura
RUN mkdir -p /app/public && chown apiuser:nodejs /app/public && chmod g+w /app/public

USER apiuser

EXPOSE 5000

ENV PORT 5000
ENV NODE_ENV production

CMD ["bun", "server.js"]
