// Configuração de timezone para o servidor
process.env.TZ = 'America/Sao_Paulo';

// Função para configurar timezone global
const configureTimezone = () => {
  try {
    // Configurar timezone para o processo Node.js
    process.env.TZ = 'America/Sao_Paulo';
    
    // Verificar se a configuração foi aplicada
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset();
    const expectedOffset = 180; // GMT-3 = 180 minutos
    
    console.log(`🌍 Configurando timezone para Brasil (GMT-3)...`);
    console.log(`📅 Data atual: ${now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
    console.log(`⏰ Offset do timezone: ${timezoneOffset} minutos`);
    
    if (Math.abs(timezoneOffset - expectedOffset) <= 60) {
      console.log('✅ Timezone configurado com sucesso para Brasil (GMT-3)');
    } else {
      console.log('⚠️ Timezone pode não estar configurado corretamente');
    }
    
  } catch (error) {
    console.error('❌ Erro ao configurar timezone:', error);
  }
};

module.exports = { configureTimezone };
