import React from 'react';

interface ProgressBarProps {
  current: number;
  target: number;
  label: string;
  period: string;
}

/**
 * Компонент прогресс бара для отображения прогресса просмотров
 */
export default function ProgressBar({ current, target, label, period }: ProgressBarProps) {
  const percentage = Math.min((current / target) * 100, 100);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{label}</h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">{period}</span>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{current.toLocaleString()}</span>
          <span>{target.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
        <div 
          className="bg-blue-600 h-4 rounded-full transition-all duration-300 flex items-center justify-center"
          style={{ width: `${percentage}%` }}
        >
          {percentage > 15 && (
            <span className="text-white text-xs font-medium">
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
      
      <div className="mt-2 text-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Осталось: {(target - current).toLocaleString()} просмотров
        </span>
      </div>
    </div>
  );
} 