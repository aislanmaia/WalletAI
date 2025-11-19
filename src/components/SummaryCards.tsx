import { ArrowUp, ArrowDown, Wallet, Target, TrendingUp, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FinancialSummary } from '@/hooks/useFinancialData';
import { Skeleton } from '@/components/ui/skeleton';

interface SummaryCardsProps {
  summary: FinancialSummary;
  isLoading?: boolean;
  isEmpty?: boolean;
}

export function SummaryCards({ summary, isLoading, isEmpty }: SummaryCardsProps) {
  // Helper para formatar valores
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  };

  // Se não há dados, mostrar estado vazio simplificado
  if (isEmpty && !isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 rounded-2xl shadow-flat border-0 bg-gradient-to-br from-gray-50 to-gray-100 col-span-full">
          <div className="flex items-center justify-center gap-3 text-gray-500">
            <Info className="w-5 h-5" />
            <p className="text-sm">Nenhuma transação encontrada. Crie sua primeira transação para visualizar o resumo financeiro.</p>
          </div>
        </Card>
      </div>
    );
  }

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
                R$ {formatCurrency(summary.balance)}
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
                R$ {formatCurrency(summary.income)}
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
                R$ {formatCurrency(summary.expenses)}
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
            ) : summary.savingsGoal !== undefined ? (
              <p className="text-3xl font-semibold text-white">R$ {formatCurrency(summary.savingsGoal)}</p>
            ) : (
              <p className="text-xl font-semibold text-white/70">Não definida</p>
            )}
            <div className="mt-2">
              {isLoading ? (
                <Skeleton className="h-2 w-full rounded-full" />
              ) : summary.savingsProgress !== undefined ? (
                <>
                  <Progress value={summary.savingsProgress} className="h-3 rounded-full bg-white/30" indicatorClassName="bg-white" />
                  <p className="text-xs text-white/90 mt-1">{summary.savingsProgress}% da meta</p>
                </>
              ) : (
                <p className="text-xs text-white/70">Defina uma meta na página de Metas</p>
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

