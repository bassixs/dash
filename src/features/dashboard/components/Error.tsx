import React from 'react';

/**
 * Компонент для отображения сообщения об ошибке.
 * @param message - Текст ошибки
 */
interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="bg-red-100 text-red-800 p-4 rounded shadow text-center">
      Ошибка: {message}
    </div>
  );
}