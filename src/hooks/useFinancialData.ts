import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listTransactions } from '@/api/transactions';
import { getDemoData } from '../config/demo';
import { useAuth } from './useAuth';
import { useOrganization } from './useOrganization';
import { processTransactionAnalytics } from '@/lib/analytics';
import type { Transaction as ApiTransaction } from '@/types/api';

export interface FinancialSummary {
  balance: number;
  income: number;
  expenses: number;
  savingsGoal?: number;
  savingsProgress?: number;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
  type: 'income' | 'expense';
  icon: string;
}

export interface ExpenseCategory {
  name: string;
  amount: number;
  color: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

export interface MoneyFlowNode {
  id: string;
  name: string;
  category: 'income' | 'expense' | 'balance';
  type?: 'regular' | 'goal' | 'investment' | 'debt';
}

export interface MoneyFlowLink {
  source: string;
  target: string;
  value: number;
}

export interface MoneyFlow {
  nodes: MoneyFlowNode[];
  links: MoneyFlowLink[];
}

export interface WeeklyExpenseHeatmap {
  categories: string[];
  days: string[];
  data: number[][];
}

export interface DailyTransaction {
  category: string;
  amount: number;
  description: string;
}

export interface DailyTransactions {
  monday: DailyTransaction[];
  tuesday: DailyTransaction[];
  wednesday: DailyTransaction[];
  thursday: DailyTransaction[];
  friday: DailyTransaction[];
  saturday: DailyTransaction[];
  sunday: DailyTransaction[];
}

/**
 * Hook principal para dados financeiros
 * - Em modo demo: retorna dados mockados
 * - Em modo real: carrega transações do backend e processa analytics no frontend
 */
export function useFinancialData() {
  const { isDemoMode: isDemo } = useAuth();
  const { activeOrgId } = useOrganization();
  const demoData = getDemoData();

  // Estados para dados processados
  const [summary, setSummary] = useState<FinancialSummary>(demoData.summary);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(demoData.expenseCategories);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>(demoData.monthlyData);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(demoData.recentTransactions);
  const [moneyFlow, setMoneyFlow] = useState<MoneyFlow>(demoData.moneyFlow as MoneyFlow);
  const [weeklyExpenseHeatmap, setWeeklyExpenseHeatmap] = useState<WeeklyExpenseHeatmap>(demoData.weeklyExpenseHeatmap as WeeklyExpenseHeatmap);
  const [dailyTransactions, setDailyTransactions] = useState<DailyTransactions>(demoData.dailyTransactions as DailyTransactions);

  // Carregar transações do backend (apenas se não for demo E tiver organização ativa)
  const { data: backendTransactions, isLoading, error: queryError } = useQuery({
    queryKey: ['financial-data', activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return [];
      return await listTransactions({ organization_id: activeOrgId });
    },
    enabled: !isDemo && !!activeOrgId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Processar dados quando transações do backend mudarem
  useEffect(() => {
    if (isDemo) {
      // Modo demo: manter dados mockados
      return;
    }

    if (backendTransactions && backendTransactions.length > 0) {
      // Filtrar por organização ativa
      const orgTransactions = backendTransactions.filter(
        (t) => t.organization_id === activeOrgId
      );

      // Processar analytics
      const analytics = processTransactionAnalytics(orgTransactions);

      setSummary(analytics.summary);
      setMonthlyData(analytics.monthly);
      setExpenseCategories(analytics.categories);
      setMoneyFlow(analytics.moneyFlow);
      setWeeklyExpenseHeatmap(analytics.heatmap);

      // Converter transações para formato do componente
      const formattedTransactions: Transaction[] = orgTransactions
        .slice(0, 5)
        .map((t) => ({
          id: t.id.toString(),
          description: t.description,
          amount: t.type === 'income' ? t.value : -t.value,
          category: t.category,
          date: new Date(t.date),
          type: t.type,
          icon: t.type === 'income' ? 'building' : 'shopping-cart',
        }));

      setRecentTransactions(formattedTransactions);
    } else if (backendTransactions && backendTransactions.length === 0) {
      // Sem transações: definir valores zerados
      setSummary({ balance: 0, income: 0, expenses: 0 });
      setExpenseCategories([]);
      setMonthlyData([]);
      setRecentTransactions([]);
      setMoneyFlow({ nodes: [], links: [] });
      setWeeklyExpenseHeatmap({ categories: [], days: [], data: [] });
    }
  }, [backendTransactions, activeOrgId, isDemo]);

  const error = queryError ? String(queryError) : null;

  return {
    summary,
    expenseCategories,
    monthlyData,
    recentTransactions,
    moneyFlow,
    weeklyExpenseHeatmap,
    dailyTransactions,
    loading: isLoading,
    error,
    isDemoMode: isDemo,
  };
}
