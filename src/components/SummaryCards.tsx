import { ArrowUp, ArrowDown, Wallet, Target, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FinancialSummary } from '@/hooks/useFinancialData';
import { Skeleton } from '@/components/ui/skeleton';

interface SummaryCardsProps {
  summary: FinancialSummary;
  isLoading?: boolean;
}

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Balance Card */}
      <Card className="p-6 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border border-gray-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow dark:bg-white/5 dark:supports-[backdrop-filter]:bg-white/[0.03] dark:border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Saldo Total</p>
            {isLoading ? (
              <Skeleton className="h-8 w-40" />
            ) : (
              <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                R$ {summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            )}
            <p className="text-sm text-emerald-600 flex items-center mt-2">
              <ArrowUp className="w-3 h-3 mr-1" />
              +5,2% este mês
            </p>
          </div>
          <div className="bg-emerald-100/80 ring-1 ring-emerald-200 p-3 rounded-xl dark:bg-emerald-900/20 dark:ring-emerald-800">
            <Wallet className="text-emerald-600 w-6 h-6" />
          </div>
        </div>
      </Card>

      {/* Income Card */}
      <Card className="p-6 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border border-gray-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow dark:bg-white/5 dark:supports-[backdrop-filter]:bg-white/[0.03] dark:border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Receitas</p>
            {isLoading ? (
              <Skeleton className="h-8 w-40" />
            ) : (
              <p className="text-3xl font-semibold text-emerald-600">
                R$ {summary.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            )}
            <p className="text-sm text-emerald-600 flex items-center mt-2">
              <ArrowUp className="w-3 h-3 mr-1" />
              +2,1% este mês
            </p>
          </div>
          <div className="bg-emerald-100/80 ring-1 ring-emerald-200 p-3 rounded-xl dark:bg-emerald-900/20 dark:ring-emerald-800">
            <TrendingUp className="text-emerald-600 w-6 h-6" />
          </div>
        </div>
      </Card>

      {/* Expenses Card */}
      <Card className="p-6 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border border-gray-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow dark:bg-white/5 dark:supports-[backdrop-filter]:bg-white/[0.03] dark:border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Despesas</p>
            {isLoading ? (
              <Skeleton className="h-8 w-40" />
            ) : (
              <p className="text-3xl font-semibold text-rose-600">
                R$ {summary.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            )}
            <p className="text-sm text-rose-600 flex items-center mt-2">
              <ArrowUp className="w-3 h-3 mr-1" />
              +1,3% este mês
            </p>
          </div>
          <div className="bg-rose-100/80 ring-1 ring-rose-200 p-3 rounded-xl dark:bg-rose-900/20 dark:ring-rose-800">
            <ArrowDown className="text-rose-600 w-6 h-6" />
          </div>
        </div>
      </Card>

      {/* Savings Goal Card */}
      <Card className="p-6 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border border-gray-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow dark:bg-white/5 dark:supports-[backdrop-filter]:bg-white/[0.03] dark:border-white/10">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Meta de Economia</p>
            {isLoading ? (
              <Skeleton className="h-8 w-40" />
            ) : (
              <p className="text-3xl font-semibold text-indigo-600">
                R$ {summary.savingsGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            )}
            <div className="mt-2">
              {isLoading ? (
                <Skeleton className="h-2 w-full rounded-full" />
              ) : (
                <>
                  <Progress value={summary.savingsProgress} className="h-2 rounded-full" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{summary.savingsProgress}% da meta</p>
                </>
              )}
            </div>
          </div>
          <div className="bg-indigo-100/80 ring-1 ring-indigo-200 p-3 rounded-xl ml-4 dark:bg-indigo-900/20 dark:ring-indigo-800">
            <Target className="text-indigo-600 w-6 h-6" />
          </div>
        </div>
      </Card>
    </div>
  );
}
