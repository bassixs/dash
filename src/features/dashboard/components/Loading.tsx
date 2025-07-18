import React from 'react';

/**
 * Компонент индикатора загрузки.
 */
export default function Loading() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );
}
