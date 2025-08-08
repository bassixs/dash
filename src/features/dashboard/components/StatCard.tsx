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
      className={`stat-card light dark:dark card-hover animate-fadeIn ${className} ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <div className="text-center relative">
        {/* Градиентный фон */}
        <div className="absolute inset-0 rounded-2xl opacity-10 bg-gradient-to-br from-blue-400/20 to-purple-400/20" />
        
        {/* Основной контент */}
        <div className="relative z-10">
          <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent animate-fadeIn">
            {value}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
            {label}
          </p>
        </div>
        
        {/* Декоративные элементы */}
        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-pulse" />
        <div className="absolute bottom-2 left-2 w-1 h-1 bg-purple-400 rounded-full opacity-40" />
      </div>
    </div>
  );
}
