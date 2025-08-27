const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../../middleware/auth');
const { runQuery, getOne } = require('../../config/database');
const { getCurrentBrazilDate } = require('../../utils/dateUtils');

// Middleware de autenticação e admin para todas as rotas
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/customers - Listar todos os clientes com estatísticas
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Buscando clientes com estatísticas...');
    
    // Query para buscar clientes com estatísticas agregadas
    const customersQuery = `
      SELECT 
        o.customer_name,
        o.customer_phone,
        o.customer_email,
        o.customer_address,
        COUNT(o.id) as total_orders,
        SUM(o.total_amount) as total_spent,
        MIN(o.created_at) as first_order_date,
        MAX(o.created_at) as last_order_date,
        CASE 
          WHEN MAX(o.created_at) < datetime('now', '-30 days') THEN 'inativo'
          ELSE 'ativo'
        END as status
      FROM orders o
      GROUP BY o.customer_phone
      ORDER BY total_spent DESC, total_orders DESC
    `;
    
    console.log('🔍 Executando query:', customersQuery);
    const customers = await runQuery(customersQuery);
    console.log('🔍 Resultado da query:', customers);
    
    // Para cada cliente, buscar histórico de pedidos (simplificado)
    const customersWithOrders = await Promise.all(
      customers.map(async (customer) => {
        const ordersQuery = `
          SELECT 
            o.id,
            o.created_at,
            o.total_amount,
            o.order_status,
            o.payment_status,
            o.notes
          FROM orders o
          WHERE o.customer_phone = ?
          ORDER BY o.created_at DESC
          LIMIT 10
        `;
        
        const orders = await runQuery(ordersQuery, [customer.customer_phone]);
        
        return {
          ...customer,
          orders: orders,
          // Adicionar ID único baseado no telefone (já que agrupamos por telefone)
          id: customer.customer_phone.replace(/\D/g, '').slice(-8) // Últimos 8 dígitos do telefone
        };
      })
    );
    
    console.log(`✅ ${customersWithOrders.length} clientes encontrados`);
    
    res.json({
      success: true,
      data: customersWithOrders,
      message: `${customersWithOrders.length} clientes encontrados`
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao buscar clientes'
    });
  }
});

// GET /api/admin/customers/:phone - Buscar cliente específico por telefone
router.get('/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    console.log(`🔍 Buscando cliente com telefone: ${phone}`);
    
    // Query para buscar cliente específico
    const customerQuery = `
      SELECT 
        o.customer_name,
        o.customer_phone,
        o.customer_email,
        o.customer_address,
        COUNT(o.id) as total_orders,
        SUM(o.total_amount) as total_spent,
        MIN(o.created_at) as first_order_date,
        MAX(o.created_at) as last_order_date,
        CASE 
          WHEN MAX(o.created_at) < datetime('now', '-30 days') THEN 'inativo'
          ELSE 'ativo'
        END as status
      FROM orders o
      WHERE o.customer_phone = ?
      GROUP BY o.customer_phone
    `;
    
    const customer = await getOne(customerQuery, [phone]);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }
    
    // Buscar histórico completo de pedidos (simplificado)
    const ordersQuery = `
      SELECT 
        o.id,
        o.created_at,
        o.total_amount,
        o.order_status,
        o.payment_status,
        o.notes
      FROM orders o
      WHERE o.customer_phone = ?
      ORDER BY o.created_at DESC
    `;
    
    const orders = await runQuery(ordersQuery, [phone]);
    
    const customerWithOrders = {
      ...customer,
      orders: orders,
      id: phone.replace(/\D/g, '').slice(-8)
    };
    
    console.log(`✅ Cliente encontrado: ${customer.customer_name}`);
    
    res.json({
      success: true,
      data: customerWithOrders,
      message: 'Cliente encontrado com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao buscar cliente'
    });
  }
});

// GET /api/admin/customers/:phone/orders - Buscar apenas pedidos de um cliente
router.get('/:phone/orders', async (req, res) => {
  try {
    const { phone } = req.params;
    console.log(`🔍 Buscando pedidos do cliente: ${phone}`);
    
    const ordersQuery = `
      SELECT 
        o.id,
        o.created_at,
        o.total_amount,
        o.order_status,
        o.payment_status,
        o.notes
      FROM orders o
      WHERE o.customer_phone = ?
      ORDER BY o.created_at DESC
    `;
    
    const orders = await runQuery(ordersQuery, [phone]);
    
    console.log(`✅ ${orders.length} pedidos encontrados para o cliente`);
    
    res.json({
      success: true,
      data: orders,
      message: `${orders.length} pedidos encontrados`
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar pedidos do cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao buscar pedidos'
    });
  }
});

module.exports = router;
