const express = require('express');
const { body, validationResult } = require('express-validator');
const { runQuery, runCommand, getOne } = require('../../config/database');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');
const { getCurrentBrazilTime } = require('../../utils/dateUtils');

const router = express.Router();

// Aplicar middleware de autenticação e admin em todas as rotas
router.use(authenticateToken);
router.use(requireAdmin);

// Listar todas as categorias (admin)
router.get('/', async (req, res) => {
  try {
    const { active, search } = req.query;
    
    let sql = `
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.active = 1
      WHERE 1=1
    `;
    
    const params = [];
    
    // Filtros
    if (active !== undefined) {
      sql += ' AND c.active = ?';
      params.push(active === 'true' ? 1 : 0);
    }
    
    if (search) {
      sql += ' AND (c.name LIKE ? OR c.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    sql += ' GROUP BY c.id ORDER BY c.name ASC';
    
    const categories = await runQuery(sql, params);
    
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

// Buscar categoria por ID (admin)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await getOne(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.active = 1
      WHERE c.id = ?
      GROUP BY c.id
    `, [id]);
    
    if (!category) {
      return res.status(404).json({ 
        error: 'Categoria não encontrada',
        message: 'A categoria solicitada não existe'
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

// Criar nova categoria
router.post('/', [
  body('name').notEmpty().withMessage('Nome da categoria é obrigatório'),
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

    const { name, description, image_url } = req.body;
    
    // Verificar se já existe categoria com o mesmo nome
    const existingCategory = await getOne('SELECT id FROM categories WHERE name = ?', [name]);
    if (existingCategory) {
      return res.status(400).json({ 
        error: 'Categoria já existe',
        message: 'Já existe uma categoria com este nome'
      });
    }
    
    const result = await runCommand(`
      INSERT INTO categories (name, description, image_url)
      VALUES (?, ?, ?)
    `, [name, description, image_url]);
    
    const newCategory = await getOne(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.active = 1
      WHERE c.id = ?
      GROUP BY c.id
    `, [result.id]);
    
    res.status(201).json({
      success: true,
      message: 'Categoria criada com sucesso',
      data: newCategory
    });
    
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível criar a categoria'
    });
  }
});

// Atualizar categoria
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Nome da categoria não pode ser vazio'),
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

    const { id } = req.params;
    const { name, description, image_url, active } = req.body;
    
    // Verificar se a categoria existe
    const existingCategory = await getOne('SELECT * FROM categories WHERE id = ?', [id]);
    if (!existingCategory) {
      return res.status(404).json({ 
        error: 'Categoria não encontrada',
        message: 'A categoria solicitada não existe'
      });
    }
    
    // Verificar se o nome já existe em outra categoria
    if (name && name !== existingCategory.name) {
      const duplicateCategory = await getOne('SELECT id FROM categories WHERE name = ? AND id != ?', [name, id]);
      if (duplicateCategory) {
        return res.status(400).json({ 
          error: 'Nome já existe',
          message: 'Já existe outra categoria com este nome'
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
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      params.push(image_url);
    }
    if (active !== undefined) {
      updates.push('active = ?');
      params.push(active);
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
      UPDATE categories 
      SET ${updates.join(', ')}
      WHERE id = ?
    `, params);
    
    const updatedCategory = await getOne(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.active = 1
      WHERE c.id = ?
      GROUP BY c.id
    `, [id]);
    
    res.json({
      success: true,
      message: 'Categoria atualizada com sucesso',
      data: updatedCategory
    });
    
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível atualizar a categoria'
    });
  }
});

// Deletar categoria (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se a categoria existe
    const category = await getOne('SELECT * FROM categories WHERE id = ?', [id]);
    if (!category) {
      return res.status(404).json({ 
        error: 'Categoria não encontrada',
        message: 'A categoria solicitada não existe'
      });
    }
    
    // Verificar se há produtos ativos nesta categoria
    const productsInCategory = await getOne(`
      SELECT COUNT(*) as count 
      FROM products 
      WHERE category_id = ? AND active = 1
    `, [id]);
    
    if (productsInCategory.count > 0) {
      return res.status(400).json({ 
        error: 'Categoria em uso',
        message: 'Não é possível remover uma categoria que possui produtos ativos'
      });
    }
    
    // Soft delete - marcar como inativa
    await runCommand(`
      UPDATE categories 
      SET active = 0, updated_at = ?
      WHERE id = ?
    `, [getCurrentBrazilTime(), id]);
    
    res.json({
      success: true,
      message: 'Categoria removida com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao remover categoria:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível remover a categoria'
    });
  }
});

// Alterar status da categoria
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await getOne('SELECT active FROM categories WHERE id = ?', [id]);
    if (!category) {
      return res.status(404).json({ 
        error: 'Categoria não encontrada',
        message: 'A categoria solicitada não existe'
      });
    }
    
    const newStatus = !category.active;
    
    await runCommand(`
      UPDATE categories 
      SET active = ?, updated_at = ?
      WHERE id = ?
    `, [newStatus, getCurrentBrazilTime(), id]);
    
    res.json({
      success: true,
      message: `Categoria ${newStatus ? 'ativada' : 'desativada'} com sucesso`,
      data: { active: newStatus }
    });
    
  } catch (error) {
    console.error('Erro ao alterar status da categoria:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível alterar o status da categoria'
    });
  }
});

// Estatísticas das categorias
router.get('/stats/overview', async (req, res) => {
  try {
    // Categorias mais populares
    const popularCategories = await runQuery(`
      SELECT 
        c.id,
        c.name,
        COUNT(p.id) as product_count,
        SUM(p.price) as total_value
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.active = 1 AND p.available = 1
      WHERE c.active = 1
      GROUP BY c.id
      ORDER BY product_count DESC
      LIMIT 5
    `);
    
    // Total de categorias
    const totalCategories = await getOne(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN active = 1 THEN 1 END) as active_count,
        COUNT(CASE WHEN active = 0 THEN 1 END) as inactive_count
      FROM categories
    `);
    
    // Categorias sem produtos
    const emptyCategories = await runQuery(`
      SELECT c.id, c.name
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.active = 1
      WHERE c.active = 1
      GROUP BY c.id
      HAVING COUNT(p.id) = 0
      ORDER BY c.name
    `);
    
    res.json({
      success: true,
      data: {
        popularCategories,
        totalCategories,
        emptyCategories
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas das categorias:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar as estatísticas'
    });
  }
});

module.exports = router;
