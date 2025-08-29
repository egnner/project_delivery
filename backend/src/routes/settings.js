const express = require('express');
const router = express.Router();
const { getOne } = require('../config/database');

// GET /api/settings - Buscar configurações públicas da loja
router.get('/', async (req, res) => {
  try {
    const settings = await getOne('SELECT * FROM store_settings LIMIT 1');
    
    if (settings) {
      // Parse JSON fields
      if (settings.opening_hours) {
        try {
          settings.opening_hours = JSON.parse(settings.opening_hours);
        } catch (e) {
          console.error('Erro ao fazer parse dos horários:', e);
          // Usar horários padrão se der erro
          settings.opening_hours = {
            monday: { open: '08:00', close: '22:00', closed: false },
            tuesday: { open: '08:00', close: '22:00', closed: false },
            wednesday: { open: '08:00', close: '22:00', closed: false },
            thursday: { open: '08:00', close: '22:00', closed: false },
            friday: { open: '08:00', close: '23:00', closed: false },
            saturday: { open: '09:00', close: '23:00', closed: false },
            sunday: { open: '10:00', close: '22:00', closed: false }
          };
        }
      }

      // Parse payment methods
      if (settings.payment_methods) {
        try {
          settings.payment_methods = JSON.parse(settings.payment_methods);
        } catch (e) {
          console.error('Erro ao fazer parse dos métodos de pagamento:', e);
          settings.payment_methods = ['dinheiro', 'pix', 'cartao'];
        }
      } else {
        settings.payment_methods = ['dinheiro', 'pix', 'cartao'];
      }
      
      res.json({ success: true, data: settings });
    } else {
      // Retornar configurações padrão se não existirem
      const defaultSettings = {
        store_name: 'Delivery Express',
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
        min_order_amount: 15.00,
        delivery_fee: 5.00,
        free_delivery_threshold: 50.00,
        show_phone: true,
        show_email: true,
        show_address: true,
        payment_methods: ['dinheiro', 'pix', 'cartao'],
        payment_pix_enabled: true,
        payment_cartao_enabled: true,
        payment_dinheiro_enabled: true,
        payment_gateway_enabled: false,
        payment_gateway_provider: null,
        payment_gateway_credentials: null
      };
      
      res.json({ success: true, data: defaultSettings });
    }
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

module.exports = router;
