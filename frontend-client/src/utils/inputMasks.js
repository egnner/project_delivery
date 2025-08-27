// Utilitários para máscaras de input

/**
 * Aplica máscara de telefone brasileiro (XX) XXXXX-XXXX
 * @param {string} value - Valor do telefone
 * @returns {string} Telefone formatado com máscara
 */
export const phoneMask = (value) => {
  if (!value) return '';
  
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara baseado no tamanho
  if (numbers.length <= 2) {
    return `(${numbers}`;
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  } else {
    // Limita a 11 dígitos
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
};

/**
 * Remove a máscara do telefone, retornando apenas os números
 * @param {string} maskedPhone - Telefone com máscara
 * @returns {string} Apenas os números do telefone
 */
export const removePhoneMask = (maskedPhone) => {
  if (!maskedPhone) return '';
  return maskedPhone.replace(/\D/g, '');
};

/**
 * Valida se o telefone tem formato válido (10 ou 11 dígitos)
 * @param {string} phone - Telefone (com ou sem máscara)
 * @returns {boolean} True se válido, false caso contrário
 */
export const isValidPhone = (phone) => {
  const numbers = phone.replace(/\D/g, '');
  return numbers.length === 10 || numbers.length === 11;
};
