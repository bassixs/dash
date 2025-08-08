import React from 'react';

/**
 * Компонент индикатора загрузки.
 */
export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="card light dark:dark p-8 animate-scaleIn">
        <div className="text-center">
          {/* Анимированный спиннер */}
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-gray-200/50 dark:border-gray-700/50 rounded-full animate-spin">
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            
            {/* Внутренний спиннер */}
            <div className="absolute inset-2 w-12 h-12 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
          </div>
          
          {/* Текст загрузки */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Загрузка данных...
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Пожалуйста, подождите
          </p>
          
          {/* Анимированные точки */}
          <div className="flex justify-center mt-4 space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
