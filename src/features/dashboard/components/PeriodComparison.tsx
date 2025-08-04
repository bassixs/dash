import React, { useMemo, useState } from 'react';
import { ProjectRecordInterface } from '@core/models/ProjectRecord';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/solid';

interface PeriodComparisonProps {
  data: ProjectRecordInterface[];
  periods: string[];
  lastPeriod: string | null;
  selectedProject: string;
}

export default function PeriodComparison({ data, periods, lastPeriod, selectedProject }: PeriodComparisonProps) {
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const comparisonData = useMemo(() => {
    if (!lastPeriod || periods.length < 2) return null;

    const currentPeriodIndex = periods.indexOf(lastPeriod);
    const previousPeriod = periods[currentPeriodIndex - 1];

    if (!previousPeriod) return null;

    // Фильтруем данные по проекту
    const filteredData = selectedProject 
      ? data.filter(record => record.project === selectedProject)
      : data;

    // Данные текущего периода
    const currentData = filteredData.filter(record => record.period === lastPeriod);
    const currentViews = currentData.reduce((sum, record) => sum + record.views, 0);
    const currentSI = currentData.reduce((sum, record) => sum + record.si, 0);
    const currentER = currentViews > 0 ? (currentSI / currentViews) * 100 : 0;

    // Данные предыдущего периода
    const previousData = filteredData.filter(record => record.period === previousPeriod);
    const previousViews = previousData.reduce((sum, record) => sum + record.views, 0);
    const previousSI = previousData.reduce((sum, record) => sum + record.si, 0);
    const previousER = previousViews > 0 ? (previousSI / previousViews) * 100 : 0;

    // Вычисляем изменения
    const viewsChange = previousViews > 0 ? ((currentViews - previousViews) / previousViews) * 100 : 0;
    const siChange = previousSI > 0 ? ((currentSI - previousSI) / previousSI) * 100 : 0;
    const erChange = previousER > 0 ? ((currentER - previousER) / previousER) * 100 : 0;

    return {
      current: {
        period: lastPeriod,
        views: currentViews,
        si: currentSI,
        er: currentER,
        recordCount: currentData.length
      },
      previous: {
        period: previousPeriod,
        views: previousViews,
        si: previousSI,
        er: previousER,
        recordCount: previousData.length
      },
      changes: {
        views: viewsChange,
        si: siChange,
        er: erChange
      }
    };
  }, [data, periods, lastPeriod, selectedProject]);

  if (!comparisonData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Недостаточно данных для сравнения периодов
        </p>
      </div>
    );
  }

  const { current, previous, changes } = comparisonData;

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpIcon className="w-4 h-4 text-green-500" />;
    if (change < 0) return <ArrowDownIcon className="w-4 h-4 text-red-500" />;
    return <MinusIcon className="w-4 h-4 text-gray-500" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className={`transition-all duration-500 ${
      isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
    }`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Карточка текущего периода */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Текущий период
            </h4>
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              {current.period}
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Просмотры</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {current.views.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">СИ</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {current.si.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Средний ЕР</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {current.er.toFixed(1)}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Записей</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {current.recordCount}
              </span>
            </div>
          </div>
        </div>

        {/* Карточка предыдущего периода */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-gray-400">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Предыдущий период
            </h4>
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {previous.period}
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Просмотры</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {previous.views.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">СИ</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {previous.si.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Средний ЕР</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {previous.er.toFixed(1)}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Записей</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {previous.recordCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Индикаторы изменений */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Изменения
        </h4>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              {getChangeIcon(changes.views)}
            </div>
            <div className={`text-lg font-semibold ${getChangeColor(changes.views)}`}>
              {changes.views > 0 ? '+' : ''}{changes.views.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Просмотры
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              {getChangeIcon(changes.si)}
            </div>
            <div className={`text-lg font-semibold ${getChangeColor(changes.si)}`}>
              {changes.si > 0 ? '+' : ''}{changes.si.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              СИ
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              {getChangeIcon(changes.er)}
            </div>
            <div className={`text-lg font-semibold ${getChangeColor(changes.er)}`}>
              {changes.er > 0 ? '+' : ''}{changes.er.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              ЕР
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 