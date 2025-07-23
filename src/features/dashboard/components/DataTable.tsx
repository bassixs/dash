import React from 'react';
import { TableVirtuoso } from 'react-virtuoso';
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
    <TableVirtuoso
      data={data}
      components={{
        Table: ({ style, ...props }) => <table style={{ ...style, width: '100%' }} className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props} />,
        TableHead: ({ ...props }) => <thead {...props} />,
        TableRow: ({ item, ...props }) => <tr className="hover:bg-gray-100 dark:hover:bg-gray-800" {...props} />,
        TableBody: ({ ...props }) => <tbody {...props} />,
      }}
      fixedHeaderContent={() => (
        <tr className="bg-gray-50 dark:bg-gray-800">
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">Ссылка</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">Просмотры</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">СИ</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">ЕР</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">Проект</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">Период</th>
        </tr>
      )}
      itemContent={(index, record: ProjectRecordInterface) => (
        <tr>
          <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{record.link}</td>
          <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{record.views.toLocaleString()}</td>
          <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{record.si.toLocaleString()}</td>
          <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{(record.er * 100).toFixed(2)}%</td>
          <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{record.project}</td>
          <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{record.period}</td>
        </tr>
      )}
    />
  );
}