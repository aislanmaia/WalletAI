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
    
    // Dados para gráfico Sankey (fluxo de dinheiro)
    moneyFlow: {
      nodes: [
        { id: 'income', name: 'Receitas', category: 'source' },
        { id: 'salary', name: 'Salário', category: 'income' },
        { id: 'freelance', name: 'Freelance', category: 'income' },
        { id: 'investments', name: 'Investimentos', category: 'income' },
        { id: 'expenses', name: 'Despesas', category: 'sink' },
        { id: 'savings', name: 'Poupança', category: 'sink' },
        { id: 'investments_out', name: 'Aplicações', category: 'sink' },
        { id: 'food', name: 'Alimentação', category: 'expense' },
        { id: 'transport', name: 'Transporte', category: 'expense' },
        { id: 'housing', name: 'Moradia', category: 'expense' },
        { id: 'leisure', name: 'Lazer', category: 'expense' },
        { id: 'health', name: 'Saúde', category: 'expense' },
        { id: 'others', name: 'Outros', category: 'expense' }
      ],
      links: [
        // Receitas → Tipos de Receita (total: 8200)
        { source: 'income', target: 'salary', value: 6500 },
        { source: 'income', target: 'freelance', value: 1200 },
        { source: 'income', target: 'investments', value: 500 },
        
        // Tipos de Receita → Despesas/Poupança/Aplicações (total: 8200)
        { source: 'salary', target: 'expenses', value: 5200 },
        { source: 'salary', target: 'savings', value: 800 },
        { source: 'salary', target: 'investments_out', value: 500 },
        { source: 'freelance', target: 'expenses', value: 400 },
        { source: 'freelance', target: 'savings', value: 800 },
        { source: 'investments', target: 'savings', value: 500 },
        
        // Despesas → Categorias (total: 5600)
        { source: 'expenses', target: 'food', value: 1250 },
        { source: 'expenses', target: 'transport', value: 800 },
        { source: 'expenses', target: 'housing', value: 2100 },
        { source: 'expenses', target: 'leisure', value: 450 },
        { source: 'expenses', target: 'health', value: 680 },
        { source: 'expenses', target: 'others', value: 320 }
      ]
    },
    
    // Dados para heatmap de gastos por dia da semana
    weeklyExpenseHeatmap: {
      categories: ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Outros'],
      days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'],
      data: [
        // Segunda a Domingo, por categoria
        [45, 120, 0, 0, 25, 15],    // Segunda
        [38, 95, 0, 0, 0, 12],      // Terça
        [52, 110, 0, 0, 35, 18],    // Quarta
        [41, 105, 0, 0, 0, 22],     // Quinta
        [67, 125, 0, 85, 0, 28],    // Sexta
        [89, 75, 0, 156, 0, 35],    // Sábado
        [78, 45, 0, 98, 0, 25]      // Domingo
      ]
    },
    
    // Dados detalhados de transações por dia da semana
    dailyTransactions: {
      monday: [
        { category: 'Alimentação', amount: 45, description: 'Café da manhã' },
        { category: 'Transporte', amount: 120, description: 'Uber para trabalho' },
        { category: 'Saúde', amount: 25, description: 'Farmácia' },
        { category: 'Outros', amount: 15, description: 'Papelaria' }
      ],
      tuesday: [
        { category: 'Alimentação', amount: 38, description: 'Almoço' },
        { category: 'Transporte', amount: 95, description: 'Metrô' },
        { category: 'Outros', amount: 12, description: 'Impressões' }
      ],
      wednesday: [
        { category: 'Alimentação', amount: 52, description: 'Jantar' },
        { category: 'Transporte', amount: 110, description: 'Uber' },
        { category: 'Saúde', amount: 35, description: 'Consulta médica' },
        { category: 'Outros', amount: 18, description: 'Livros' }
      ],
      thursday: [
        { category: 'Alimentação', amount: 41, description: 'Almoço' },
        { category: 'Transporte', amount: 105, description: 'Metrô' },
        { category: 'Outros', amount: 22, description: 'Presente' }
      ],
      friday: [
        { category: 'Alimentação', amount: 67, description: 'Jantar fora' },
        { category: 'Transporte', amount: 125, description: 'Uber' },
        { category: 'Lazer', amount: 85, description: 'Cinema' },
        { category: 'Outros', amount: 28, description: 'Shopping' }
      ],
      saturday: [
        { category: 'Alimentação', amount: 89, description: 'Restaurante' },
        { category: 'Transporte', amount: 75, description: 'Metrô' },
        { category: 'Lazer', amount: 156, description: 'Show' },
        { category: 'Outros', amount: 35, description: 'Compras' }
      ],
      sunday: [
        { category: 'Alimentação', amount: 78, description: 'Almoço família' },
        { category: 'Transporte', amount: 45, description: 'Ônibus' },
        { category: 'Lazer', amount: 98, description: 'Parque' },
        { category: 'Outros', amount: 25, description: 'Sobremesa' }
      ]
    },
    
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