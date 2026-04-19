FROM node:18-alpine

WORKDIR /app

# Usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 apiuser

# Instalar solo dependencias de producción
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Crear directorio público con permisos correctos para escritura
RUN mkdir -p /app/public && chown apiuser:nodejs /app/public && chmod g+w /app/public

USER apiuser

EXPOSE 5000

ENV PORT 5000
ENV NODE_ENV production

CMD ["node", "server.js"]
