// Configuração das APIs externas
export const API_CONFIG = {
  // URL base da API backend
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  
  // Endpoints da API
  ENDPOINTS: {
    // Autenticação
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
    },
    
    // Usuários
    USERS: {
      PROFILE: '/api/users/profile',
      UPDATE: '/api/users/update',
    },
    
    // Transações
    TRANSACTIONS: {
      LIST: '/api/transactions',
      CREATE: '/api/transactions',
      UPDATE: '/api/transactions/:id',
      DELETE: '/api/transactions/:id',
      SUMMARY: '/api/transactions/summary',
    },
    
    // Categorias
    CATEGORIES: {
      LIST: '/api/categories',
      CREATE: '/api/categories',
      UPDATE: '/api/categories/:id',
      DELETE: '/api/categories/:id',
    },
    
    // Metas financeiras
    GOALS: {
      LIST: '/api/goals',
      CREATE: '/api/goals',
      UPDATE: '/api/goals/:id',
      DELETE: '/api/goals/:id',
    },
    
    // Relatórios
    REPORTS: {
      MONTHLY: '/api/reports/monthly',
      CATEGORIES: '/api/reports/categories',
      TRENDS: '/api/reports/trends',
    },
    
    // Chat IA
    AI: {
      CHAT: '/api/ai/chat',
      PROCESS_TRANSACTION: '/api/ai/process-transaction',
    },
  },
  
  // Configurações de requisição
  REQUEST_CONFIG: {
    TIMEOUT: 10000, // 10 segundos
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 segundo
  },
};

// Função para construir URLs completas
export const buildApiUrl = (endpoint: string, params?: Record<string, string>): string => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });
  }
  
  return url;
};

// Headers padrão para requisições
export const getDefaultHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Adicionar token de autenticação se disponível
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}; 