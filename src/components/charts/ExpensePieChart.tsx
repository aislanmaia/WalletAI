import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart } from 'lucide-react';
import { chartColors, pieChartOptions } from '@/lib/chartConfig';
import { ExpenseCategory } from '@/hooks/useFinancialData';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpensePieChartProps {
  data: ExpenseCategory[];
  isLoading?: boolean;
}

export const ExpensePieChart = React.memo(({ data, isLoading }: ExpensePieChartProps) => {
  const chartData = React.useMemo(() => ({
    labels: data.map(item => item.name),
    datasets: [{
      data: data.map(item => item.amount),
      backgroundColor: data.map(item => item.color),
      borderWidth: 0
    }]
  }), [data]);

  if (isLoading) {
    return (
      <Card className="p-6 rounded-2xl shadow-flat border-0 gradient-card-blue">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Despesas por Categoria</h3>
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
        <div className="chart-container flex items-center justify-center min-h-[240px]">
          <div className="loading-spinner w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 rounded-2xl shadow-flat border-0 gradient-card-blue">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Despesas por Categoria</h3>
        <div className="flex items-center space-x-2">
          <PieChart className="w-4 h-4 text-gray-400" />
          <Select defaultValue="current-month">
            <SelectTrigger className="w-auto h-9 text-sm border-gray-300 rounded-full px-3 dark:border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Este mês</SelectItem>
              <SelectItem value="last-month">Último mês</SelectItem>
              <SelectItem value="quarter">Último trimestre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="chart-container">
        <Doughnut data={chartData} options={pieChartOptions} />
      </div>
    </Card>
  );
});
