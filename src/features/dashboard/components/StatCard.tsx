import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  onClick?: () => void;
  className?: string;
}

/**
 * Компонент для отображения статистической карточки
 */
export default function StatCard({ label, value, onClick, className = '' }: StatCardProps) {
  return (
    <div 
      className={`stat-card card-hover ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-900 dark:text-white animate-fadeIn">
          {value}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {label}
        </p>
      </div>
    </div>
  );
}
