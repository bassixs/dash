import React, { useMemo } from 'react';
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

type ChartType = 'bar' | 'line';

interface ChartProps {
  type: ChartType;
  data: any;
  options?: any;
}

/**
 * Универсальный компонент для рендеринга графиков.
 * @param type Тип графика ('bar' или 'line')
 * @param data Данные для графика
 * @param options Настройки графика
 */
export default function Chart({ type, data, options }: ChartProps) {
  return (
    <div className="h-64">
      {type === 'bar' ? (
        <Bar data={data} options={options} />
      ) : (
        <Line data={data} options={options} />
      )}
    </div>
  );
}