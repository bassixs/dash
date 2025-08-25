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
  // Защита от NaN и невалидных значений
  const safeValue = (() => {
    // Убираем % для проверки числа
    const numericValue = value.replace('%', '');
    
    // Убираем пробелы из числа (форматированные числа)
    const cleanNumericValue = numericValue.replace(/\s/g, '');
    
    if (value === 'NaN%' || value === 'NaN' || 
        isNaN(Number(cleanNumericValue)) || 
        !isFinite(Number(cleanNumericValue))) {
      console.warn('StatCard: Invalid value detected:', value);
      return '0.0%';
    }
    return value;
  })();

  // Определяем размер шрифта в зависимости от длины числа
  const getFontSize = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, ''); // Убираем все кроме цифр
    const length = numericValue.length;
    
    if (length >= 7) return 'text-xl'; // Для чисел от 1,000,000
    if (length >= 6) return 'text-2xl'; // Для чисел от 100,000
    if (length >= 5) return 'text-2xl'; // Для чисел от 10,000
    return 'text-3xl'; // Для остальных
  };

  const fontSize = getFontSize(safeValue);

  return (
    <div 
      className={`bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-700/70 rounded-2xl shadow-lg hover:shadow-xl border border-white/20 dark:border-gray-600/20 p-4 transition-all duration-300 hover:-translate-y-1 ${onClick ? 'cursor-pointer active:scale-95' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="text-center">
        <p className={`${fontSize} font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-fadeIn leading-tight`}>
          {safeValue}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium">
          {label}
        </p>
      </div>
    </div>
  );
}
