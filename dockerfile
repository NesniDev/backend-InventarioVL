# Imagen base
FROM node:20-alpine

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando para iniciar
CMD ["node", "src/app.js"]