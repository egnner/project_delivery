const express = require('express');
const { body, validationResult } = require('express-validator');
const { runQuery, runCommand, getOne } = require('../../config/database');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');
const { getCurrentBrazilDate, toBrazilDate, getCurrentBrazilTime } = require('../../utils/dateUtils');

const router = express.Router();

// Aplicar middleware de autenticação e admin em todas as rotas
router.use(authenticateToken);
router.use(requireAdmin);

// Funções auxiliares para formatação de status
const getStatusDisplay = (orderStatus, paymentStatus, deliveryType = 'delivery') => {
  if (paymentStatus === 'pendente') {
    return 'Aguardando Pagamento';
  }
  
  // Status específicos para DELIVERY
  if (deliveryType === 'delivery') {
    const deliveryStatusMap = {
      'novo': 'Aguardando Pagamento',
      'preparando': 'Pedido em Preparação',
      'pronto': 'Pedido Pronto',
      'saiu_entrega': 'Saiu para Entrega',
      'entregue': 'Entregue',
      'finalizado': 'Finalizado',
      'cancelado': 'Cancelado'
    };
    return deliveryStatusMap[orderStatus] || orderStatus;
  }
  
  // Status específicos para RETIRADA
  if (deliveryType === 'pickup') {
    const pickupStatusMap = {
      'novo': 'Aguardando Pagamento',
      'preparando': 'Pedido em Preparação',
      'pronto_retirada': 'Pedido Pronto para Retirada',
      'retirado': 'Retirado pelo Cliente',
      'finalizado': 'Finalizado',
      'cancelado': 'Cancelado'
    };
    return pickupStatusMap[orderStatus] || orderStatus;
  }
  
  return orderStatus;
};

const getPaymentStatusDisplay = (paymentStatus) => {
  const statusMap = {
    'pendente': 'Aguardando Pagamento',
    'confirmado': 'Pagamento Aprovado',
    'rejeitado': 'Pagamento Rejeitado'
  };
  
  return statusMap[paymentStatus] || paymentStatus;
};

// Listar todos os pedidos (admin)
router.get('/', async (req, res) => {
  try {
    const { status, payment_method, search, page = 1, limit = 20, date_from, date_to } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let sql = `
      SELECT o.*, 
             GROUP_CONCAT(oi.product_name || ' x' || oi.quantity) as items_summary
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE 1=1
    `;
    
    const params = [];
    
    // Filtros
    if (status && status !== 'all') {
      sql += ' AND o.order_status = ?';
      params.push(status);
    }
    
    if (payment_method) {
      sql += ' AND o.payment_method = ?';
      params.push(payment_method);
    }
    
    if (search) {
      sql += ' AND (o.customer_name LIKE ? OR o.customer_phone LIKE ? OR o.customer_address LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (date_from) {
      sql += ' AND DATE(o.created_at) >= ?';
      params.push(date_from);
    }
    
    if (date_to) {
      sql += ' AND DATE(o.created_at) <= ?';
      params.push(date_to);
    }
    
    // Contar total
    const countSql = sql.replace('SELECT o.*, GROUP_CONCAT(oi.product_name || \' x\' || oi.quantity) as items_summary', 'SELECT COUNT(DISTINCT o.id) as count');
    const totalResult = await getOne(countSql, params);
    const total = totalResult.count;
    
    // Buscar pedidos com paginação
    sql += ' GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const orders = await runQuery(sql, params);
    
    // Formatar dados dos pedidos
    const formattedOrders = orders.map(order => ({
      ...order,
      items_summary: order.items_summary ? order.items_summary.split(',').slice(0, 3).join(', ') + (order.items_summary.split(',').length > 3 ? '...' : '') : 'Nenhum item',
      status_display: getStatusDisplay(order.order_status, order.payment_status, order.delivery_type),
      payment_status_display: getPaymentStatusDisplay(order.payment_status),
      can_confirm: order.payment_status === 'pendente' && order.order_status === 'novo',
      can_prepare: order.payment_status === 'confirmado' && order.order_status === 'novo',
      can_complete: order.order_status === 'preparando',
      can_deliver: order.order_status === 'pronto'
    }));
    
    res.json({
      success: true,
      data: formattedOrders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
        hasNext: offset + parseInt(limit) < total,
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar os pedidos'
    });
  }
});

