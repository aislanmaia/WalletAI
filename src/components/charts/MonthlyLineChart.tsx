import React from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler 
} from 'chart.js';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp } from 'lucide-react';
import { chartColors, lineChartOptions } from '@/lib/chartConfig';
import { MonthlyData } from '@/hooks/useFinancialData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface MonthlyLineChartProps {
  data: MonthlyData[];
  isLoading?: boolean;
}

export const MonthlyLineChart = React.memo(({ data, isLoading }: MonthlyLineChartProps) => {
  const chartData = React.useMemo(() => ({
    labels: data.map(item => item.month),
    datasets: [
      {
        label: 'Receitas',
        data: data.map(item => item.income),
        borderColor: chartColors.success,
        backgroundColor: chartColors.success + '20',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Despesas',
        data: data.map(item => item.expenses),
        borderColor: chartColors.danger,
        backgroundColor: chartColors.danger + '20',
        fill: true,
        tension: 0.4
      }
    ]
  }), [data]);

  if (isLoading) {
    return (
      <Card className="p-6 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border border-gray-200/80 rounded-2xl dark:bg-white/5 dark:supports-[backdrop-filter]:bg-white/[0.03] dark:border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Evolução Mensal</h3>
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
        <div className="chart-container flex items-center justify-center min-h-[240px]">
          <div className="loading-spinner w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border border-gray-200/80 rounded-2xl shadow-sm dark:bg-white/5 dark:supports-[backdrop-filter]:bg-white/[0.03] dark:border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Evolução Mensal</h3>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-gray-400" />
          <Select defaultValue="6-months">
            <SelectTrigger className="w-auto h-9 text-sm border-gray-300 rounded-full px-3 dark:border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6-months">Últimos 6 meses</SelectItem>
              <SelectItem value="1-year">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="chart-container">
        <Line data={chartData} options={lineChartOptions} />
      </div>
    </Card>
  );
});
