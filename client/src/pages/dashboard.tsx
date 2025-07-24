import { useState, useEffect } from 'react';
import { TrendingUp, User } from 'lucide-react';
import { SummaryCards } from '@/components/SummaryCards';
import { ExpensePieChart } from '@/components/charts/ExpensePieChart';
import { MonthlyLineChart } from '@/components/charts/MonthlyLineChart';
import { IncomeExpenseBarChart } from '@/components/charts/IncomeExpenseBarChart';
import { RecentTransactions } from '@/components/RecentTransactions';
import { GlobalAIInput } from '@/components/GlobalAIInput';
import { ChatModal } from '@/components/ChatModal';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useAIChat } from '@/hooks/useAIChat';

export default function Dashboard() {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chartsLoading, setChartsLoading] = useState(true);
  
  const { 
    summary, 
    expenseCategories, 
    monthlyData, 
    recentTransactions, 
    addTransaction 
  } = useFinancialData();
  
  const { messages, isProcessing, processUserMessage } = useAIChat();

  // Simulate chart loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setChartsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleAISubmit = (message: string) => {
    processUserMessage(message, addTransaction);
  };

  const handleSendChatMessage = (message: string) => {
    processUserMessage(message, addTransaction);
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

      {/* Global AI Input */}
      <GlobalAIInput
        onSubmit={handleAISubmit}
        onOpenChat={() => setIsChatModalOpen(true)}
        onFocus={() => setIsChatModalOpen(true)}
        isChatOpen={isChatModalOpen}
      />

      {/* Chat Modal */}
      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        messages={messages}
        isProcessing={isProcessing}
      />
    </div>
  );
}