// Rotas específicas devem vir ANTES da rota genérica /:id
// Confirmar pagamento do pedido (admin)
router.post('/:id/confirm-payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;
    const adminId = req.user.id;
    
    // Verificar se o pedido existe e pode ser confirmado
    const order = await getOne('SELECT * FROM orders WHERE id = ?', [id]);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Pedido não encontrado' 
      });
    }
    
    if (order.payment_status !== 'pendente') {
      return res.status(400).json({ 
        success: false,
        message: 'Pedido já foi confirmado ou rejeitado' 
      });
    }
    
    // Confirmar pagamento
    await runCommand(`
      UPDATE orders SET 
        payment_status = 'confirmado',
        admin_notes = ?,
        confirmed_by = ?,
        confirmed_at = ?,
        updated_at = ?
      WHERE id = ?
    `, [admin_notes || null, adminId, getCurrentBrazilTime(), getCurrentBrazilTime(), id]);
    
    // Buscar pedido atualizado para enviar via WebSocket
    const updatedOrder = await getOne(`
      SELECT o.*, 
             GROUP_CONCAT(oi.product_name || ' x' || oi.quantity) as items_summary
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ?
      GROUP BY o.id
    `, [id]);
    
    // Emitir evento WebSocket para notificar cliente em tempo real
    const io = req.app.get('io');
    if (io) {
      console.log('🔌 Emitindo evento de pagamento confirmado para cliente...');
      io.to(`order-${id}`).emit('payment-confirmed', {
        type: 'payment-confirmed',
        order: updatedOrder,
        message: 'Pagamento confirmado com sucesso!'
      });
      
      // Notificar admin sobre a atualização
      io.to('admin-room').emit('order-updated', {
        type: 'order-updated',
        order: updatedOrder,
        message: `Pagamento confirmado para pedido #${id}`
      });
    }
    
    res.json({
      success: true,
      message: 'Pagamento confirmado com sucesso!'
    });
    
  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor' 
    });
  }
});

// Rejeitar pagamento do pedido (admin)
router.post('/:id/reject-payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;
    const adminId = req.user.id;
    
    // Verificar se o pedido existe e pode ser rejeitado
    const order = await getOne('SELECT * FROM orders WHERE id = ?', [id]);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Pedido não encontrado' 
      });
    }
    
    if (order.payment_status !== 'pendente') {
      return res.status(400).json({ 
        success: false,
        message: 'Pedido já foi confirmado ou rejeitado' 
      });
    }
    
    // Rejeitar pagamento
    await runCommand(`
      UPDATE orders SET 
        payment_status = 'rejeitado',
        order_status = 'cancelado',
        admin_notes = ?,
        confirmed_by = ?,
        confirmed_at = ?,
        updated_at = ?
      WHERE id = ?
    `, [admin_notes || null, adminId, getCurrentBrazilTime(), getCurrentBrazilTime(), id]);
    
    // Buscar pedido atualizado para enviar via WebSocket
    const updatedOrder = await getOne(`
      SELECT o.*, 
             GROUP_CONCAT(oi.product_name || ' x' || oi.quantity) as items_summary
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ?
      GROUP BY o.id
    `, [id]);
    
    // Emitir evento WebSocket para notificar cliente em tempo real
    const io = req.app.get('io');
    if (io) {
      console.log('🔌 Emitindo evento de pagamento rejeitado para cliente...');
      io.to(`order-${id}`).emit('payment-rejected', {
        type: 'payment-rejected',
        order: updatedOrder,
        message: 'Pagamento rejeitado e pedido cancelado!'
      });
      
      // Notificar admin sobre a atualização
      io.to('admin-room').emit('order-updated', {
        type: 'order-updated',
        order: updatedOrder,
        message: `Pagamento rejeitado para pedido #${id}`
      });
    }
    
    res.json({
      success: true,
      message: 'Pagamento rejeitado e pedido cancelado!'
    });
    
  } catch (error) {
    console.error('Erro ao rejeitar pagamento:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor' 
    });
  }
});

