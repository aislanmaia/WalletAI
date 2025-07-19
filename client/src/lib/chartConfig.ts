import { ChartOptions } from 'chart.js';

export const chartColors = {
  primary: '#1E40AF',
  success: '#059669', 
  danger: '#DC2626',
  warning: '#D97706',
  info: '#0284C7',
  purple: '#7C3AED',
  pink: '#DB2777'
};

export const defaultChartOptions: ChartOptions<any> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        usePointStyle: true,
        font: {
          family: 'Inter'
        }
      }
    }
  }
};

export const pieChartOptions: ChartOptions<'doughnut'> = {
  ...defaultChartOptions,
  cutout: '60%',
  plugins: {
    ...defaultChartOptions.plugins,
    tooltip: {
      callbacks: {
        label: function(context) {
          const value = context.parsed;
          const dataset = context.dataset;
          const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${context.label}: R$ ${value.toLocaleString('pt-BR')} (${percentage}%)`;
        }
      }
    }
  }
};

export const lineChartOptions: ChartOptions<'line'> = {
  ...defaultChartOptions,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return 'R$ ' + Number(value).toLocaleString('pt-BR');
        }
      }
    }
  },
  plugins: {
    ...defaultChartOptions.plugins,
    tooltip: {
      callbacks: {
        label: function(context) {
          return `${context.dataset.label}: R$ ${context.parsed.y.toLocaleString('pt-BR')}`;
        }
      }
    }
  }
};

export const barChartOptions: ChartOptions<'bar'> = {
  ...defaultChartOptions,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return 'R$ ' + Number(value).toLocaleString('pt-BR');
        }
      }
    }
  },
  plugins: {
    ...defaultChartOptions.plugins,
    tooltip: {
      callbacks: {
        label: function(context) {
          return `${context.dataset.label}: R$ ${context.parsed.y.toLocaleString('pt-BR')}`;
        }
      }
    }
  }
};
