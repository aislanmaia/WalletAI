import { useState, useEffect } from 'react';

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
  const [summary, setSummary] = useState<FinancialSummary>({
    balance: 12450.00,
    income: 8200.00,
    expenses: 5750.00,
    savingsGoal: 2500.00,
    savingsProgress: 78
  });

  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([
    { name: 'Alimentação', amount: 1250, color: '#1E40AF' },
    { name: 'Transporte', amount: 800, color: '#059669' },
    { name: 'Moradia', amount: 2100, color: '#DC2626' },
    { name: 'Lazer', amount: 450, color: '#D97706' },
    { name: 'Saúde', amount: 680, color: '#0284C7' },
    { name: 'Outros', amount: 470, color: '#7C3AED' }
  ]);

  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([
    { month: 'Jan', income: 7800, expenses: 5200 },
    { month: 'Fev', income: 8200, expenses: 5800 },
    { month: 'Mar', income: 7900, expenses: 5400 },
    { month: 'Abr', income: 8500, expenses: 6100 },
    { month: 'Mai', income: 8100, expenses: 5900 },
    { month: 'Jun', income: 8200, expenses: 5750 }
  ]);

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([
    {
      id: '1',
      description: 'Supermercado',
      amount: -127.50,
      category: 'Alimentação',
      date: new Date(),
      type: 'expense',
      icon: 'shopping-cart'
    },
    {
      id: '2',
      description: 'Salário',
      amount: 4500.00,
      category: 'Trabalho',
      date: new Date(Date.now() - 86400000),
      type: 'income',
      icon: 'building'
    },
    {
      id: '3',
      description: 'Combustível',
      amount: -80.00,
      category: 'Transporte',
      date: new Date(Date.now() - 172800000),
      type: 'expense',
      icon: 'gas-pump'
    }
  ]);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date()
    };
    
    setRecentTransactions(prev => [newTransaction, ...prev.slice(0, 4)]);
    
    // Update summary
    setSummary(prev => ({
      ...prev,
      balance: prev.balance + transaction.amount,
      income: transaction.type === 'income' ? prev.income + transaction.amount : prev.income,
      expenses: transaction.type === 'expense' ? prev.expenses + Math.abs(transaction.amount) : prev.expenses
    }));
  };

  return {
    summary,
    expenseCategories,
    monthlyData,
    recentTransactions,
    addTransaction
  };
}
