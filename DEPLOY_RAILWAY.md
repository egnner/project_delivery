# 🚂 Deploy no Railway - Sistema de Delivery

## 📋 Pré-requisitos

1. **Conta no GitHub** ✅ (já tem)
2. **Conta no Railway** (gratuita)
3. **Node.js** instalado localmente ✅

## 🔧 Passo a Passo

### **1. Criar conta no Railway**

1. Acesse [railway.app](https://railway.app)
2. Clique em **"Start a New Project"**
3. Faça login com **GitHub**
4. Autorize o Railway

### **2. Deploy do Backend**

1. **Clique em "Deploy from GitHub repo"**
2. **Selecione**: `egnner/project_delivery`
3. **Selecione pasta**: `backend`
4. **Clique em "Deploy"**

### **3. Configurar Banco de Dados**

1. **Clique em "New"** → **"Database"**
2. **Selecione**: `PostgreSQL`
3. **Clique em "Add"**
4. **Conecte** com o backend

### **4. Configurar Variáveis de Ambiente**

No projeto backend, adicione:

```
NODE_ENV=production
JWT_SECRET=sua_chave_secreta_muito_segura_aqui_123
DB_HOST=${DATABASE_URL}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
DB_PORT=${DB_PORT}
```

### **5. Deploy dos Frontends**

#### **Frontend Admin:**
1. **Novo projeto** no Railway
2. **Selecione pasta**: `frontend-admin`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`

#### **Frontend Cliente:**
1. **Novo projeto** no Railway
2. **Selecione pasta**: `frontend-client`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`

## 🌐 URLs Finais

Após o deploy, você terá:
- **Backend**: `https://seu-backend.railway.app`
- **Admin**: `https://seu-admin.railway.app`
- **Cliente**: `https://seu-cliente.railway.app`

## ✅ Vantagens do Railway

- **Mais simples** que Vercel
- **Banco incluído** gratuitamente
- **Deploy automático** do GitHub
- **Interface intuitiva**
- **500h gratuitas** por mês

## 🔄 Deploy Automático

Após configurar, cada push para `main` fará deploy automático!

## 📞 Suporte

- [Documentação Railway](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
