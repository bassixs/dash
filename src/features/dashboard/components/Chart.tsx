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

// Интерфейсы для каждого типа графика
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

// Дискриминированное объединение
type ChartProps = BarChartProps | LineChartProps;

/**
 * Универсальный компонент для рендеринга графиков.
 * @param props Пропсы графика: тип, данные и настройки
 */
export default function Chart(props: ChartProps) {
  const { type, data, options } = props;

  return (
    <div className="h-64">
      {type === 'bar' ? (
        <Bar data={data as ChartData<'bar'>} options={options as ChartOptions<'bar'>} />
      ) : (
        <Line data={data as ChartData<'line'>} options={options as ChartOptions<'line'>} />
      )}
    </div>
  );
}