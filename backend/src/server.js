const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Configurar timezone para Brasil (GMT-3)
const { configureTimezone } = require('./config/timezone');
configureTimezone();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const categoryRoutes = require('./routes/categories');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3001", 
      "http://localhost:3002",
      "https://*.vercel.app",
      "https://*.vercel.app/*"
    ],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: [
    "http://localhost:3001", 
    "http://localhost:3002",
    "https://*.vercel.app",
    "https://*.vercel.app/*"
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/settings', require('./routes/settings'));

// Rotas admin
app.use('/api/admin/products', require('./routes/admin/products'));
app.use('/api/admin/categories', require('./routes/admin/categories'));
app.use('/api/admin/orders', require('./routes/admin/orders'));
app.use('/api/admin/settings', require('./routes/admin/settings'));
app.use('/api/admin/customers', require('./routes/admin/customers'));
app.use('/api/admin/reports', require('./routes/admin/reports'));
app.use('/api/auth', require('./routes/auth'));

// Middleware de erro
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Socket.io para atualizações em tempo real
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Admin se junta à sala de pedidos
  socket.on('join-admin', () => {
    socket.join('admin-room');
    console.log('Admin entrou na sala de pedidos');
  });

  // Cliente se junta à sala de pedidos
  socket.on('join-client', (orderId) => {
    socket.join(`order-${orderId}`);
    console.log(`Cliente entrou na sala do pedido: ${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Disponibiliza io para uso em outras partes da aplicação
app.set('io', io);

// Inicialização do servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 API disponível em: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket ativo`);
});

module.exports = { app, server, io };
