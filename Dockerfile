# Usa una imagen oficial de Node.js para construir la app
FROM node:20-alpine AS builder

WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala dependencias
RUN npm ci

# Copia el resto del código fuente
COPY . .

# Borra la carpeta dist por si existe de builds anteriores
RUN rm -rf dist

# Compila la app Angular en modo producción
RUN npm run build -- --configuration production

# Usa una imagen de Nginx para servir los archivos estáticos
FROM nginx:alpine

# Copia el build generado al directorio de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expone el puerto 80 (por defecto en Nginx)
EXPOSE 80

# Nginx se inicia automáticamente al arrancar el contenedor