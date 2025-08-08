import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

/**
 * Компонент для отображения сообщения об ошибке.
 * @param message - Текст ошибки
 */
interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex justify-center items-center min-h-screen p-6">
      <div className="card light dark:dark p-8 animate-scaleIn max-w-md">
        <div className="text-center">
          {/* Иконка ошибки */}
          <div className="mb-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          
          {/* Заголовок */}
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Произошла ошибка
          </h3>
          
          {/* Сообщение об ошибке */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>
          
          {/* Кнопка повтора */}
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    </div>
  );
}