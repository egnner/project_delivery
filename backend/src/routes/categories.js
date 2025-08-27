const express = require('express');
const { runQuery, getOne } = require('../config/database');

const router = express.Router();

// Listar todas as categorias ativas
router.get('/', async (req, res) => {
  try {
    const categories = await runQuery(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.available = 1 AND p.active = 1
      WHERE c.active = 1
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    
    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
    
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar as categorias'
    });
  }
});

// Buscar categoria por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await getOne(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.available = 1 AND p.active = 1
      WHERE c.id = ? AND c.active = 1
      GROUP BY c.id
    `, [id]);
    
    if (!category) {
      return res.status(404).json({ 
        error: 'Categoria não encontrada',
        message: 'A categoria solicitada não existe ou não está ativa'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
    
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar a categoria'
    });
  }
});

// Buscar produtos de uma categoria específica
router.get('/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    // Verificar se a categoria existe
    const category = await getOne('SELECT * FROM categories WHERE id = ? AND active = 1', [id]);
    if (!category) {
      return res.status(404).json({ 
        error: 'Categoria não encontrada',
        message: 'A categoria solicitada não existe ou não está ativa'
      });
    }
    
    // Buscar produtos da categoria
    const products = await runQuery(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ? AND p.available = 1 AND p.active = 1
      ORDER BY p.name ASC
      LIMIT ? OFFSET ?
    `, [id, parseInt(limit), parseInt(offset)]);
    
    // Contar total de produtos na categoria
    const totalCount = await getOne(`
      SELECT COUNT(*) as count
      FROM products
      WHERE category_id = ? AND available = 1 AND active = 1
    `, [id]);
    
    res.json({
      success: true,
      data: {
        category,
        products,
        pagination: {
          total: totalCount.count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < totalCount.count
        }
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar produtos da categoria:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar os produtos da categoria'
    });
  }
});

module.exports = router;
