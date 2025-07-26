// Configuração do modo demo
export const DEMO_CONFIG = {
  // Flag para ativar modo demo
  ENABLE_DEMO: import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_API_BASE_URL,
  
  // Dados de demonstração realistas
  DEMO_DATA: {
    summary: {
      balance: 12450.00,
      income: 8200.00,
      expenses: 5750.00,
      savingsGoal: 2500.00,
      savingsProgress: 78
    },
    
    expenseCategories: [
      { name: 'Alimentação', amount: 1250, color: '#1E40AF' },
      { name: 'Transporte', amount: 800, color: '#059669' },
      { name: 'Moradia', amount: 2100, color: '#DC2626' },
      { name: 'Lazer', amount: 450, color: '#D97706' },
      { name: 'Saúde', amount: 680, color: '#0284C7' },
      { name: 'Outros', amount: 470, color: '#7C3AED' }
    ],
    
    monthlyData: [
      { month: 'Jan', income: 7800, expenses: 5200 },
      { month: 'Fev', income: 8200, expenses: 5800 },
      { month: 'Mar', income: 7900, expenses: 5400 },
      { month: 'Abr', income: 8500, expenses: 6100 },
      { month: 'Mai', income: 8100, expenses: 5900 },
      { month: 'Jun', income: 8200, expenses: 5750 }
    ],
    
    recentTransactions: [
      {
        id: '1',
        description: 'Supermercado Extra',
        amount: -127.50,
        category: 'Alimentação',
        date: new Date(),
        type: 'expense' as const,
        icon: 'shopping-cart'
      },
      {
        id: '2',
        description: 'Salário - Empresa XYZ',
        amount: 4500.00,
        category: 'Trabalho',
        date: new Date(Date.now() - 86400000),
        type: 'income' as const,
        icon: 'building'
      },
      {
        id: '3',
        description: 'Combustível - Posto Shell',
        amount: -80.00,
        category: 'Transporte',
        date: new Date(Date.now() - 172800000),
        type: 'expense' as const,
        icon: 'gas-pump'
      },
      {
        id: '4',
        description: 'Netflix - Assinatura',
        amount: -39.90,
        category: 'Lazer',
        date: new Date(Date.now() - 259200000),
        type: 'expense' as const,
        icon: 'tv'
      },
      {
        id: '5',
        description: 'Farmácia - Medicamentos',
        amount: -45.75,
        category: 'Saúde',
        date: new Date(Date.now() - 345600000),
        type: 'expense' as const,
        icon: 'heart'
      }
    ]
  }
};

// Função para verificar se está em modo demo
export const isDemoMode = (): boolean => {
  return DEMO_CONFIG.ENABLE_DEMO;
};

// Função para obter dados de demo
export const getDemoData = () => {
  return DEMO_CONFIG.DEMO_DATA;
}; 