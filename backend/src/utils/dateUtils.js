// Utilitários para manipulação de datas com timezone GMT-3 (Brasil)
const moment = require('moment-timezone');

// Configurar timezone padrão para Brasil
const TIMEZONE = 'America/Sao_Paulo';

/**
 * Converte uma data UTC para GMT-3 (Brasil)
 * @param {string|Date} date - Data em UTC ou objeto Date
 * @returns {string} Data formatada em GMT-3
 */
const toBrazilTime = (date) => {
  if (!date) return null;
  
  return moment(date)
    .tz(TIMEZONE)
    .format('YYYY-MM-DD HH:mm:ss');
};

/**
 * Converte uma data UTC para data local brasileira (YYYY-MM-DD)
 * @param {string|Date} date - Data em UTC ou objeto Date
 * @returns {string} Data local em formato YYYY-MM-DD
 */
const toBrazilDate = (date) => {
  if (!date) return null;
  
  return moment(date)
    .tz(TIMEZONE)
    .format('YYYY-MM-DD');
};

/**
 * Obtém a data atual em GMT-3
 * @returns {string} Data atual em formato YYYY-MM-DD HH:mm:ss
 */
const getCurrentBrazilTime = () => {
  return moment()
    .tz(TIMEZONE)
    .format('YYYY-MM-DD HH:mm:ss');
};

/**
 * Obtém apenas a data atual em GMT-3
 * @returns {string} Data atual em formato YYYY-MM-DD
 */
const getCurrentBrazilDate = () => {
  return moment()
    .tz(TIMEZONE)
    .format('YYYY-MM-DD');
};

/**
 * Converte uma data brasileira para UTC para armazenamento no banco
 * @param {string} brazilDate - Data em formato brasileiro
 * @returns {string} Data em UTC
 */
const brazilDateToUTC = (brazilDate) => {
  if (!brazilDate) return null;
  
  return moment.tz(brazilDate, TIMEZONE)
    .utc()
    .format('YYYY-MM-DD HH:mm:ss');
};

/**
 * Formata uma data para exibição no frontend brasileiro
 * @param {string|Date} date - Data para formatar
 * @returns {string} Data formatada para exibição
 */
const formatForDisplay = (date) => {
  if (!date) return '';
  
  return moment(date)
    .tz(TIMEZONE)
    .format('DD/MM/YYYY HH:mm');
};

/**
 * Formata apenas a data para exibição
 * @param {string|Date} date - Data para formatar
 * @returns {string} Data formatada para exibição
 */
const formatDateForDisplay = (date) => {
  if (!date) return '';
  
  return moment(date)
    .tz(TIMEZONE)
    .format('DD/MM/YYYY');
};

/**
 * Formata apenas o horário para exibição
 * @param {string|Date} date - Data para formatar
 * @returns {string} Horário formatado para exibição
 */
const formatTimeForDisplay = (date) => {
  if (!date) return '';
  
  return moment(date)
    .tz(TIMEZONE)
    .format('HH:mm');
};

module.exports = {
  TIMEZONE,
  toBrazilTime,
  toBrazilDate,
  getCurrentBrazilTime,
  getCurrentBrazilDate,
  brazilDateToUTC,
  formatForDisplay,
  formatDateForDisplay,
  formatTimeForDisplay
};
