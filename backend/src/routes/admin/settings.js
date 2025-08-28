const express = require('express');
const router = express.Router();
const { runQuery, runCommand, getOne } = require('../../config/database');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');
const { getCurrentBrazilTime } = require('../../utils/dateUtils');

// Aplicar middleware de autenticação e admin em todas as rotas
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/settings - Buscar configurações
router.get('/', async (req, res) => {
  try {
    const settings = await getOne('SELECT * FROM store_settings LIMIT 1');
    
    if (settings) {
      // Parse JSON fields
      if (settings.opening_hours) {
        settings.opening_hours = JSON.parse(settings.opening_hours);
      }
      res.json({ success: true, data: settings });
    } else {
      // Retornar configurações padrão se não existirem
      const defaultSettings = {
        store_name: 'Delivery Express',
        store_logo: '',
        contact_phone: '(11) 99999-9999',
        contact_email: 'contato@delivery.com',
        address: 'Rua das Flores',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01234-567',
        opening_hours: {
          monday: { open: '08:00', close: '22:00', closed: false },
          tuesday: { open: '08:00', close: '22:00', closed: false },
          wednesday: { open: '08:00', close: '22:00', closed: false },
          thursday: { open: '08:00', close: '22:00', closed: false },
          friday: { open: '08:00', close: '23:00', closed: false },
          saturday: { open: '09:00', close: '23:00', closed: false },
          sunday: { open: '10:00', close: '22:00', closed: false }
        },
        delivery_info: 'Entregamos em toda a região com prazo médio de 30-45 minutos.',
        delivery_enabled: true,
        pickup_enabled: true,
        min_order_amount: 15.00,
        delivery_fee: 5.00,
        free_delivery_threshold: 50.00,
        show_phone: true,
        show_email: true,
        show_address: true
      };
      
      res.json({ success: true, data: defaultSettings });
    }
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// PUT /api/admin/settings - Atualizar configurações
router.put('/', async (req, res) => {
  try {
    const {
      store_name,
      store_logo,
      contact_phone,
      contact_email,
      address,
      number,
      neighborhood,
      city,
      state,
      zip_code,
      opening_hours,
      delivery_info,
      delivery_enabled,
      pickup_enabled,
      min_order_amount,
      delivery_fee,
      free_delivery_threshold,
      show_phone,
      show_email,
      show_address
    } = req.body;

    // Verificar se já existem configurações
    const existing = await getOne('SELECT id FROM store_settings LIMIT 1');
    
    if (existing) {
      // Atualizar configurações existentes
      await runCommand(`
        UPDATE store_settings SET
          store_name = ?, store_logo = ?, contact_phone = ?, contact_email = ?, address = ?, number = ?,
          neighborhood = ?, city = ?, state = ?, zip_code = ?, opening_hours = ?,
          delivery_info = ?, delivery_enabled = ?, pickup_enabled = ?, min_order_amount = ?, delivery_fee = ?,
          free_delivery_threshold = ?, show_phone = ?, show_email = ?, show_address = ?, updated_at = ?
        WHERE id = ?
      `, [
        store_name, store_logo, contact_phone, contact_email, address, number,
        neighborhood, city, state, zip_code, JSON.stringify(opening_hours),
        delivery_info, delivery_enabled, pickup_enabled, min_order_amount, delivery_fee,
        free_delivery_threshold, show_phone, show_email, show_address, getCurrentBrazilTime(), existing.id
      ]);
    } else {
      // Criar novas configurações
      await runCommand(`
        INSERT INTO store_settings (
          store_name, store_logo, contact_phone, contact_email, address, number,
          neighborhood, city, state, zip_code, opening_hours,
          delivery_info, delivery_enabled, pickup_enabled, min_order_amount, delivery_fee,
          free_delivery_threshold, show_phone, show_email, show_address, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        store_name, store_logo, contact_phone, contact_email, address, number,
        neighborhood, city, state, zip_code, JSON.stringify(opening_hours),
        delivery_info, delivery_enabled, pickup_enabled, min_order_amount, delivery_fee,
        free_delivery_threshold, show_phone, show_email, show_address, getCurrentBrazilTime(), getCurrentBrazilTime()
      ]);
    }

    res.json({ success: true, message: 'Configurações atualizadas com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

module.exports = router;