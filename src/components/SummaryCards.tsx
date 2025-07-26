import { ArrowUp, ArrowDown, Wallet, Target, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FinancialSummary } from '@/hooks/useFinancialData';

interface SummaryCardsProps {
  summary: FinancialSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Balance Card */}
      <Card className="p-6 bg-white shadow-sm border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Saldo Total</p>
            <p className="text-2xl font-bold text-gray-900">
              R$ {summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-green-600 flex items-center mt-1">
              <ArrowUp className="w-3 h-3 mr-1" />
              +5,2% este mês
            </p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <Wallet className="text-green-600 w-6 h-6" />
          </div>
        </div>
      </Card>

      {/* Income Card */}
      <Card className="p-6 bg-white shadow-sm border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Receitas</p>
            <p className="text-2xl font-bold text-green-600">
              R$ {summary.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-green-600 flex items-center mt-1">
              <ArrowUp className="w-3 h-3 mr-1" />
              +2,1% este mês
            </p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <TrendingUp className="text-green-600 w-6 h-6" />
          </div>
        </div>
      </Card>

      {/* Expenses Card */}
      <Card className="p-6 bg-white shadow-sm border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Despesas</p>
            <p className="text-2xl font-bold text-red-500">
              R$ {summary.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-red-500 flex items-center mt-1">
              <ArrowUp className="w-3 h-3 mr-1" />
              +1,3% este mês
            </p>
          </div>
          <div className="bg-red-100 p-3 rounded-lg">
            <ArrowDown className="text-red-600 w-6 h-6" />
          </div>
        </div>
      </Card>

      {/* Savings Goal Card */}
      <Card className="p-6 bg-white shadow-sm border-gray-200">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <p className="text-sm font-medium text-gray-600">Meta de Economia</p>
            <p className="text-2xl font-bold text-blue-600">
              R$ {summary.savingsGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="mt-2">
              <Progress value={summary.savingsProgress} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">{summary.savingsProgress}% da meta</p>
            </div>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg ml-4">
            <Target className="text-blue-600 w-6 h-6" />
          </div>
        </div>
      </Card>
    </div>
  );
}
