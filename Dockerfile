FROM node:18-alpine AS base

# Etapa de instalación de dependencias
FROM base AS deps
WORKDIR /app

# Copia archivos de configuración de dependencias
COPY package.json package-lock.json* ./
RUN npm ci

# Etapa de construcción
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* se hornean en el bundle en tiempo de build.
# Se pasa como build arg para que next.config.ts pueda leer NEXT_PUBLIC_API_URL
# y construir correctamente los remotePatterns de next/image.
ARG NEXT_PUBLIC_API_URL=http://localhost:5000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# URL interna (server-side) para que Next.js proxee /api/* y /public/*
# al contenedor de la API via rewrite. Usa el nombre del contenedor para
# evitar conflictos de DNS en redes Docker compartidas.
ARG INTERNAL_API_URL=http://localhost:5000
ENV INTERNAL_API_URL=$INTERNAL_API_URL

# Construcción de la aplicación
RUN npm run build

# Etapa de producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Crea un usuario no-root para ejecutar la aplicación
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia el resultado de la construcción
# --chown asegura que el usuario nextjs (UID 1001) sea dueño del directorio
# Esto es crítico para que el volumen compartido con la API sea accesible
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3002

ENV PORT 3002
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]