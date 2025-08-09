import { useState, useEffect } from 'react';
import { TrendingUp, User, AlertCircle, Sparkles } from 'lucide-react';
import { SummaryCards } from '@/components/SummaryCards';
import { Suspense, lazy } from 'react';
const ExpensePieChart = lazy(() => import('@/components/charts/ExpensePieChart').then(m => ({ default: m.ExpensePieChart })));
const IncomeExpenseBarChart = lazy(() => import('@/components/charts/IncomeExpenseBarChart').then(m => ({ default: m.IncomeExpenseBarChart })));
const WeekdayStackedBarChart = lazy(() => import('@/components/charts/WeekdayStackedBarChart').then(m => ({ default: m.WeekdayStackedBarChart })));
import { RecentTransactions } from '@/components/RecentTransactions';
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
    weeklyExpenseHeatmap,
    loading,
    error,
    addTransaction,
    refreshData,
    isDemoMode: isDemo
  } = useFinancialData();
  
  const { processUserMessage } = useAIChat();

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
    <div className="min-h-screen pb-32 bg-transparent">
      {/* Header removido: top bar agora no layout global */}

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

        {/* Gráficos principais (sem abas) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Suspense fallback={<div className="h-[320px] rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 animate-pulse" />}> 
            <ExpensePieChart data={expenseCategories} isLoading={chartsLoading} />
          </Suspense>
          <Suspense fallback={<div className="h-[320px] rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 animate-pulse" />}> 
            <IncomeExpenseBarChart data={monthlyData} isLoading={chartsLoading} />
          </Suspense>
        </div>

        {/* Gastos por Dia da Semana (stacked bars) + Transações Recentes */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Suspense fallback={<div className="h-[360px] rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 animate-pulse" />}> 
            <WeekdayStackedBarChart data={weeklyExpenseHeatmap} isLoading={chartsLoading} />
          </Suspense>
          <RecentTransactions transactions={recentTransactions} />
        </div>
      </main>

      {/* Chat movido para o Layout (Outlet) */}
    </div>
  );
}
