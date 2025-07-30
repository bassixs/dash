import React from 'react';
import { ProjectRecordInterface } from '../../../core/models/ProjectRecord';

/**
 * Компонент таблицы для отображения данных.
 * @param data Массив записей
 */
export default function DataTable({ data }: { data: ProjectRecordInterface[] }) {
  if (data.length === 0) {
    return <div className="text-center p-4">Нет данных для отображения</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">Ссылка</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">Просмотры</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">СИ</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">ЕР</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">Проект</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">Период</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((record: ProjectRecordInterface, index: number) => (
            <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-800">
              <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{record.link}</td>
              <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{record.views.toLocaleString()}</td>
              <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{record.si.toLocaleString()}</td>
              <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{(record.er * 100).toFixed(2)}%</td>
              <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{record.project}</td>
              <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{record.period}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}