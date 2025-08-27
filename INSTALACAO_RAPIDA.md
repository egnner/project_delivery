# 🚀 Instalação Rápida - Sistema de Delivery

## ⚡ Setup em 3 Passos

### 1️⃣ Instalar Dependências
```bash
npm run install:all
```

### 2️⃣ Configurar Banco de Dados
```bash
npm run setup:db
```

### 3️⃣ Iniciar Todos os Serviços
```bash
npm run dev
```

## 🎯 O que acontece?

- **Backend**: API rodando em http://localhost:3000
- **Frontend Cliente**: App do cliente em http://localhost:3001  
- **Frontend Admin**: Painel admin em http://localhost:3002
- **Banco**: SQLite configurado automaticamente
- **WebSocket**: Atualizações em tempo real ativas

## 🔐 Acesso Inicial

### Admin
- **URL**: http://localhost:3002
- **Email**: admin@delivery.com
- **Senha**: admin123

### Cliente  
- **URL**: http://localhost:3001
- **Acesso**: Livre, sem login

## 🐳 Alternativa com Docker

```bash
# Build e execução
docker-compose up --build

# Ou individualmente
docker-compose up backend
docker-compose up frontend-client  
docker-compose up frontend-admin
```

## ❗ Problemas Comuns

### Porta em uso
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Dependências não instaladas
```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run install:all
```

### Banco não configurado
```bash
cd backend
npm run setup:db
```

## 📱 Testando o Sistema

1. **Cliente**: Acesse http://localhost:3001
2. **Adicione produtos** ao carrinho
3. **Faça um pedido** de teste
4. **Admin**: Acesse http://localhost:3002
5. **Veja o pedido** aparecer em tempo real
6. **Altere o status** do pedido

## 🎉 Pronto!

Seu sistema de delivery está funcionando! 🍕✨
