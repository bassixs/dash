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
      className={`bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-700/70 rounded-2xl shadow-lg hover:shadow-xl border border-white/20 dark:border-gray-600/20 p-6 transition-all duration-300 hover:-translate-y-1 ${onClick ? 'cursor-pointer active:scale-95' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="text-center">
        <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-fadeIn">
          {value}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium">
          {label}
        </p>
      </div>
    </div>
  );
}
