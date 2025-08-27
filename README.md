# 🍕 Sistema de Delivery

Sistema completo de delivery com frontend do cliente, painel administrativo e backend API.

## 🚀 Funcionalidades

### Frontend Cliente
- Catálogo de produtos com fotos e descrições
- Carrinho de compras
- Cadastro rápido de cliente
- Seleção de métodos de pagamento
- Interface responsiva para mobile

### Frontend Admin
- Login administrativo
- Gestão de pedidos em tempo real
- Controle de status dos pedidos
- Cadastro e edição de produtos
- Relatórios de vendas

### Backend
- API REST com Node.js + Express
- Banco SQLite local
- Autenticação JWT
- WebSocket para atualizações em tempo real
- Estrutura MVC organizada

## 🛠️ Tecnologias

- **Backend**: Node.js, Express, SQLite, Socket.io
- **Frontend Cliente**: React, Vite, Tailwind CSS
- **Frontend Admin**: React, Vite, Tailwind CSS
- **Banco**: SQLite
- **Autenticação**: JWT

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Setup Rápido
```bash
# Clone o repositório
git clone <seu-repo>
cd delivery-system

# Instala todas as dependências e configura o banco
npm run setup

# Inicia todos os serviços em desenvolvimento
npm run dev
```

### Setup Manual
```bash
# Instala dependências do projeto principal
npm install

# Instala dependências do backend
cd backend && npm install

# Instala dependências do frontend cliente
cd ../frontend-client && npm install

# Instala dependências do frontend admin
cd ../frontend-admin && npm install

# Volta para a raiz e configura o banco
cd .. && npm run setup:db
```

## 🚀 Como Usar

### Desenvolvimento
```bash
# Inicia todos os serviços
npm run dev

# Ou individualmente:
npm run dev:backend    # Backend na porta 3000
npm run dev:client     # Cliente na porta 3001
npm run dev:admin      # Admin na porta 3002
```

### Produção
```bash
# Build dos frontends
npm run build

# Inicia apenas o backend
npm start
```

## 🌐 Portas

- **Backend API**: http://localhost:3000
- **Frontend Cliente**: http://localhost:3001
- **Frontend Admin**: http://localhost:3002

## 🐳 Docker (Opcional)

```bash
# Build da imagem
npm run docker:build

# Executa com Docker
npm run docker:run
```

## 📁 Estrutura do Projeto

```
delivery-system/
├── backend/                 # API Node.js + Express
│   ├── src/
│   │   ├── controllers/    # Controladores MVC
│   │   ├── models/         # Modelos de dados
│   │   ├── routes/         # Rotas da API
│   │   ├── middleware/     # Middlewares (auth, etc)
│   │   └── config/         # Configurações
│   ├── database/           # Banco SQLite
│   └── package.json
├── frontend-client/         # App do cliente
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas
│   │   └── services/       # Serviços API
│   └── package.json
├── frontend-admin/          # Painel administrativo
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas admin
│   │   └── services/       # Serviços API
│   └── package.json
└── package.json             # Scripts principais
```

## 🔐 Primeiro Acesso

### Admin
- **URL**: http://localhost:3002
- **Usuário**: admin@delivery.com
- **Senha**: admin123

### Cliente
- **URL**: http://localhost:3001
- Acesso livre, sem login obrigatório

## 📊 Banco de Dados

O sistema usa SQLite localmente. Os dados são criados automaticamente na primeira execução.

**Arquivo**: `backend/database/delivery.db`

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` na pasta `backend/`:

```env
JWT_SECRET=sua_chave_secreta_aqui
PORT=3000
NODE_ENV=development
```

### Personalização
- Edite `backend/src/config/database.js` para mudar configurações do banco
- Modifique `backend/src/config/auth.js` para ajustar JWT
- Ajuste portas em cada `package.json` se necessário

## 🚀 Deploy

### Preparação para Produção
1. Configure variáveis de ambiente
2. Execute `npm run build`
3. Configure um servidor web (nginx, Apache)
4. Use PM2 ou similar para gerenciar o processo Node.js

### Migração de Banco
Para migrar para PostgreSQL, MySQL ou MongoDB:
1. Instale o driver do banco
2. Atualize `backend/src/config/database.js`
3. Execute os scripts de migração

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console
2. Confirme se todas as portas estão livres
3. Verifique se o banco foi criado corretamente
4. Abra uma issue no repositório
