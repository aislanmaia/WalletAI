import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Maximize2, Minimize2, ArrowRight } from 'lucide-react';
import { WeeklyExpenseHeatmap } from '@/hooks/useFinancialData';

interface WeeklyExpenseHeatmapChartProps {
  data: WeeklyExpenseHeatmap;
  isLoading?: boolean;
}

export function WeeklyExpenseHeatmapChart({ data, isLoading = false }: WeeklyExpenseHeatmapChartProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (isLoading) {
    return (
      <Card className="p-6 bg-white/70 supports-[backdrop-filter]:bg-white/50 backdrop-blur rounded-2xl shadow-lg hover:shadow-md transition-shadow border border-gray-100 dark:bg-white/5 dark:supports-[backdrop-filter]:bg-white/[0.03] dark:border-white/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">Gastos por Dia da Semana</CardTitle>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!data || !data.data || data.data.length === 0) {
    return (
      <Card className="p-6 bg-white/70 supports-[backdrop-filter]:bg-white/50 backdrop-blur rounded-2xl shadow-lg border border-gray-100 dark:bg-white/5 dark:supports-[backdrop-filter]:bg-white/[0.03] dark:border-white/10">
        <CardHeader>
          <CardTitle>Gastos por Dia da Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            Sem dados suficientes para exibir o heatmap.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular valores máximos e mínimos para normalização
  const allValues = data.data.flat();
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);

  // Função para obter cor baseada no valor
  const getColor = (value: number) => {
    if (value === 0) return '#F3F4F6'; // Cinza claro para valores zero
    
    const normalizedValue = (value - minValue) / (maxValue - minValue);
    const intensity = Math.min(0.9, 0.1 + normalizedValue * 0.8);
    
    // Gradiente de azul claro para azul escuro
    return `rgba(59, 130, 246, ${intensity})`;
  };

  // Função para obter cor do texto baseada no fundo
  const getTextColor = (value: number) => {
    if (value === 0) return '#9CA3AF';
    
    const normalizedValue = (value - minValue) / (maxValue - minValue);
    return normalizedValue > 0.5 ? 'white' : '#374151';
  };

  // Calcular totais por dia
  const dailyTotals = data.data.map(dayData => 
    dayData.reduce((sum, value) => sum + value, 0)
  );

  // Calcular totais por categoria
  const categoryTotals = data.categories.map((_, categoryIndex) =>
    data.data.reduce((sum, dayData) => sum + dayData[categoryIndex], 0)
  );

  const chartContent = (
    <div className={`space-y-4 ${isFullscreen ? 'h-auto' : ''}`}>
      {/* Indicador de scroll horizontal - apenas no modo minimizado */}
      {!isFullscreen && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <ArrowRight className="w-3 h-3" />
            <span>Arraste para ver mais</span>
          </div>
        </div>
      )}

      {/* Heatmap */}
      <div className="overflow-x-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #f3f4f6' }}>
        <div className="min-w-max">
          {/* Header com categorias */}
          <div className="grid grid-cols-8 gap-1 mb-2">
            <div className="w-20"></div> {/* Espaço vazio para alinhar */}
            {data.categories.map((category, index) => (
              <div key={category} className="w-20 text-center text-xs font-medium text-gray-600">
                {category}
              </div>
            ))}
          </div>

          {/* Linhas do heatmap */}
          {data.days.map((day, dayIndex) => (
            <div key={day} className="grid grid-cols-8 gap-1 mb-1">
              {/* Nome do dia */}
              <div className="w-20 text-xs font-medium text-gray-600 flex items-center">
                {day}
              </div>
              
              {/* Células do heatmap */}
              {data.data[dayIndex].map((value, categoryIndex) => (
                <div
                  key={`${day}-${categoryIndex}`}
                  className="w-20 h-12 rounded flex items-center justify-center text-xs font-medium transition-colors hover:opacity-80 cursor-pointer"
                  style={{
                    backgroundColor: getColor(value),
                    color: getTextColor(value)
                  }}
                  title={`${day} - ${data.categories[categoryIndex]}: R$ ${value.toLocaleString()}`}
                >
                  {value > 0 ? `R$ ${value}` : '-'}
                </div>
              ))}
            </div>
          ))}

          {/* Footer com totais */}
          <div className="grid grid-cols-8 gap-1 mt-2 pt-2 border-t border-gray-200">
            <div className="w-20 text-xs font-bold text-gray-700">Total</div>
            {categoryTotals.map((total, index) => (
              <div key={index} className="w-20 text-center text-xs font-bold text-gray-700">
                R$ {total.toLocaleString()}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="font-medium text-gray-700 mb-2">Dias com Maior Gasto</div>
          <div className="space-y-1">
            {dailyTotals
              .map((total, index) => ({ day: data.days[index], total }))
              .sort((a, b) => b.total - a.total)
              .slice(0, 3)
              .map(({ day, total }, index) => (
                <div key={day} className="flex justify-between text-xs">
                  <span className="text-gray-600">{day}</span>
                  <span className="font-medium">R$ {total.toLocaleString()}</span>
                </div>
              ))}
          </div>
        </div>
        
        <div>
          <div className="font-medium text-gray-700 mb-2">Categorias Mais Caras</div>
          <div className="space-y-1">
            {categoryTotals
              .map((total, index) => ({ category: data.categories[index], total }))
              .sort((a, b) => b.total - a.total)
              .slice(0, 3)
              .map(({ category, total }, index) => (
                <div key={category} className="flex justify-between text-xs">
                  <span className="text-gray-600">{category}</span>
                  <span className="font-medium">R$ {total.toLocaleString()}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-200"></div>
          <span>Baixo</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-300"></div>
          <span>Médio</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-600"></div>
          <span>Alto</span>
        </div>
      </div>
    </div>
  );

  return (
    <Card className={isFullscreen ? 'fixed inset-4 z-50 bg-white dark:bg-neutral-900 shadow-2xl mb-20' : 'bg-white/70 supports-[backdrop-filter]:bg-white/50 backdrop-blur rounded-2xl shadow-lg hover:shadow-md transition-shadow border border-gray-100 dark:bg-white/5 dark:supports-[backdrop-filter]:bg-white/[0.03] dark:border-white/10'}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Gastos por Dia da Semana
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select defaultValue="semana">
            <SelectTrigger className="w-auto text-sm rounded-full px-3 py-1.5 dark:border-white/10">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semana">Esta semana</SelectItem>
              <SelectItem value="mes">Este mês</SelectItem>
              <SelectItem value="trim">Este trimestre</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 p-0"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className={isFullscreen ? 'overflow-y-auto max-h-[calc(100vh-200px)]' : ''}>
        {chartContent}
      </CardContent>
    </Card>
  );
} 