import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { isDemoMode, getDemoData } from '../config/demo';

export interface FinancialSummary {
  balance: number;
  income: number;
  expenses: number;
  savingsGoal: number;
  savingsProgress: number;
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

export function useFinancialData() {
  const demoData = getDemoData();
  
  const [summary, setSummary] = useState<FinancialSummary>(demoData.summary);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(demoData.expenseCategories);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>(demoData.monthlyData);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(demoData.recentTransactions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados iniciais apenas se não estiver em modo demo
  useEffect(() => {
    if (!isDemoMode()) {
      loadFinancialData();
    }
  }, []);

  const loadFinancialData = async () => {
    if (isDemoMode()) {
      // Em modo demo, sempre usar dados demonstrativos
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Carregar resumo financeiro
      const summaryResponse = await apiService.getTransactionSummary();
      if (summaryResponse.success && summaryResponse.data) {
        setSummary(summaryResponse.data as FinancialSummary);
      }

      // Carregar transações recentes
      const transactionsResponse = await apiService.getTransactions();
      if (transactionsResponse.success && transactionsResponse.data) {
        const transactions = transactionsResponse.data as Transaction[];
        setRecentTransactions(transactions.slice(0, 5));
      }

      // Carregar dados mensais
      const monthlyResponse = await apiService.getMonthlyReport();
      if (monthlyResponse.success && monthlyResponse.data) {
        setMonthlyData(monthlyResponse.data as MonthlyData[]);
      }

      // Carregar categorias de despesas
      const categoriesResponse = await apiService.getCategoriesReport();
      if (categoriesResponse.success && categoriesResponse.data) {
        setExpenseCategories(categoriesResponse.data as ExpenseCategory[]);
      }

    } catch (err) {
      setError('Erro ao carregar dados financeiros');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date'>) => {
    if (isDemoMode()) {
      // Em modo demo, simular adição de transação
      const newTransaction: Transaction = {
        ...transaction,
        id: Date.now().toString(),
        date: new Date()
      };
      
      setRecentTransactions(prev => [newTransaction, ...prev.slice(0, 4)]);
      
      // Atualizar resumo
      setSummary(prev => ({
        ...prev,
        balance: prev.balance + transaction.amount,
        income: transaction.type === 'income' ? prev.income + transaction.amount : prev.income,
        expenses: transaction.type === 'expense' ? prev.expenses + Math.abs(transaction.amount) : prev.expenses
      }));
      
      return true;
    }

    try {
      const response = await apiService.createTransaction({
        ...transaction,
        date: new Date().toISOString()
      });

      if (response.success) {
        await loadFinancialData();
        return true;
      } else {
        setError('Erro ao adicionar transação');
        return false;
      }
    } catch (err) {
      setError('Erro ao adicionar transação');
      console.error('Erro ao adicionar transação:', err);
      return false;
    }
  };

  const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
    if (isDemoMode()) {
      // Em modo demo, simular atualização
      setRecentTransactions(prev => 
        prev.map(t => t.id === id ? { ...t, ...transaction } : t)
      );
      return true;
    }

    try {
      const response = await apiService.updateTransaction(id, transaction);
      
      if (response.success) {
        await loadFinancialData();
        return true;
      } else {
        setError('Erro ao atualizar transação');
        return false;
      }
    } catch (err) {
      setError('Erro ao atualizar transação');
      console.error('Erro ao atualizar transação:', err);
      return false;
    }
  };

  const deleteTransaction = async (id: string) => {
    if (isDemoMode()) {
      // Em modo demo, simular remoção
      setRecentTransactions(prev => prev.filter(t => t.id !== id));
      return true;
    }

    try {
      const response = await apiService.deleteTransaction(id);
      
      if (response.success) {
        await loadFinancialData();
        return true;
      } else {
        setError('Erro ao deletar transação');
        return false;
      }
    } catch (err) {
      setError('Erro ao deletar transação');
      console.error('Erro ao deletar transação:', err);
      return false;
    }
  };

  return {
    summary,
    expenseCategories,
    monthlyData,
    recentTransactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshData: loadFinancialData,
    isDemoMode: isDemoMode()
  };
}
