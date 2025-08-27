// Configuração da API
export const API_BASE_URL = 'http://localhost:3000';

// Função para fazer requisições autenticadas
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('adminToken');

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });

    if (response.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
      return;
    }

    if (response.status === 403) {
      console.error('Acesso negado - verificar token de autenticação');
      return { error: 'Acesso negado', message: 'Você não tem permissão para acessar este recurso' };
    }

    return response;
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
};

// Funções específicas para cada tipo de requisição
export const api = {
  get: (endpoint) => apiRequest(endpoint),
  post: (endpoint, data) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  put: (endpoint, data) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (endpoint) => apiRequest(endpoint, {
    method: 'DELETE',
  }),
};
