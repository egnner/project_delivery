const express = require('express');
const { body, validationResult } = require('express-validator');
const { runQuery, runCommand, getOne } = require('../config/database');
const { getCurrentBrazilTime } = require('../utils/dateUtils');

// Função para verificar se a loja está aberta
const isStoreOpen = async () => {
  try {
    const settings = await getOne('SELECT opening_hours FROM store_settings LIMIT 1');
    
    if (!settings || !settings.opening_hours) {
      // Se não há configurações, considerar como aberta
      return true;
    }

    let openingHours;
    try {
      openingHours = JSON.parse(settings.opening_hours);
    } catch (e) {
      console.error('Erro ao fazer parse dos horários:', e);
      return true; // Em caso de erro, permitir pedidos
    }

    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];
    const currentTime = now.toLocaleTimeString('pt-BR', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });

    const todayHours = openingHours[currentDay];
    if (!todayHours || todayHours.closed) {
      return false;
    }

    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  } catch (error) {
    console.error('Erro ao verificar status da loja:', error);
    return true; // Em caso de erro, permitir pedidos
  }
};

const router = express.Router();

// Criar novo pedido (cliente)
router.post('/', [
  body('customer_name').notEmpty().withMessage('Nome do cliente é obrigatório'),
  body('customer_phone').notEmpty().withMessage('Telefone é obrigatório'),
  body('customer_address').optional(),
  body('customer_email').optional().isEmail().withMessage('Email deve ser válido'),
  body('delivery_type').isIn(['delivery', 'pickup']).withMessage('Tipo de entrega deve ser delivery ou pickup'),
  body('payment_method').isIn(['pix', 'cartao', 'dinheiro']).withMessage('Método de pagamento inválido'),
  body('items').isArray({ min: 1 }).withMessage('Pedido deve ter pelo menos um item'),
  body('items.*.product_id').isInt().withMessage('ID do produto é obrigatório'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantidade deve ser maior que zero'),
  body('items.*.unit_price').isFloat({ min: 0.01 }).withMessage('Preço unitário deve ser maior que zero')
], async (req, res) => {
  try {
    // Validação dos campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { 
      customer_name, 
      customer_phone, 
      customer_address, 
      customer_email,
      delivery_type,
      payment_method, 
      notes, 
      items 
    } = req.body;

    // Verificar se a loja está aberta
    const storeOpen = await isStoreOpen();
    if (!storeOpen) {
      return res.status(403).json({
        error: 'Loja fechada',
        message: 'Não é possível realizar pedidos fora do horário de funcionamento'
      });
    }

    // Validação específica para entrega
    if (delivery_type === 'delivery' && !customer_address) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'Endereço é obrigatório para entrega'
      });
    }

    // Validar dados dos itens
    for (const item of items) {
      if (!item.product_id || !item.quantity || !item.unit_price) {
        return res.status(400).json({
          error: 'Dados inválidos',
          message: 'Todos os campos dos itens são obrigatórios'
        });
      }
    }

    // Calcular valor total do pedido
    const totalAmount = items.reduce((total, item) => {
      return total + (item.unit_price * item.quantity);
    }, 0);

    // Iniciar transação
    const io = req.app.get('io');

    try {
      console.log('🔄 Iniciando criação do pedido...');
      console.log('📊 Dados recebidos:', { customer_name, customer_phone, customer_address, customer_email, totalAmount, payment_method, notes });
      
      // Criar o pedido
      const orderResult = await runCommand(`
        INSERT INTO orders (
          customer_name, customer_phone, customer_address, customer_email,
          delivery_type, total_amount, payment_method, payment_status, order_status, notes,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [customer_name, customer_phone, customer_address || null, customer_email || null, delivery_type, totalAmount, payment_method, 'pendente', 'novo', notes || null, getCurrentBrazilTime(), getCurrentBrazilTime()]);

      const orderId = orderResult.id;
      console.log('✅ Pedido criado com ID:', orderId);

      // Inserir itens do pedido
      console.log('🔄 Inserindo itens do pedido...');
      for (const item of items) {
        console.log('📦 Processando item:', item);
        
        // Buscar nome do produto
        const product = await getOne('SELECT name FROM products WHERE id = ?', [item.product_id]);
        console.log('🏷️ Produto encontrado:', product);
        
        await runCommand(`
          INSERT INTO order_items (
            order_id, product_id, product_name, quantity, unit_price, total_price
          ) VALUES (?, ?, ?, ?, ?, ?)
        `, [orderId, item.product_id, product.name, item.quantity, item.unit_price, item.unit_price * item.quantity]);
        console.log('✅ Item inserido:', item.product_id);
      }

      // Buscar pedido completo
      console.log('🔄 Buscando pedido completo...');
      const order = await getOne(`
        SELECT o.*, 
               GROUP_CONCAT(oi.product_name || ' x' || oi.quantity) as items_summary
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.id = ?
        GROUP BY o.id
      `, [orderId]);
      console.log('✅ Pedido encontrado:', order);

      // Emitir evento WebSocket para notificar admin em tempo real
      if (io) {
        console.log('🔌 Emitindo evento de novo pedido para admin...');
        io.to('admin-room').emit('new-order', {
          type: 'new-order',
          order: order,
          message: 'Novo pedido recebido!'
        });
        
        // Notificar cliente sobre o pedido criado
        io.to(`order-${orderId}`).emit('order-created', {
          type: 'order-created',
          order: order,
          message: 'Pedido criado com sucesso!'
        });
      }

      // Resposta de sucesso
      res.status(201).json({
        success: true,
        message: 'Pedido criado com sucesso!',
        data: {
          id: orderId,
          order_id: orderId,
          order: order
        }
      });

    } catch (dbError) {
      console.error('Erro na transação do banco:', dbError);
      throw new Error('Falha ao criar pedido no banco de dados');
    }

  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível criar o pedido'
    });
  }
});

// Buscar pedido por ID (cliente pode ver seu próprio pedido)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar pedido com itens
    const order = await getOne(`
      SELECT o.*, 
             GROUP_CONCAT(oi.product_name || ' x' || oi.quantity) as items_summary
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ?
      GROUP BY o.id
    `, [id]);
    
    if (!order) {
      return res.status(404).json({ 
        error: 'Pedido não encontrado',
        message: 'O pedido solicitado não existe'
      });
    }
    
    // Buscar itens detalhados do pedido
    const orderItems = await runQuery(`
      SELECT oi.*, p.image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
      ORDER BY oi.id ASC
    `, [id]);
    
    res.json({
      success: true,
      data: {
        order: order,
        items: orderItems
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar o pedido'
    });
  }
});

// Buscar pedidos por telefone (cliente pode ver seus pedidos)
router.get('/customer/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    
    const orders = await runQuery(`
      SELECT o.*, 
             GROUP_CONCAT(oi.product_name || ' x' || oi.quantity) as items_summary
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.customer_phone = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [phone]);
    
    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
    
  } catch (error) {
    console.error('Erro ao buscar pedidos do cliente:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar os pedidos' 
    });
  }
});

module.exports = router;
