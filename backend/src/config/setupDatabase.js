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
        about_us TEXT,
        delivery_info TEXT,
        delivery_enabled BOOLEAN DEFAULT 1,
        pickup_enabled BOOLEAN DEFAULT 1,
        min_order_amount REAL DEFAULT 0,
        delivery_fee REAL DEFAULT 0,
        free_delivery_threshold REAL DEFAULT 0,
        show_phone BOOLEAN DEFAULT 1,
        show_email BOOLEAN DEFAULT 1,
        show_address BOOLEAN DEFAULT 1,
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
