const jwt = require('jsonwebtoken');

// Middleware para verificar o token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Token de acesso não fornecido',
      message: 'É necessário fazer login para acessar este recurso' 
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'sua_chave_secreta_padrao';
    const decoded = jwt.verify(token, secret);
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        message: 'Sua sessão expirou. Faça login novamente.' 
      });
    }
    
    return res.status(403).json({ 
      error: 'Token inválido',
      message: 'Token de acesso inválido ou corrompido' 
    });
  }
};

// Middleware para verificar se o usuário é admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Acesso negado',
      message: 'Você não tem permissão para acessar este recurso'
    });
  }
  next();
};

// Middleware para verificar se o usuário é o dono do recurso ou admin
const requireOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Não autorizado',
      message: 'É necessário fazer login'
    });
  }

  if (req.user.role === 'admin') {
    return next();
  }

  // Se não for admin, verifica se é o dono do recurso
  if (req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({ 
      error: 'Acesso negado',
      message: 'Você só pode acessar seus próprios recursos'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnerOrAdmin
};
