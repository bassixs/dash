import React, { useState } from 'react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useKPIStore } from '@shared/store/useKPIStore';

export default function KPISync() {
  const { exportKPIData, importKPIData, kpis, syncKPIData, loadKPIData, clearKPIData } = useKPIStore();
  const [importData, setImportData] = useState('');
  const [message, setMessage] = useState('');

  const handleExport = () => {
    try {
      const data = exportKPIData();
      
      // Создаем файл для скачивания
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kpi-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage('Данные экспортированы успешно!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Ошибка при экспорте данных');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleImport = () => {
    if (!importData.trim()) {
      setMessage('Введите данные для импорта');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const success = importKPIData(importData);
      if (success) {
        setMessage('Данные импортированы успешно!');
        setImportData('');
      } else {
        setMessage('Неверный формат данных');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Ошибка при импорте данных');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSync = async () => {
    try {
      setMessage('Синхронизация...');
      await syncKPIData();
      setMessage('Данные синхронизированы успешно!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Ошибка при синхронизации');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleLoad = async () => {
    try {
      setMessage('Загрузка данных...');
      await loadKPIData();
      setMessage('Данные загружены успешно!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Ошибка при загрузке данных');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleClear = () => {
    if (confirm('Вы уверены, что хотите очистить все KPI данные?')) {
      clearKPIData();
      setMessage('Данные очищены успешно!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Показываем только если есть KPI данные
  if (kpis.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
        Синхронизация KPI данных
      </h3>
      
      <div className="space-y-4">
        {/* Синхронизация */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleSync}
            className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Синхронизировать
          </button>
          <button
            onClick={handleLoad}
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Загрузить
          </button>
          <button
            onClick={handleClear}
            className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Очистить
          </button>
        </div>

        {/* Экспорт */}
        <div>
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Экспортировать KPI данные
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Скачает файл с вашими KPI настройками
          </p>
        </div>

        {/* Импорт */}
        <div>
          <textarea
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            placeholder="Вставьте данные для импорта..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            rows={4}
          />
          <button
            onClick={handleImport}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors mt-2"
          >
            <ArrowUpTrayIcon className="w-5 h-5" />
            Импортировать KPI данные
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Загрузит KPI настройки из файла
          </p>
        </div>

        {/* Сообщение */}
        {message && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
} 