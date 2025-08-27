const { db, runCommand, runQuery } = require('./database');

// Script para verificar e corrigir o banco de dados
const checkDatabase = async () => {
  try {
    console.log('🔍 Verificando banco de dados...');

    // Verificar se a coluna active existe na tabela products
    try {
      const columns = await runQuery("PRAGMA table_info(products)");
      const hasActiveColumn = columns.some(col => col.name === 'active');
      
      if (!hasActiveColumn) {
        console.log('⚠️ Coluna "active" não encontrada na tabela products. Adicionando...');
        await runCommand('ALTER TABLE products ADD COLUMN active BOOLEAN DEFAULT 1');
        console.log('✅ Coluna "active" adicionada com sucesso!');
      } else {
        console.log('✅ Coluna "active" já existe na tabela products');
      }
    } catch (error) {
      console.log('⚠️ Erro ao verificar coluna active:', error.message);
    }

    // Verificar se a coluna active existe na tabela categories
    try {
      const columns = await runQuery("PRAGMA table_info(categories)");
      const hasActiveColumn = columns.some(col => col.name === 'active');
      
      if (!hasActiveColumn) {
        console.log('⚠️ Coluna "active" não encontrada na tabela categories. Adicionando...');
        await runCommand('ALTER TABLE categories ADD COLUMN active BOOLEAN DEFAULT 1');
        console.log('✅ Coluna "active" adicionada com sucesso!');
      } else {
        console.log('✅ Coluna "active" já existe na tabela categories');
      }
    } catch (error) {
      console.log('⚠️ Erro ao verificar coluna active:', error.message);
    }

    // Verificar se a coluna 'active' existe na tabela 'store_settings'
    const storeSettingsColumns = await runQuery("PRAGMA table_info(store_settings)");
    const storeSettingsColumnNames = storeSettingsColumns.map(col => col.name);
    
    if (!storeSettingsColumnNames.includes('show_phone')) {
      console.log('Adicionando coluna show_phone à tabela store_settings...');
      await runCommand('ALTER TABLE store_settings ADD COLUMN show_phone BOOLEAN DEFAULT 1');
    }
    
    if (!storeSettingsColumnNames.includes('show_email')) {
      console.log('Adicionando coluna show_email à tabela store_settings...');
      await runCommand('ALTER TABLE store_settings ADD COLUMN show_email BOOLEAN DEFAULT 1');
    }
    
    if (!storeSettingsColumnNames.includes('show_address')) {
      console.log('Adicionando coluna show_address à tabela store_settings...');
      await runCommand('ALTER TABLE store_settings ADD COLUMN show_address BOOLEAN DEFAULT 1');
    }
    
    // Verificar se a coluna 'number' existe na tabela 'store_settings'
    if (!storeSettingsColumnNames.includes('number')) {
      console.log('Adicionando coluna number à tabela store_settings...');
      await runCommand('ALTER TABLE store_settings ADD COLUMN number TEXT');
    }

    // Verificar e adicionar colunas na tabela orders
    try {
      const orderColumns = await runQuery("PRAGMA table_info(orders)");
      const orderColumnNames = orderColumns.map(col => col.name);
      
      // Adicionar customer_email se não existir
      if (!orderColumnNames.includes('customer_email')) {
        console.log('➕ Adicionando coluna customer_email na tabela orders...');
        await runCommand('ALTER TABLE orders ADD COLUMN customer_email TEXT');
      }
      
      // Adicionar payment_status se não existir
      if (!orderColumnNames.includes('payment_status')) {
        console.log('➕ Adicionando coluna payment_status na tabela orders...');
        await runCommand('ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT "pendente"');
      }
      
      // Adicionar order_status se não existir
      if (!orderColumnNames.includes('order_status')) {
        console.log('➕ Adicionando coluna order_status na tabela orders...');
        await runCommand('ALTER TABLE orders ADD COLUMN order_status TEXT DEFAULT "novo"');
      }
      
      // Adicionar admin_notes se não existir
      if (!orderColumnNames.includes('admin_notes')) {
        console.log('➕ Adicionando coluna admin_notes na tabela orders...');
        await runCommand('ALTER TABLE orders ADD COLUMN admin_notes TEXT');
      }
      
      // Adicionar confirmed_by se não existir
      if (!orderColumnNames.includes('confirmed_by')) {
        console.log('➕ Adicionando coluna confirmed_by na tabela orders...');
        await runCommand('ALTER TABLE orders ADD COLUMN confirmed_by INTEGER');
      }
      
      // Adicionar confirmed_at se não existir
      if (!orderColumnNames.includes('confirmed_at')) {
        console.log('➕ Adicionando coluna confirmed_at na tabela orders...');
        await runCommand('ALTER TABLE orders ADD COLUMN confirmed_at DATETIME');
      }
      
      // Migrar dados do campo status antigo para order_status se necessário
      if (orderColumnNames.includes('status') && orderColumnNames.includes('order_status')) {
        console.log('🔄 Migrando dados do campo status para order_status...');
        await runCommand('UPDATE orders SET order_status = status WHERE order_status IS NULL OR order_status = "novo"');
      }
      
      console.log('✅ Tabela orders verificada e atualizada');
    } catch (error) {
      console.error('❌ Erro ao verificar tabela orders:', error);
    }

    // Atualizar produtos existentes para ter active = 1 se não tiverem
    try {
      const result = await runCommand(`
        UPDATE products 
        SET active = 1 
        WHERE active IS NULL OR active = 0
      `);
      if (result.changes > 0) {
        console.log(`✅ ${result.changes} produtos atualizados com active = 1`);
      }
    } catch (error) {
      console.log('⚠️ Erro ao atualizar produtos:', error.message);
    }

    // Atualizar categorias existentes para ter active = 1 se não tiverem
    try {
      const result = await runCommand(`
        UPDATE categories 
        SET active = 1 
        WHERE active IS NULL OR active = 0
      `);
      if (result.changes > 0) {
        console.log(`✅ ${result.changes} categorias atualizadas com active = 1`);
      }
    } catch (error) {
      console.log('⚠️ Erro ao atualizar categorias:', error.message);
    }

    console.log('✅ Verificação do banco concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  checkDatabase().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Erro:', error);
    process.exit(1);
  });
}

module.exports = { checkDatabase };
