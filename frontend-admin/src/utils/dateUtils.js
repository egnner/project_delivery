// Utilitários para manipulação de datas com timezone GMT-3 (Brasil)

/**
 * Converte uma data UTC para data local brasileira
 * @param {string|Date} date - Data em UTC ou objeto Date
 * @returns {string} Data formatada em formato brasileiro
 */
export const toBrazilTime = (date) => {
  if (!date) return '';
  
  return new Date(date).toLocaleString('pt-BR', { 
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Converte uma data UTC para data local brasileira (apenas data)
 * @param {string|Date} date - Data em UTC ou objeto Date
 * @returns {string} Data formatada em formato brasileiro (DD/MM/YYYY)
 */
export const toBrazilDate = (date) => {
  if (!date) return '';
  
  return new Date(date).toLocaleDateString('pt-BR', { 
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Obtém a data atual em GMT-3
 * @returns {string} Data atual em formato YYYY-MM-DD
 */
export const getCurrentBrazilDate = () => {
  const now = new Date();
  return now.toLocaleDateString('pt-BR', { 
    timeZone: 'America/Sao_Paulo' 
  }).split('/').reverse().join('-');
};

/**
 * Obtém o horário atual em GMT-3
 * @returns {string} Horário atual em formato HH:MM:SS
 */
export const getCurrentBrazilTime = () => {
  const now = new Date();
  return now.toLocaleTimeString('pt-BR', { 
    timeZone: 'America/Sao_Paulo',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * Formata uma data para exibição no frontend brasileiro
 * @param {string|Date} date - Data para formatar
 * @returns {string} Data formatada para exibição
 */
export const formatForDisplay = (date) => {
  if (!date) return '';
  
  return new Date(date).toLocaleString('pt-BR', { 
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formata apenas a data para exibição
 * @param {string|Date} date - Data para formatar
 * @returns {string} Data formatada para exibição
 */
export const formatDateForDisplay = (date) => {
  if (!date) return '';
  
  return new Date(date).toLocaleDateString('pt-BR', { 
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formata apenas o horário para exibição
 * @param {string|Date} date - Data para formatar
 * @returns {string} Horário formatado para exibição
 */
export const formatTimeForDisplay = (date) => {
  if (!date) return '';
  
  return new Date(date).toLocaleTimeString('pt-BR', { 
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit'
  });
};
