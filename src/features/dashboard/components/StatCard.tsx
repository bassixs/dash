import React from 'react';

/**
 * Компонент карточки для отображения статистических данных.
 * @param label - Название метрики
 * @param value - Значение метрики
 * @param onClick - Обработчик клика для открытия модального окна
 */
interface StatCardProps {
  label: string;
  value: string;
  onClick: () => void;
}

export default function StatCard({ label, value, onClick }: StatCardProps) {
  return (
    <div
      className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow text-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
      onClick={onClick}
    >
      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{value}</div>
      <div className="text-gray-600 dark:text-gray-300 text-sm">{label}</div>
    </div>
  );
}
