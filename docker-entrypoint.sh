#!/bin/sh

# Script de inicialização para o Docker

echo "🚀 Iniciando Sistema de Delivery..."

# Configurar banco de dados se não existir
if [ ! -f "/app/backend/database/delivery.db" ]; then
    echo "🗄️ Configurando banco de dados..."
    cd /app/backend && npm run setup:db
fi

# Iniciar backend
echo "🔧 Iniciando backend..."
cd /app/backend && npm start &

# Aguardar backend inicializar
sleep 5

# Iniciar frontend cliente
echo "📱 Iniciando frontend cliente..."
cd /app/frontend-client && npm start &

# Aguardar cliente inicializar
sleep 3

# Iniciar frontend admin
echo "⚙️ Iniciando frontend admin..."
cd /app/frontend-admin && npm start &

# Manter container rodando
echo "✅ Todos os serviços iniciados!"
echo "🌐 Backend: http://localhost:3000"
echo "📱 Cliente: http://localhost:3001"
echo "⚙️ Admin: http://localhost:3002"

# Aguardar todos os processos
wait
