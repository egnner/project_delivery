# 🚀 Deploy no Vercel - Sistema de Delivery (Versão Otimizada)

## 📋 Pré-requisitos

1. **Conta no GitHub** ✅ (já tem)
2. **Conta no Vercel** (gratuita)
3. **Node.js** instalado localmente ✅

## 🔧 Passo a Passo Otimizado

### **1. Conectar com Vercel**

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em **"New Project"**
4. Importe seu repositório: `egnner/project_delivery`

### **2. Configuração Automática**

O Vercel deve detectar automaticamente:
- ✅ **Framework**: Node.js
- ✅ **Root Directory**: (deixe vazio)
- ✅ **Build Command**: (deixe vazio)
- ✅ **Output Directory**: (deixe vazio)

### **3. Variáveis de Ambiente**

Configure estas variáveis:
```
NODE_ENV=production
JWT_SECRET=sua_chave_secreta_muito_segura_aqui_123
```

### **4. Deploy**

1. **Clique em "Deploy"**
2. **Aguarde** o build completar
3. **Teste** a URL gerada

## 🌐 URLs Finais

Após o deploy, você terá:
- **Backend**: `https://seu-projeto.vercel.app`
- **API**: `https://seu-projeto.vercel.app/api/products`

## ✅ O que foi otimizado

- **`vercel.json`** com configuração específica
- **Rotas configuradas** para `/api/*` e `/*`
- **Build otimizado** para Node.js
- **Timeout configurado** para 30 segundos

## 🔄 Deploy Automático

Após configurar, cada push para `main` fará deploy automático!

## 📞 Suporte

- [Documentação Vercel](https://vercel.com/docs)
- [Vercel Discord](https://discord.gg/vercel)

## 🎯 Dicas para sucesso

1. **Deixe o Vercel detectar** automaticamente
2. **Não force** configurações manuais
3. **Use o `vercel.json`** criado
4. **Configure variáveis** de ambiente
5. **Teste** após o deploy
