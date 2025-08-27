const express = require('express');
const { runQuery, getOne } = require('../config/database');

const router = express.Router();

// Listar todos os produtos disponíveis (para o cliente)
router.get('/', async (req, res) => {
  try {
    const { category_id, search } = req.query;
    
    let sql = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.available = 1 AND p.active = 1
    `;
    
    const params = [];
    
    // Filtro por categoria
    if (category_id) {
      sql += ' AND p.category_id = ?';
      params.push(category_id);
    }
    
    // Busca por nome
    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    sql += ' ORDER BY p.name ASC';
    
    const products = await runQuery(sql, params);
    
    res.json({
      success: true,
      data: products,
      count: products.length
    });
    
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar os produtos'
    });
  }
});

// Buscar produto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await getOne(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ? AND p.available = 1 AND p.active = 1
    `, [id]);
    
    if (!product) {
      return res.status(404).json({ 
        error: 'Produto não encontrado',
        message: 'O produto solicitado não existe ou não está disponível'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
    
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar o produto'
    });
  }
});

// Buscar produtos por categoria
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const products = await runQuery(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.category_id = ? AND p.available = 1 AND p.active = 1
      ORDER BY p.name ASC
    `, [categoryId]);
    
    res.json({
      success: true,
      data: products,
      count: products.length
    });
    
  } catch (error) {
    console.error('Erro ao buscar produtos por categoria:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar os produtos da categoria'
    });
  }
});

// Buscar produtos em destaque (opcional)
router.get('/featured/items', async (req, res) => {
  try {
    const products = await runQuery(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.available = 1 AND p.active = 1
      ORDER BY p.created_at DESC
      LIMIT 8
    `);
    
    res.json({
      success: true,
      data: products,
      count: products.length
    });
    
  } catch (error) {
    console.error('Erro ao buscar produtos em destaque:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar os produtos em destaque'
    });
  }
});

module.exports = router;
