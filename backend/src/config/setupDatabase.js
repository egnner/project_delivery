const { db, runCommand } = require('./database');
const bcrypt = require('bcryptjs');
const { getCurrentBrazilTime } = require('../utils/dateUtils');

// Scripts SQL para criar as tabelas
const createTables = async () => {
  try {
    console.log('🗄️ Criando tabelas do banco...');

    // Tabela de categorias
    await runCommand(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        image_url TEXT,
        icon TEXT DEFAULT 'Utensils',
        active BOOLEAN DEFAULT 1,
        prep_time_min INTEGER DEFAULT 25,
        prep_time_max INTEGER DEFAULT 35,
        show_prep_time BOOLEAN DEFAULT 1,
        created_at DATETIME,
        updated_at DATETIME
      )
    `);

    // Adicionar coluna icon se não existir (migração)
    try {
      await runCommand(`ALTER TABLE categories ADD COLUMN icon TEXT DEFAULT 'Utensils'`);
    } catch (error) {
      // Coluna já existe, ignorar erro
    }

    // Adicionar colunas de tempo de preparo se não existirem (migração)
    try {
      await runCommand(`ALTER TABLE categories ADD COLUMN prep_time_min INTEGER DEFAULT 25`);
    } catch (error) {
      // Coluna já existe, ignorar erro
    }

    try {
      await runCommand(`ALTER TABLE categories ADD COLUMN prep_time_max INTEGER DEFAULT 35`);
    } catch (error) {
      // Coluna já existe, ignorar erro
    }

    try {
      await runCommand(`ALTER TABLE categories ADD COLUMN show_prep_time BOOLEAN DEFAULT 1`);
    } catch (error) {
      // Coluna já existe, ignorar erro
    }

    // Adicionar coluna show_contact_info se não existir (migração)
    try {
      await runCommand(`ALTER TABLE store_settings ADD COLUMN show_contact_info BOOLEAN DEFAULT 1`);
    } catch (error) {
      // Coluna já existe, ignorar erro
    }

    // Adicionar colunas de métodos de pagamento se não existirem (migração)
    try {
      await runCommand(`ALTER TABLE store_settings ADD COLUMN payment_methods TEXT DEFAULT '["dinheiro","pix","cartao"]'`);
    } catch (error) {
      // Coluna já existe, ignorar erro
    }

    try {
      await runCommand(`ALTER TABLE store_settings ADD COLUMN payment_pix_enabled BOOLEAN DEFAULT 1`);
    } catch (error) {
      // Coluna já existe, ignorar erro
    }

    try {
      await runCommand(`ALTER TABLE store_settings ADD COLUMN payment_cartao_enabled BOOLEAN DEFAULT 1`);
    } catch (error) {
      // Coluna já existe, ignorar erro
    }

    try {
      await runCommand(`ALTER TABLE store_settings ADD COLUMN payment_dinheiro_enabled BOOLEAN DEFAULT 1`);
    } catch (error) {
      // Coluna já existe, ignorar erro
    }

    try {
      await runCommand(`ALTER TABLE store_settings ADD COLUMN payment_gateway_enabled BOOLEAN DEFAULT 0`);
    } catch (error) {
      // Coluna já existe, ignorar erro
    }

    try {
      await runCommand(`ALTER TABLE store_settings ADD COLUMN payment_gateway_provider TEXT`);
    } catch (error) {
      // Coluna já existe, ignorar erro
    }

    try {
      await runCommand(`ALTER TABLE store_settings ADD COLUMN payment_gateway_credentials TEXT`);
    } catch (error) {
      // Coluna já existe, ignorar erro
    }

    // Tabela de produtos
    await runCommand(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image_url TEXT,
        category_id INTEGER,
        available BOOLEAN DEFAULT 1,
        active BOOLEAN DEFAULT 1,
        created_at DATETIME,
        updated_at DATETIME,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      )
    `);

    // Tabela de usuários admin
    await runCommand(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de clientes
    await runCommand(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de pedidos
    await runCommand(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_address TEXT NOT NULL,
        delivery_type TEXT DEFAULT 'delivery',
        total_amount DECIMAL(10,2) NOT NULL,
        payment_method TEXT NOT NULL,
        payment_status TEXT DEFAULT 'pendente',
        order_status TEXT DEFAULT 'novo',
        notes TEXT,
        admin_notes TEXT,
        confirmed_by INTEGER,
        confirmed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (confirmed_by) REFERENCES users (id)
      )
    `);

    // Tabela de itens do pedido
    await runCommand(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
      )
    `);

    // Tabela de configurações da loja
    await runCommand(`
      CREATE TABLE IF NOT EXISTS store_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        store_name TEXT NOT NULL,
        store_logo TEXT,
        contact_phone TEXT NOT NULL,
        contact_email TEXT,
        address TEXT NOT NULL,
        number TEXT,
        neighborhood TEXT,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        zip_code TEXT,
        opening_hours TEXT,
        delivery_info TEXT,
        delivery_enabled BOOLEAN DEFAULT 1,
        pickup_enabled BOOLEAN DEFAULT 1,
        min_order_amount REAL DEFAULT 0,
        delivery_fee REAL DEFAULT 0,
        free_delivery_threshold REAL DEFAULT 0,
        show_phone BOOLEAN DEFAULT 1,
        show_email BOOLEAN DEFAULT 1,
        show_address BOOLEAN DEFAULT 1,
        show_contact_info BOOLEAN DEFAULT 1,
        payment_methods TEXT DEFAULT '["dinheiro","pix","cartao"]',
        payment_pix_enabled BOOLEAN DEFAULT 1,
        payment_cartao_enabled BOOLEAN DEFAULT 1,
        payment_dinheiro_enabled BOOLEAN DEFAULT 1,
        payment_gateway_enabled BOOLEAN DEFAULT 0,
        payment_gateway_provider TEXT,
        payment_gateway_credentials TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tabelas criadas com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    throw error;
  }
};

// Inserir dados iniciais
const insertInitialData = async () => {
  try {
    console.log('📝 Inserindo dados iniciais...');

    // Criar usuário admin padrão
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await runCommand(`
      INSERT OR IGNORE INTO users (email, password, name, role)
      VALUES (?, ?, ?, ?)
    `, ['admin@delivery.com', hashedPassword, 'Administrador', 'admin']);

    // Criar categorias padrão
    const categories = [
      ['Pizzas', 'Pizzas tradicionais e especiais', '/images/categories/pizzas.jpg'],
      ['Bebidas', 'Refrigerantes, sucos e água', '/images/categories/bebidas.jpg'],
      ['Sobremesas', 'Doces e sobremesas deliciosas', '/images/categories/sobremesas.jpg'],
      ['Acompanhamentos', 'Batatas, saladas e outros', '/images/categories/acompanhamentos.jpg']
    ];

    for (const [name, description, image] of categories) {
      await runCommand(`
        INSERT OR IGNORE INTO categories (name, description, image_url)
        VALUES (?, ?, ?)
      `, [name, description, image]);
    }

    // Criar produtos de exemplo
    const products = [
      ['Pizza Margherita', 'Pizza tradicional com molho, mussarela e manjericão', 25.90, 1, '/images/products/margherita.jpg'],
      ['Pizza Pepperoni', 'Pizza com pepperoni e queijo', 29.90, 1, '/images/products/pepperoni.jpg'],
      ['Coca-Cola 350ml', 'Refrigerante Coca-Cola 350ml', 5.90, 2, '/images/products/coca-cola.jpg'],
      ['Batata Frita', 'Porção de batatas fritas crocantes', 12.90, 4, '/images/products/batata-frita.jpg'],
      ['Tiramisu', 'Sobremesa italiana tradicional', 15.90, 3, '/images/products/tiramisu.jpg']
    ];

    for (const [name, description, price, categoryId, image] of products) {
      await runCommand(`
        INSERT OR IGNORE INTO products (name, description, price, category_id, image_url)
        VALUES (?, ?, ?, ?, ?)
      `, [name, description, price, categoryId, image]);
    }

    // Criar configurações padrão da loja
    const defaultOpeningHours = {
      monday: { open: '08:00', close: '22:00', closed: false },
      tuesday: { open: '08:00', close: '22:00', closed: false },
      wednesday: { open: '08:00', close: '22:00', closed: false },
      thursday: { open: '08:00', close: '22:00', closed: false },
      friday: { open: '08:00', close: '23:00', closed: false },
      saturday: { open: '09:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '22:00', closed: false }
    };

    await runCommand(`
      INSERT OR IGNORE INTO store_settings (
        store_name, store_logo, contact_phone, contact_email, address, number,
        neighborhood, city, state, zip_code, opening_hours, delivery_info,
        delivery_enabled, pickup_enabled, min_order_amount, delivery_fee,
        free_delivery_threshold, show_phone, show_email, show_address, show_contact_info,
        payment_methods, payment_pix_enabled, payment_cartao_enabled, payment_dinheiro_enabled,
        payment_gateway_enabled, payment_gateway_provider, payment_gateway_credentials
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Minha Loja', '', '(11) 99999-9999', 'contato@minhaloja.com', 'Rua das Flores', '123',
      'Centro', 'São Paulo', 'SP', '01234-567', JSON.stringify(defaultOpeningHours),
      'Entregamos em toda a região com prazo médio de 30-45 minutos.',
      1, 1, 15.00, 5.00, 50.00, 1, 1, 1, 1,
      JSON.stringify(['dinheiro', 'pix', 'cartao']), 1, 1, 1, 0, null, null
    ]);

    console.log('✅ Dados iniciais inseridos com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao inserir dados iniciais:', error);
    throw error;
  }
};

// Função principal de setup
const setupDatabase = async () => {
  try {
    console.log('🚀 Iniciando configuração do banco de dados...');
    
    await createTables();
    await insertInitialData();
    
    console.log('🎉 Banco de dados configurado com sucesso!');
    console.log('👤 Usuário admin criado: admin@delivery.com / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('💥 Erro na configuração do banco:', error);
    process.exit(1);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
