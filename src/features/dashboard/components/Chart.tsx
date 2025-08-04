import React, { memo, useMemo } from 'react';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface BarChartProps {
  type: 'bar';
  data: ChartData<'bar'>;
  options?: ChartOptions<'bar'>;
}

interface LineChartProps {
  type: 'line';
  data: ChartData<'line'>;
  options?: ChartOptions<'line'>;
}

interface PieChartProps {
  type: 'pie';
  data: ChartData<'pie'>;
  options?: ChartOptions<'pie'>;
}

interface DoughnutChartProps {
  type: 'doughnut';
  data: ChartData<'doughnut'>;
  options?: ChartOptions<'doughnut'>;
}

type ChartProps = BarChartProps | LineChartProps | PieChartProps | DoughnutChartProps;

/**
 * Универсальный компонент для рендеринга графиков и диаграмм.
 * @param props Пропсы графика: тип, данные и настройки
 */
const Chart: React.FC<ChartProps> = memo((props) => {
  const { type, data, options } = props;

  // Безопасная проверка темной темы с fallback для тестов
  const isDarkMode = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
  }, []);

  const defaultOptions = useMemo(() => ({
    ...options,
    plugins: {
      ...options?.plugins,
      legend: {
        ...options?.plugins?.legend,
        labels: {
          ...options?.plugins?.legend?.labels,
          color: isDarkMode ? '#FFFFFF' : '#000000',
          font: {
            ...options?.plugins?.legend?.labels?.font,
            size: 12
          }
        },
      },
      tooltip: {
        ...options?.plugins?.tooltip,
        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDarkMode ? '#FFFFFF' : '#000000',
        bodyColor: isDarkMode ? '#FFFFFF' : '#000000',
      }
    },
    scales: {
      ...options?.scales,
      x: {
        ...options?.scales?.x,
        ticks: { 
          color: isDarkMode ? '#FFFFFF' : '#000000',
          font: { size: 11 }
        },
        title: {
          ...options?.scales?.x?.title,
          color: isDarkMode ? '#FFFFFF' : '#000000',
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }
      },
      y: {
        ...options?.scales?.y,
        ticks: { 
          color: isDarkMode ? '#FFFFFF' : '#000000',
          font: { size: 11 }
        },
        title: {
          ...options?.scales?.y?.title,
          color: isDarkMode ? '#FFFFFF' : '#000000',
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }
      },
    },
  }), [options, isDarkMode]);

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={data as ChartData<'bar'>} options={defaultOptions as ChartOptions<'bar'>} />;
      case 'line':
        return <Line data={data as ChartData<'line'>} options={defaultOptions as ChartOptions<'line'>} />;
      case 'pie':
        return <Pie data={data as ChartData<'pie'>} options={defaultOptions as ChartOptions<'pie'>} />;
      case 'doughnut':
        return <Doughnut data={data as ChartData<'doughnut'>} options={defaultOptions as ChartOptions<'doughnut'>} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-64 animate-fade-in-scale">
      {renderChart()}
    </div>
  );
});

Chart.displayName = 'Chart';

export default Chart;