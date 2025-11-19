import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3 } from 'lucide-react';
import { chartColors, barChartOptions } from '@/lib/chartConfig';
import { MonthlyData } from '@/hooks/useFinancialData';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface IncomeExpenseBarChartProps {
  data: MonthlyData[];
  isLoading?: boolean;
}

export const IncomeExpenseBarChart = React.memo(({ data, isLoading }: IncomeExpenseBarChartProps) => {
  const chartData = React.useMemo(() => {
    // Lógica para centralizar barras quando há poucos dados
    let labels = data.map(item => item.month);
    const minSlots = 6;

    // Helper para gerar dados com padding
    const getPaddedData = (accessor: (item: MonthlyData) => number) => {
      if (data.length >= minSlots || data.length === 0) return data.map(accessor);

      const emptySlots = minSlots - data.length;
      const leftPadding = Math.floor(emptySlots / 2);
      const rightPadding = emptySlots - leftPadding;

      return [
        ...Array(leftPadding).fill(null),
        ...data.map(accessor),
        ...Array(rightPadding).fill(null)
      ];
    };

    // Aplicar padding nas labels se necessário
    if (data.length > 0 && data.length < minSlots) {
      const emptySlots = minSlots - data.length;
      const leftPadding = Math.floor(emptySlots / 2);
      const rightPadding = emptySlots - leftPadding;

      const emptyLabelsLeft = Array(leftPadding).fill('');
      const emptyLabelsRight = Array(rightPadding).fill('');
      labels = [...emptyLabelsLeft, ...labels, ...emptyLabelsRight];
    }

    return {
      labels,
      datasets: [
        {
          label: 'Receitas',
          data: getPaddedData(item => item.income),
          backgroundColor: '#10B981',
          barPercentage: 0.6,
          categoryPercentage: 0.8,
          maxBarThickness: 40,
          borderRadius: 4,
          skipNull: true,
        },
        {
          label: 'Despesas',
          data: getPaddedData(item => item.expenses),
          backgroundColor: '#F87171',
          barPercentage: 0.6,
          categoryPercentage: 0.8,
          maxBarThickness: 40,
          borderRadius: 4,
          skipNull: true,
        }
      ]
    };
  }, [data]);

  if (isLoading) {
    return (
      <Card className="p-6 rounded-2xl shadow-flat border-0 gradient-card-indigo">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Receitas vs Despesas</h3>
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
        <div className="chart-container flex items-center justify-center min-h-[240px]">
          <div className="loading-spinner w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 rounded-2xl shadow-flat border-0 gradient-card-indigo">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Receitas vs Despesas</h3>
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-gray-400" />
          <Select defaultValue="this-year">
            <SelectTrigger className="w-auto h-9 text-sm border-gray-300 rounded-full px-3 dark:border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-year">Este ano</SelectItem>
              <SelectItem value="last-year">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="chart-container">
        <Bar
          data={chartData}
          options={{
            ...barChartOptions,
            maintainAspectRatio: false,
            scales: {
              ...barChartOptions.scales,
              x: {
                ...barChartOptions.scales?.x,
                grid: {
                  display: false,
                }
              },
              y: {
                ...barChartOptions.scales?.y,
                border: {
                  display: false
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)',
                }
              }
            }
          }}
        />
      </div>
    </Card>
  );
});
