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
      <Card className="p-6 bg-white shadow-sm border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Evolução Mensal</h3>
        </div>
        <div className="chart-container flex items-center justify-center">
          <div className="loading-spinner w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white shadow-sm border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Evolução Mensal</h3>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-gray-400" />
          <Select defaultValue="6-months">
            <SelectTrigger className="w-auto text-sm border-gray-300">
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
