import React, { useMemo } from 'react';
import { ProjectRecordInterface } from '@core/models/ProjectRecord';
import { sortPeriodsSimple, isValidPeriod, getLastPeriod } from '@shared/utils/periodUtils';

import { useExcelData } from '../hooks/useExcelData';
import { useDashboardStore } from '../../../shared/store/useDashboardStore';

import Loading from './Loading';
import ErrorMessage from './Error';
import ErrorBoundary from './ErrorBoundary';
import TrendChart from './TrendChart';
import PeriodComparison from './PeriodComparison';
import ForecastPanel from './ForecastPanel';
import MetricsCard from './MetricsCard';
import FiltersPanel from './FiltersPanel';

function AnalyticsPage() {
  const { data, isLoading, error } = useExcelData();
  const { selectedProject } = useDashboardStore();

  const periods = useMemo(() => {
    const allPeriods = [...new Set(data?.data.map((r: ProjectRecordInterface) => r.period) || [])];
    const validPeriods = allPeriods.filter(isValidPeriod);
    return sortPeriodsSimple(validPeriods);
  }, [data]);

  const lastPeriod = getLastPeriod(periods);

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={error instanceof Error ? error.message : 'Не удалось загрузить данные.'} />;

  return (
    <ErrorBoundary>
      <div className="p-4 pb-20">
        <FiltersPanel />
        
        {/* Заголовок */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Расширенная аналитика</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Тренды, сравнения и прогнозы
          </p>
        </div>

        {/* Секция трендов роста */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            📈 Тренды роста просмотров
          </h2>
          <TrendChart 
            data={data?.data || []} 
            selectedProject={selectedProject}
            periods={periods}
          />
        </div>

        {/* Секция сравнения периодов */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            📊 Сравнение периодов
          </h2>
          <PeriodComparison 
            data={data?.data || []} 
            periods={periods}
            lastPeriod={lastPeriod}
            selectedProject={selectedProject}
          />
        </div>

        {/* Секция прогнозирования */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            🔮 Прогнозирование
          </h2>
          <ForecastPanel 
            data={data?.data || []} 
            periods={periods}
            selectedProject={selectedProject}
          />
        </div>

        {/* Дополнительные метрики */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            📋 Ключевые метрики
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <MetricsCard 
              title="Средний рост"
              value="+12.5%"
              trend="up"
              description="За последние 3 периода"
              className="bg-green-50 dark:bg-green-900/20"
            />
            <MetricsCard 
              title="Стабильность"
              value="85%"
              trend="stable"
              description="Коэффициент вариации"
              className="bg-blue-50 dark:bg-blue-900/20"
            />
            <MetricsCard 
              title="Прогноз точности"
              value="92%"
              trend="up"
              description="R² коэффициент"
              className="bg-purple-50 dark:bg-purple-900/20"
            />
            <MetricsCard 
              title="Аномалии"
              value="2"
              trend="down"
              description="За текущий период"
              className="bg-orange-50 dark:bg-orange-900/20"
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default AnalyticsPage; 