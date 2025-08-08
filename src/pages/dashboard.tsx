import { useState, useEffect } from 'react';
import { TrendingUp, User, AlertCircle, Sparkles } from 'lucide-react';
import { SummaryCards } from '@/components/SummaryCards';
import { Suspense, lazy } from 'react';
const ExpensePieChart = lazy(() => import('@/components/charts/ExpensePieChart').then(m => ({ default: m.ExpensePieChart })));
const MonthlyLineChart = lazy(() => import('@/components/charts/MonthlyLineChart').then(m => ({ default: m.MonthlyLineChart })));
const IncomeExpenseBarChart = lazy(() => import('@/components/charts/IncomeExpenseBarChart').then(m => ({ default: m.IncomeExpenseBarChart })));
const MoneyFlowSankeyChart = lazy(() => import('@/components/charts/MoneyFlowSankeyChart').then(m => ({ default: m.MoneyFlowSankeyChart })));
const WeeklyExpenseHeatmapChart = lazy(() => import('@/components/charts/WeeklyExpenseHeatmap').then(m => ({ default: m.WeeklyExpenseHeatmapChart })));
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
    moneyFlow,
    weeklyExpenseHeatmap,
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 pb-32">
      {/* Header */}
      <header className="bg-white/70 supports-[backdrop-filter]:bg-white/50 backdrop-blur border-b border-gray-200 dark:bg-white/5 dark:supports-[backdrop-filter]:bg-white/[0.03] dark:border-white/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-sm">
                <TrendingUp className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">FinanceAI</h1>
                <p className="text-sm text-gray-500">Assistente Financeiro Inteligente</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Demo Mode Badge */}
              {isDemo && (
                <div className="flex items-center space-x-2 bg-purple-100/70 supports-[backdrop-filter]:bg-purple-100/50 backdrop-blur rounded-full px-3 py-1.5 ring-1 ring-purple-200">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Modo Demo</span>
                </div>
              )}
              
              {error && !isDemo && (
                <div className="flex items-center space-x-2 bg-red-100/70 supports-[backdrop-filter]:bg-red-100/50 backdrop-blur rounded-full px-3 py-1.5 ring-1 ring-red-200">
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
              
              <div className="flex items-center space-x-2 bg-gray-100/70 supports-[backdrop-filter]:bg-gray-100/50 backdrop-blur rounded-full px-4 py-2 ring-1 ring-gray-200">
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
          <div className="mb-8 p-4 bg-blue-50/70 supports-[backdrop-filter]:bg-blue-50/50 backdrop-blur border border-blue-200/80 rounded-xl">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-sm text-blue-700">Carregando dados financeiros...</span>
            </div>
          </div>
        )}

        {/* Demo Mode Info */}
        {isDemo && (
          <div className="mb-8 p-4 bg-purple-50/70 supports-[backdrop-filter]:bg-purple-50/50 backdrop-blur border border-purple-200/80 rounded-xl">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-700">
                Modo demonstração ativo - Dados simulados sendo exibidos
              </span>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <SummaryCards summary={summary} isLoading={loading && !isDemo} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Suspense fallback={<div className="h-[320px] rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 animate-pulse" />}> 
            <ExpensePieChart data={expenseCategories} isLoading={chartsLoading} />
          </Suspense>
          <Suspense fallback={<div className="h-[320px] rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 animate-pulse" />}> 
            <MonthlyLineChart data={monthlyData} isLoading={chartsLoading} />
          </Suspense>
          <Suspense fallback={<div className="h-[320px] rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 animate-pulse" />}> 
            <IncomeExpenseBarChart data={monthlyData} isLoading={chartsLoading} />
          </Suspense>
          <RecentTransactions transactions={recentTransactions} />
        </div>

        {/* Advanced Charts Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Análises Avançadas</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Suspense fallback={<div className="h-[360px] rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 animate-pulse" />}> 
              <MoneyFlowSankeyChart data={moneyFlow} isLoading={chartsLoading} />
            </Suspense>
            <Suspense fallback={<div className="h-[360px] rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 animate-pulse" />}> 
              <WeeklyExpenseHeatmapChart data={weeklyExpenseHeatmap} isLoading={chartsLoading} />
            </Suspense>
          </div>
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
