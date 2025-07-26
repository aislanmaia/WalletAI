import { useState, useEffect } from 'react';
import { TrendingUp, User, AlertCircle, Sparkles } from 'lucide-react';
import { SummaryCards } from '@/components/SummaryCards';
import { ExpensePieChart } from '@/components/charts/ExpensePieChart';
import { MonthlyLineChart } from '@/components/charts/MonthlyLineChart';
import { IncomeExpenseBarChart } from '@/components/charts/IncomeExpenseBarChart';
import { RecentTransactions } from '@/components/RecentTransactions';
import { ExpandableChatInterface } from '@/components/ExpandableChatInterface';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useAIChat } from '@/hooks/useAIChat';
import { Button } from '@/components/ui/button';
import { isDemoMode } from '@/config/demo';

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
    refreshData,
    isDemoMode: isDemo
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
              {/* Demo Mode Badge */}
              {isDemo && (
                <div className="flex items-center space-x-2 bg-purple-100 rounded-lg px-3 py-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Modo Demo</span>
                </div>
              )}
              
              {error && !isDemo && (
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
        {loading && !isDemo && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-700">Carregando dados financeiros...</span>
            </div>
          </div>
        )}

        {/* Demo Mode Info */}
        {isDemo && (
          <div className="mb-8 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-700">
                Modo demonstração ativo - Dados simulados sendo exibidos
              </span>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <SummaryCards summary={summary} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ExpensePieChart data={expenseCategories} isLoading={chartsLoading} />
          <MonthlyLineChart data={monthlyData} isLoading={chartsLoading} />
          <IncomeExpenseBarChart data={monthlyData} isLoading={chartsLoading} />
          <RecentTransactions transactions={recentTransactions} />
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
