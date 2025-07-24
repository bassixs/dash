import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
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
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
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

type ChartProps = BarChartProps | LineChartProps;

/**
 * Универсальный компонент для рендеринга графиков.
 * @param props Пропсы графика: тип, данные и настройки
 */
export default function Chart(props: ChartProps) {
  const { type, data, options } = props;

  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const defaultOptions = {
    ...options,
    plugins: {
      ...options?.plugins,
      legend: {
        ...options?.plugins?.legend,
        labels: {
          ...options?.plugins?.legend?.labels,
          color: isDarkMode ? '#FFFFFF' : '#000000',
        },
      },
    },
    scales: {
      ...options?.scales,
      x: {
        ...options?.scales?.x,
        ticks: { color: isDarkMode ? '#FFFFFF' : '#000000' },
        title: {
          ...options?.scales?.x?.title,
          color: isDarkMode ? '#FFFFFF' : '#000000',
        },
      },
      y: {
        ...options?.scales?.y,
        ticks: { color: isDarkMode ? '#FFFFFF' : '#000000' },
        title: {
          ...options?.scales?.y?.title,
          color: isDarkMode ? '#FFFFFF' : '#000000',
        },
      },
    },
  };

  return (
    <div className="h-64">
      {type === 'bar' ? (
        <Bar data={data as ChartData<'bar'>} options={defaultOptions as ChartOptions<'bar'>} />
      ) : (
        <Line data={data as ChartData<'line'>} options={defaultOptions as ChartOptions<'line'>} />
      )}
    </div>
  );
}