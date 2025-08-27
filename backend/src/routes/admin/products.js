const express = require('express');
const { body, validationResult } = require('express-validator');
const { runQuery, runCommand, getOne } = require('../../config/database');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');
const { getCurrentBrazilTime } = require('../../utils/dateUtils');

const router = express.Router();

// Aplicar middleware de autenticação e admin em todas as rotas
router.use(authenticateToken);
router.use(requireAdmin);

// Listar todos os produtos (admin)
router.get('/', async (req, res) => {
  try {
    const { category_id, search, status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let sql = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.active = 1
    `;
    
    const params = [];
    
    // Filtros
    if (category_id) {
      sql += ' AND p.category_id = ?';
      params.push(category_id);
    }
    
    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (status === 'available') {
      sql += ' AND p.available = 1';
    } else if (status === 'unavailable') {
      sql += ' AND p.available = 0';
    }
    
    console.log('🔍 SQL Query:', sql);
    console.log('🔍 Params:', params);
    
    // Contar total
    const countSql = sql.replace('SELECT p.*, c.name as category_name', 'SELECT COUNT(*) as count');
    const totalResult = await getOne(countSql, params);
    const total = totalResult.count;
    
    console.log('🔍 Total de produtos:', total);
    
    // Buscar produtos com paginação
    sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const products = await runQuery(sql, params);
    
    console.log('🔍 Produtos encontrados:', products.length);
    console.log('🔍 Primeiro produto:', products[0]);
    
    res.json({
      success: true,
      data: products,
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
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar os produtos'
    });
  }
});

// Buscar produto por ID (admin)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await getOne(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ? AND p.active = 1
    `, [id]);
    
    if (!product) {
      return res.status(404).json({ 
        error: 'Produto não encontrado',
        message: 'O produto solicitado não existe'
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

// Criar novo produto
router.post('/', [
  body('name').notEmpty().withMessage('Nome do produto é obrigatório'),
  body('price').isFloat({ min: 0.01 }).withMessage('Preço deve ser maior que zero'),
  body('category_id').isInt().withMessage('Categoria é obrigatória'),
  body('description').optional().isString(),
  body('image_url').optional().isURL().withMessage('URL da imagem deve ser válida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { name, description, price, category_id, image_url, available = true } = req.body;
    
    // Verificar se a categoria existe
    const category = await getOne('SELECT id FROM categories WHERE id = ? AND active = 1', [category_id]);
    if (!category) {
      return res.status(400).json({ 
        error: 'Categoria inválida',
        message: 'A categoria selecionada não existe'
      });
    }
    
    const result = await runCommand(`
      INSERT INTO products (name, description, price, category_id, image_url, available)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, description, price, category_id, image_url, available]);
    
    const newProduct = await getOne(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ? AND p.active = 1
    `, [result.id]);
    
    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso',
      data: newProduct
    });
    
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível criar o produto'
    });
  }
});

// Atualizar produto
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Nome do produto não pode ser vazio'),
  body('price').optional().isFloat({ min: 0.01 }).withMessage('Preço deve ser maior que zero'),
  body('category_id').optional().isInt().withMessage('Categoria deve ser um ID válido'),
  body('image_url').optional().isURL().withMessage('URL da imagem deve ser válida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { name, description, price, category_id, image_url, available } = req.body;
    
    // Verificar se o produto existe
    const existingProduct = await getOne('SELECT * FROM products WHERE id = ? AND active = 1', [id]);
    if (!existingProduct) {
      return res.status(404).json({ 
        error: 'Produto não encontrado',
        message: 'O produto solicitado não existe'
      });
    }
    
    // Verificar categoria se fornecida
    if (category_id) {
      const category = await getOne('SELECT id FROM categories WHERE id = ? AND active = 1', [category_id]);
      if (!category) {
        return res.status(400).json({ 
          error: 'Categoria inválida',
          message: 'A categoria selecionada não existe'
        });
      }
    }
    
    // Construir query de atualização
    const updates = [];
    const params = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      params.push(price);
    }
    if (category_id !== undefined) {
      updates.push('category_id = ?');
      params.push(category_id);
    }
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      params.push(image_url);
    }
    if (available !== undefined) {
      updates.push('available = ?');
      params.push(available);
    }
    
    updates.push('updated_at = ?');
    
    if (updates.length === 1) { // Apenas updated_at
      return res.status(400).json({ 
        error: 'Nenhuma alteração',
        message: 'Nenhum campo foi alterado'
      });
    }
    
    params.push(getCurrentBrazilTime());
    params.push(id);
    
    await runCommand(`
      UPDATE products 
      SET ${updates.join(', ')}
      WHERE id = ?
    `, params);
    
    const updatedProduct = await getOne(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ? AND p.active = 1
    `, [id]);
    
    res.json({
      success: true,
      message: 'Produto atualizado com sucesso',
      data: updatedProduct
    });
    
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível atualizar o produto'
    });
  }
});

// Deletar produto (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Tentando excluir produto ID:', id);
    
    // Verificar se o produto existe
    const product = await getOne('SELECT * FROM products WHERE id = ? AND active = 1', [id]);
    if (!product) {
      console.log('❌ Produto não encontrado ou já inativo');
      return res.status(404).json({ 
        error: 'Produto não encontrado',
        message: 'O produto solicitado não existe'
      });
    }
    
    console.log('✅ Produto encontrado:', product.name);
    
    // Soft delete - marcar como inativo
    const result = await runCommand(`
      UPDATE products 
      SET active = 0, updated_at = ?
      WHERE id = ?
    `, [getCurrentBrazilTime(), id]);
    
    console.log('✅ Produto marcado como inativo. Linhas afetadas:', result.changes);
    
    res.json({
      success: true,
      message: 'Produto removido com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro ao remover produto:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível remover o produto'
    });
  }
});

// Alterar disponibilidade do produto
router.patch('/:id/toggle-availability', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await getOne('SELECT available FROM products WHERE id = ? AND active = 1', [id]);
    if (!product) {
      return res.status(404).json({ 
        error: 'Produto não encontrado',
        message: 'O produto solicitado não existe'
      });
    }
    
    const newStatus = !product.available;
    
    await runCommand(`
      UPDATE products 
      SET available = ?, updated_at = ?
      WHERE id = ?
    `, [newStatus, getCurrentBrazilTime(), id]);
    
    res.json({
      success: true,
      message: `Produto ${newStatus ? 'disponibilizado' : 'indisponibilizado'} com sucesso`,
      data: { available: newStatus }
    });
    
  } catch (error) {
    console.error('Erro ao alterar disponibilidade:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível alterar a disponibilidade do produto'
    });
  }
});

module.exports = router;
