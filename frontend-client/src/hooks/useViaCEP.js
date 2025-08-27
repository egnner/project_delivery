import { useState } from 'react';

export const useViaCEP = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchCEP = async (cep) => {
    // Limpar CEP (remover caracteres especiais)
    const cleanCEP = cep.replace(/\D/g, '');
    
    if (cleanCEP.length !== 8) {
      setError('CEP deve ter 8 dígitos');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();

      if (data.erro) {
        setError('CEP não encontrado');
        return null;
      }

      return {
        cep: data.cep,
        logradouro: data.logradouro,
        complemento: data.complemento,
        bairro: data.bairro,
        localidade: data.localidade,
        uf: data.uf,
        estado: data.estado,
        ddd: data.ddd
      };
    } catch (error) {
      setError('Erro ao buscar CEP. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    searchCEP,
    loading,
    error,
    clearError
  };
};
