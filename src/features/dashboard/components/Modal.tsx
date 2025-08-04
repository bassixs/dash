import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ChartData, ChartOptions } from 'chart.js';

import Chart from './Chart';

/**
 * Компонент модального окна для отображения графиков.
 * @param isOpen - Флаг открытия модального окна
 * @param onClose - Функция закрытия модального окна
 * @param chartData - Данные для графика
 * @param chartOptions - Настройки графика
 * @param title - Заголовок модального окна
 */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  chartData: ChartData<'line'>;
  chartOptions: ChartOptions<'line'>;
  title: string;
}

export default function Modal({ isOpen, onClose, chartData, chartOptions, title }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-3xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <Chart type="line" data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}