// Atualizar status do pedido (admin) - aceita tanto PATCH quanto PUT
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status, admin_notes } = req.body;
    const adminId = req.user.id;
    
    console.log('🔍 Debug - Atualizando status do pedido:', { id, order_status, admin_notes });
    
    // Verificar se o pedido existe
    const order = await getOne('SELECT * FROM orders WHERE id = ?', [id]);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Pedido não encontrado' 
      });
    }
    
    console.log('🔍 Debug - Pedido encontrado:', { 
      order_status: order.order_status, 
      payment_status: order.payment_status 
    });
    
    // Verificar se o pagamento foi confirmado
    if (order.payment_status !== 'confirmado') {
      console.log('❌ Debug - Pagamento não confirmado:', order.payment_status);
      return res.status(400).json({ 
        success: false,
        message: 'Pedido deve ter o pagamento confirmado antes de alterar o status' 
      });
    }
    
    // Validar transição de status baseada no tipo de entrega
    let validTransitions;
    
    if (order.delivery_type === 'delivery') {
      // Transições para DELIVERY
      validTransitions = {
        'novo': ['preparando'],
        'preparando': ['pronto'],
        'pronto': ['saiu_entrega'],
        'saiu_entrega': ['entregue'],
        'entregue': ['finalizado']
      };
    } else {
      // Transições para RETIRADA
      validTransitions = {
        'novo': ['preparando'],
        'preparando': ['pronto_retirada'],
        'pronto_retirada': ['retirado'],
        'retirado': ['finalizado']
      };
    }
    
    console.log('🔍 Debug - Validando transição:', { 
      current: order.order_status, 
      new: order_status, 
      valid: validTransitions[order.order_status] 
    });
    
    if (!validTransitions[order.order_status]?.includes(order_status)) {
      console.log('❌ Debug - Transição inválida');
      return res.status(400).json({ 
        success: false,
        message: 'Transição de status inválida' 
      });
    }
    
    console.log('✅ Debug - Transição válida, atualizando...');
    
    // Atualizar status
    await runCommand(`
      UPDATE orders SET 
        order_status = ?,
        admin_notes = COALESCE(?, admin_notes),
        updated_at = ?
      WHERE id = ?
    `, [order_status, admin_notes || null, getCurrentBrazilTime(), id]);
    
    // Buscar pedido atualizado para enviar via WebSocket
    const updatedOrder = await getOne(`
      SELECT o.*, 
             GROUP_CONCAT(oi.product_name || ' x' || oi.quantity) as items_summary
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ?
      GROUP BY o.id
    `, [id]);
    
    // Emitir evento WebSocket para notificar cliente em tempo real
    const io = req.app.get('io');
    if (io) {
      console.log('🔌 Emitindo evento de status atualizado para cliente...');
      io.to(`order-${id}`).emit('order-status-updated', {
        type: 'order-status-updated',
        order: updatedOrder,
        message: `Status atualizado para: ${getStatusDisplay(order_status, updatedOrder.payment_status, updatedOrder.delivery_type)}`
      });
      
      // Notificar admin sobre a atualização
      io.to('admin-room').emit('order-updated', {
        type: 'order-updated',
        order: updatedOrder,
        message: `Pedido #${id} atualizado`
      });
    }
    
    res.json({
      success: true,
      message: `Status do pedido atualizado para: ${getStatusDisplay(order_status, order.payment_status, order.delivery_type)}`
    });
    
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor' 
    });
  }
};

// Rotas para atualizar status - aceita tanto PATCH quanto PUT
router.patch('/:id/status', updateOrderStatus);
router.put('/:id/status', updateOrderStatus);

