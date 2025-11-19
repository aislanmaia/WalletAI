import { ChartOptions } from 'chart.js';
import { formatCurrency } from './utils';

export const chartColors = {
  primary: '#4A56E2',
  success: '#10B981',
  danger: '#F87171',
  warning: '#D97706',
  info: '#0284C7',
  purple: '#343D9B',
  pink: '#F87171'
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
        label: function (context) {
          const value = context.parsed;
          const dataset = context.dataset;
          const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
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
        callback: function (value) {
          return formatCurrency(Number(value));
        }
      }
    }
  },
  plugins: {
    ...defaultChartOptions.plugins,
    tooltip: {
      callbacks: {
        label: function (context) {
          return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
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
        callback: function (value) {
          return formatCurrency(Number(value));
        }
      }
    }
  },
  plugins: {
    ...defaultChartOptions.plugins,
    tooltip: {
      callbacks: {
        label: function (context) {
          return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
        }
      }
    }
  }
};
