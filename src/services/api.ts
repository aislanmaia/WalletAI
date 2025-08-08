import { API_CONFIG, buildApiUrl, getDefaultHeaders } from '../config/api';

// Tipos de resposta da API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Classe para gerenciar requisições HTTP
class ApiService {
  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...getDefaultHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // Métodos para transações
  async getTransactions() {
    return this.request(buildApiUrl(API_CONFIG.ENDPOINTS.TRANSACTIONS.LIST));
  }

  async createTransaction(transaction: any) {
    return this.request(buildApiUrl(API_CONFIG.ENDPOINTS.TRANSACTIONS.CREATE), {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  async updateTransaction(id: string, transaction: any) {
    return this.request(
      buildApiUrl(API_CONFIG.ENDPOINTS.TRANSACTIONS.UPDATE, { id }),
      {
        method: 'PUT',
        body: JSON.stringify(transaction),
      }
    );
  }

  async deleteTransaction(id: string) {
    return this.request(
      buildApiUrl(API_CONFIG.ENDPOINTS.TRANSACTIONS.DELETE, { id }),
      {
        method: 'DELETE',
      }
    );
  }

  async getTransactionSummary() {
    return this.request(buildApiUrl(API_CONFIG.ENDPOINTS.TRANSACTIONS.SUMMARY));
  }

  // Métodos para categorias
  async getCategories() {
    return this.request(buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES.LIST));
  }

  async createCategory(category: any) {
    return this.request(buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES.CREATE), {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  // Métodos para metas
  async getGoals() {
    return this.request(buildApiUrl(API_CONFIG.ENDPOINTS.GOALS.LIST));
  }

  async createGoal(goal: any) {
    return this.request(buildApiUrl(API_CONFIG.ENDPOINTS.GOALS.CREATE), {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  }

  // Métodos para relatórios
  async getMonthlyReport() {
    return this.request(buildApiUrl(API_CONFIG.ENDPOINTS.REPORTS.MONTHLY));
  }

  async getCategoriesReport() {
    return this.request(buildApiUrl(API_CONFIG.ENDPOINTS.REPORTS.CATEGORIES));
  }

  // Métodos para novos gráficos
  async getMoneyFlow() {
    return this.request(buildApiUrl(API_CONFIG.ENDPOINTS.REPORTS.MONEY_FLOW));
  }

  async getWeeklyHeatmap() {
    return this.request(buildApiUrl(API_CONFIG.ENDPOINTS.REPORTS.WEEKLY_HEATMAP));
  }

  async getDailyTransactions() {
    return this.request(buildApiUrl(API_CONFIG.ENDPOINTS.REPORTS.DAILY_TRANSACTIONS));
  }

  // Métodos para IA
  async sendChatMessage(message: string, sessionId?: string) {
    return this.request(buildApiUrl(API_CONFIG.ENDPOINTS.AI.CHAT), {
      method: 'POST',
      body: JSON.stringify({ message, session_id: sessionId }),
    });
  }

  async processTransactionWithAI(transactionData: any) {
    return this.request(buildApiUrl(API_CONFIG.ENDPOINTS.AI.PROCESS_TRANSACTION), {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  // Métodos de autenticação
  async login(credentials: { username: string; password: string }) {
    return this.request(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN), {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: { username: string; password: string; email?: string }) {
    return this.request(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER), {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGOUT), {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.request(buildApiUrl(API_CONFIG.ENDPOINTS.USERS.PROFILE));
  }
}

// Instância singleton do serviço
export const apiService = new ApiService(); 