// Buscar pedido por ID (admin)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar pedido
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
        success: false,
        message: 'Pedido não encontrado' 
      });
    }
    
    // Buscar itens do pedido
    const items = await runQuery(`
      SELECT oi.*, p.image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [id]);
    
    res.json({
      success: true,
      data: {
        ...order,
        items,
        status_display: getStatusDisplay(order.order_status, order.payment_status, order.delivery_type),
        payment_status_display: getPaymentStatusDisplay(order.payment_status)
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor' 
    });
  }
});

// Relatório de vendas
router.get('/reports/sales', async (req, res) => {
  try {
    const { date_from, date_to, group_by = 'day' } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (date_from && date_to) {
      dateFilter = 'WHERE DATE(created_at) BETWEEN ? AND ?';
      params.push(date_from, date_to);
    } else if (date_from) {
      dateFilter = 'WHERE DATE(created_at) >= ?';
      params.push(date_from);
    } else if (date_to) {
      dateFilter = 'WHERE DATE(created_at) <= ?';
      params.push(date_to);
    }
    
    let groupByClause = '';
    if (group_by === 'day') {
      groupByClause = 'GROUP BY DATE(created_at)';
    } else if (group_by === 'month') {
      groupByClause = 'GROUP BY strftime("%Y-%m", created_at)';
    } else if (group_by === 'week') {
      groupByClause = 'GROUP BY strftime("%Y-%W", created_at)';
    }
    
    // Vendas por período
    const salesByPeriod = await runQuery(`
      SELECT 
        ${group_by === 'day' ? 'DATE(created_at)' : group_by === 'month' ? 'strftime("%Y-%m", created_at)' : 'strftime("%Y-%W", created_at)'} as period,
        COUNT(*) as order_count,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_order_value
      FROM orders 
      ${dateFilter}
      ${groupByClause}
      ORDER BY period DESC
    `, params);
    
    // Estatísticas gerais
    const generalStats = await getOne(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_order_value,
        MIN(total_amount) as min_order_value,
        MAX(total_amount) as max_order_value
      FROM orders 
      ${dateFilter}
    `, params);
    
    // Status dos pedidos
    const ordersByStatus = await runQuery(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(total_amount) as total_amount
      FROM orders 
      ${dateFilter}
      GROUP BY status
      ORDER BY count DESC
    `, params);
    
    // Métodos de pagamento
    const ordersByPayment = await runQuery(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(total_amount) as total_amount
      FROM orders 
      ${dateFilter}
      GROUP BY payment_method
      ORDER BY count DESC
    `, params);
    
    res.json({
      success: true,
      data: {
        salesByPeriod,
        generalStats,
        ordersByStatus,
        ordersByPayment,
        filters: {
          date_from,
          date_to,
          group_by
        }
      }
    });
    
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível gerar o relatório'
    });
  }
});

// Dashboard - estatísticas rápidas
router.get('/dashboard/stats', async (req, res) => {
  try {
    const today = getCurrentBrazilDate();
    
    // Pedidos de hoje
    const todayOrders = await getOne(`
      SELECT 
        COUNT(*) as count,
        SUM(total_amount) as revenue
      FROM orders 
      WHERE DATE(created_at) = ?
    `, [today]);
    
    // Pedidos pendentes
    const pendingOrders = await getOne(`
      SELECT COUNT(*) as count
      FROM orders 
      WHERE status IN ('novo', 'preparo')
    `);
    
    // Total de pedidos
    const totalOrders = await getOne(`
      SELECT COUNT(*) as count
      FROM orders
    `);
    
    // Receita total
    const totalRevenue = await getOne(`
      SELECT SUM(total_amount) as revenue
      FROM orders
    `);
    
    // Últimos 5 pedidos
    const recentOrders = await runQuery(`
      SELECT o.*, 
             GROUP_CONCAT(oi.product_name || ' x' || oi.quantity) as items_summary
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);
    
    res.json({
      success: true,
      data: {
        today: {
          orders: todayOrders.count || 0,
          revenue: todayOrders.revenue || 0
        },
        pending: pendingOrders.count || 0,
        total: {
          orders: totalOrders.count || 0,
          revenue: totalRevenue.revenue || 0
        },
        recentOrders
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar as estatísticas'
    });
  }
});

module.exports = router;
