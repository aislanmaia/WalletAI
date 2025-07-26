import { useState, useEffect } from 'react';
import { TrendingUp, User, AlertCircle } from 'lucide-react';
import { SummaryCards } from '@/components/SummaryCards';
import { ExpensePieChart } from '@/components/charts/ExpensePieChart';
import { MonthlyLineChart } from '@/components/charts/MonthlyLineChart';
import { IncomeExpenseBarChart } from '@/components/charts/IncomeExpenseBarChart';
import { RecentTransactions } from '@/components/RecentTransactions';
import { ExpandableChatInterface } from '@/components/ExpandableChatInterface';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useAIChat } from '@/hooks/useAIChat';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const [chartsLoading, setChartsLoading] = useState(true);
  
  const { 
    summary, 
    expenseCategories, 
    monthlyData, 
    recentTransactions, 
    loading,
    error,
    addTransaction,
    refreshData
  } = useFinancialData();
  
  const { messages, isProcessing, processUserMessage } = useAIChat();

  // Simulate chart loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setChartsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSendChatMessage = async (message: string) => {
    await processUserMessage(message, addTransaction);
    // Recarregar dados após processar mensagem
    await refreshData();
  };

  const handleRetry = () => {
    refreshData();
  };

  // Dados de fallback para quando a API não estiver disponível
  const fallbackData = {
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
        description: 'Supermercado',
        amount: -127.50,
        category: 'Alimentação',
        date: new Date(),
        type: 'expense' as const,
        icon: 'shopping-cart'
      },
      {
        id: '2',
        description: 'Salário',
        amount: 4500.00,
        category: 'Trabalho',
        date: new Date(Date.now() - 86400000),
        type: 'income' as const,
        icon: 'building'
      },
      {
        id: '3',
        description: 'Combustível',
        amount: -80.00,
        category: 'Transporte',
        date: new Date(Date.now() - 172800000),
        type: 'expense' as const,
        icon: 'gas-pump'
      }
    ]
  };

  // Usar dados de fallback se estiver carregando ou se houver erro
  const displayData = loading || error ? fallbackData : {
    summary,
    expenseCategories,
    monthlyData,
    recentTransactions
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <TrendingUp className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">FinanceAI</h1>
                <p className="text-sm text-gray-500">Assistente Financeiro Inteligente</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {error && (
                <div className="flex items-center space-x-2 bg-red-100 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-700">Erro de conexão</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRetry}
                    className="text-red-600 hover:text-red-700"
                  >
                    Tentar novamente
                  </Button>
                </div>
              )}
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">João Silva</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-700">Carregando dados financeiros...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">
                Modo offline - Dados de demonstração sendo exibidos
              </span>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <SummaryCards summary={displayData.summary} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ExpensePieChart data={displayData.expenseCategories} isLoading={chartsLoading} />
          <MonthlyLineChart data={displayData.monthlyData} isLoading={chartsLoading} />
          <IncomeExpenseBarChart data={displayData.monthlyData} isLoading={chartsLoading} />
          <RecentTransactions transactions={displayData.recentTransactions} />
        </div>
      </main>

      {/* Expandable Chat Interface */}
      <ExpandableChatInterface
        messages={messages}
        onSendMessage={handleSendChatMessage}
        isProcessing={isProcessing}
      />
    </div>
  );
}
