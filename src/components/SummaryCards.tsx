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
      <Card className="p-6 rounded-2xl shadow-flat shadow-flat-hover border-0 kpi-card kpi-balance">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/90 mb-1">Saldo Total</p>
            {isLoading ? (
              <Skeleton className="h-8 w-40" />
            ) : (
              <p className="text-3xl font-semibold text-white">
                R$ {summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            )}
            <p className="text-sm text-white/90 flex items-center mt-2">
              <ArrowUp className="w-3 h-3 mr-1" />
              +5,2% este mês
            </p>
          </div>
          <div className="bg-white/20 p-3 rounded-xl ring-1 ring-white/40">
            <Wallet className="text-white w-6 h-6" />
          </div>
        </div>
      </Card>

      {/* Income Card */}
      <Card className="p-6 rounded-2xl shadow-flat shadow-flat-hover border-0 kpi-card kpi-income">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/90 mb-1">Receitas</p>
            {isLoading ? (
              <Skeleton className="h-8 w-40" />
            ) : (
              <p className="text-3xl font-semibold text-white">
                R$ {summary.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            )}
            <p className="text-sm text-white/90 flex items-center mt-2">
              <ArrowUp className="w-3 h-3 mr-1" />
              +2,1% este mês
            </p>
          </div>
          <div className="bg-white/20 p-3 rounded-xl ring-1 ring-white/40">
            <TrendingUp className="text-white w-6 h-6" />
          </div>
        </div>
      </Card>

      {/* Expenses Card */}
      <Card className="p-6 rounded-2xl shadow-flat shadow-flat-hover border-0 kpi-card kpi-expense">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/90 mb-1">Despesas</p>
            {isLoading ? (
              <Skeleton className="h-8 w-40" />
            ) : (
              <p className="text-3xl font-semibold text-white">
                R$ {summary.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            )}
            <p className="text-sm text-white/90 flex items-center mt-2">
              <ArrowUp className="w-3 h-3 mr-1" />
              +1,3% este mês
            </p>
          </div>
          <div className="bg-white/20 p-3 rounded-xl ring-1 ring-white/40">
            <ArrowDown className="text-white w-6 h-6" />
          </div>
        </div>
      </Card>

      {/* Savings Goal Card */}
      <Card className="p-6 rounded-2xl shadow-flat shadow-flat-hover border-0 kpi-card kpi-savings">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <p className="text-xs uppercase tracking-wide text-white/90 mb-1">Meta de Economia</p>
            {isLoading ? (
              <Skeleton className="h-8 w-40" />
            ) : (
              <p className="text-3xl font-semibold text-white">R$ {summary.savingsGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            )}
            <div className="mt-2">
              {isLoading ? (
                <Skeleton className="h-2 w-full rounded-full" />
              ) : (
                <>
                  <Progress value={summary.savingsProgress} className="h-3 rounded-full bg-white/30" indicatorClassName="bg-white" />
                  <p className="text-xs text-white/90 mt-1">{summary.savingsProgress}% da meta</p>
                </>
              )}
            </div>
          </div>
          <div className="bg-white/20 p-3 rounded-xl ml-4 ring-1 ring-white/40">
            <Target className="text-white w-6 h-6" />
          </div>
        </div>
      </Card>
    </div>
  );
}
