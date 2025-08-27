const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getOne } = require('../config/database');

const router = express.Router();

// Login do administrador
router.post('/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
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

    const { email, password } = req.body;

    // Buscar usuário no banco
    const user = await getOne(
      'SELECT id, email, password, name, role FROM users WHERE email = ? AND active = 1',
      [email]
    );

    if (!user) {
      return res.status(401).json({ 
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    // Gerar token JWT
    const secret = process.env.JWT_SECRET || 'sua_chave_secreta_padrao';
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      },
      secret,
      { expiresIn: '24h' }
    );

    // Retornar dados do usuário e token
    res.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível realizar o login'
    });
  }
});

// Verificar token (para validar se ainda é válido)
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Token não fornecido',
        valid: false
      });
    }

    const secret = process.env.JWT_SECRET || 'sua_chave_secreta_padrao';
    const decoded = jwt.verify(token, secret);

    // Buscar dados atualizados do usuário
    const user = await getOne(
      'SELECT id, email, name, role FROM users WHERE id = ? AND active = 1',
      [decoded.id]
    );

    if (!user) {
      return res.status(401).json({ 
        error: 'Usuário não encontrado',
        valid: false
      });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        valid: false
      });
    }
    
    res.status(401).json({ 
      error: 'Token inválido',
      valid: false
    });
  }
});

// Logout (opcional - o token é invalidado no frontend)
router.post('/logout', (req, res) => {
  res.json({ 
    message: 'Logout realizado com sucesso',
    note: 'O token foi invalidado no cliente'
  });
});

module.exports = router;
