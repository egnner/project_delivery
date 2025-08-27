# Dockerfile para Sistema de Delivery
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache sqlite

# Copiar package.json principal
COPY package*.json ./

# Instalar dependências principais
RUN npm install

# Copiar código do backend
COPY backend/ ./backend/

# Instalar dependências do backend
RUN cd backend && npm install

# Copiar código do frontend cliente
COPY frontend-client/ ./frontend-client/

# Instalar dependências do frontend cliente
RUN cd frontend-client && npm install

# Copiar código do frontend admin
COPY frontend-admin/ ./frontend-admin/

# Instalar dependências do frontend admin
RUN cd frontend-admin && npm install

# Build dos frontends
RUN npm run build

# Criar diretório para o banco
RUN mkdir -p backend/database

# Expor portas
EXPOSE 3000 3001 3002

# Script de inicialização
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Comando padrão
ENTRYPOINT ["docker-entrypoint.sh"]
