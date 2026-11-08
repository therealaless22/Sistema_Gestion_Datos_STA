# =============================================
# SANTO TOMÁS DE AQUINO — Backend Dockerfile
# =============================================

FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app/backend

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalar dependencias de producción omitiendo compilación nativa de msnodesqlv8
# (En contenedores Linux se utiliza el driver puro JS 'mssql' / Tedious)
RUN npm install --omit=dev --ignore-scripts && npm cache clean --force

# Copiar el código fuente del backend
COPY src ./src
COPY tests ./tests
COPY server.js ./

# Crear directorio para archivos subidos (compatible con la ruta relativa ../frontend/uploads)
RUN mkdir -p /usr/src/app/frontend/uploads

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000
ENV IN_DOCKER=true

# Exponer el puerto de la API
EXPOSE 3000

# Comando de inicio del servidor
CMD ["node", "server.js"]

