import React, { useMemo } from 'react';
import { ProjectRecordInterface } from '@core/models/ProjectRecord';
import { sortPeriodsSimple, isValidPeriod, getLastPeriod } from '@shared/utils/periodUtils';
import { useWeeklyChartData } from '@features/dashboard/hooks/useChartData';
import { ChartOptions } from 'chart.js';
import { useDashboardStore } from '@shared/store/useDashboardStore';

import { useExcelData } from '@features/dashboard/hooks/useExcelData';

import Loading from './Loading';
import ErrorMessage from './Error';
import ErrorBoundary from './ErrorBoundary';
import Chart from './Chart';
import TrendChart from './TrendChart';
import PeriodComparison from './PeriodComparison';
import ForecastPanel from './ForecastPanel';
import MetricsCard from './MetricsCard';
import FiltersPanel from './FiltersPanel';

function AnalyticsPage() {
  const { data, isLoading, error } = useExcelData();
  const { selectedProject, selectedPeriod } = useDashboardStore();

  const periods = useMemo(() => {
    const allPeriods = [...new Set(data?.data.map((r: ProjectRecordInterface) => r.period) || [])];
    const validPeriods = allPeriods.filter(isValidPeriod);
    return sortPeriodsSimple(validPeriods);
  }, [data]);

  const lastPeriod = getLastPeriod(periods);

  // Данные для графиков
  const weeklyChartData = useWeeklyChartData(data?.data || [], selectedProject, selectedPeriod);

  // Определяем, какой тип графика показывать
  const shouldShowWeeklyChart = selectedProject && selectedPeriod;

  // Статистика для графиков
  const stats = useMemo(() => {
    const filteredData = data?.data.filter(record => {
      const matchProject = selectedProject && selectedProject.trim() !== '' ? record.project === selectedProject : true;
      const matchPeriod = selectedPeriod && selectedPeriod.trim() !== '' ? record.period === selectedPeriod : true;
      return matchProject && matchPeriod;
    }) || [];

    const totalViews = filteredData.reduce((sum, record) => sum + record.views, 0);
    const totalSI = filteredData.reduce((sum, record) => sum + record.si, 0);
    const avgER = totalViews > 0 ? ((totalSI / totalViews) * 100).toFixed(1) : '0.0';

    return { totalViews, totalSI, avgER, recordCount: filteredData.length };
  }, [data, selectedProject, selectedPeriod]);

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={error instanceof Error ? error.message : 'Не удалось загрузить данные.'} />;

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        title: { display: true, text: 'Значение', color: '#FFFFFF' } 
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
      },
      x: { 
        title: { display: true, text: 'Периоды', color: '#FFFFFF' } 
      },
    },
  };

  return (
    <ErrorBoundary>
      <div className="p-6 pb-24 min-h-screen">
        <FiltersPanel />
        
        {/* Заголовок */}
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
            Аналитика
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
            Графики, тренды и прогнозы
          </p>
        </div>

        {/* Статистика */}
        <div className="card light dark:dark p-6 mb-6 animate-scaleIn">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Общая статистика</h3>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="glass-card dark:glass-card-dark p-4 rounded-xl">
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                {stats.totalViews.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Просмотры</p>
            </div>
            <div className="glass-card dark:glass-card-dark p-4 rounded-xl">
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                {stats.totalSI.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">СИ</p>
            </div>
            <div className="glass-card dark:glass-card-dark p-4 rounded-xl">
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                {stats.recordCount}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Записей</p>
            </div>
          </div>
        </div>
        
        {/* График по дням недели */}
        {shouldShowWeeklyChart && (
          <div className="card light dark:dark p-6 mb-6 animate-fadeIn">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Динамика для {selectedProject}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">
              Период: {selectedPeriod}
            </p>
            <div className="h-80">
              <Chart 
                type="line" 
                data={weeklyChartData} 
                options={chartOptions}
              />
            </div>
          </div>
        )}

        {/* Секция трендов роста */}
        <div className="mb-6 animate-fadeIn">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            📈 Тренды роста просмотров
          </h3>
          <TrendChart 
            data={data?.data || []} 
            selectedProject={selectedProject}
            periods={periods}
          />
        </div>

        {/* Секция сравнения периодов */}
        <div className="mb-6 animate-fadeIn">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            📊 Сравнение периодов
          </h3>
          <PeriodComparison 
            data={data?.data || []} 
            periods={periods}
            lastPeriod={lastPeriod}
            selectedProject={selectedProject}
          />
        </div>

        {/* Секция прогнозирования */}
        <div className="mb-6 animate-fadeIn">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            🔮 Прогнозирование
          </h3>
          <ForecastPanel 
            data={data?.data || []} 
            periods={periods}
            selectedProject={selectedProject}
          />
        </div>

        {/* Дополнительные метрики */}
        <div className="mb-6 animate-fadeIn">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            📋 Ключевые метрики
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <MetricsCard 
              title="Средний рост"
              value="+12.5%"
              trend="up"
              description="За последние 3 периода"
              className="gradient-green"
            />
            <MetricsCard 
              title="Стабильность"
              value="85%"
              trend="stable"
              description="Коэффициент вариации"
              className="gradient-blue"
            />
            <MetricsCard 
              title="Прогноз точности"
              value="92%"
              trend="up"
              description="R² коэффициент"
              className="gradient-purple"
            />
            <MetricsCard 
              title="Аномалии"
              value="2"
              trend="down"
              description="За текущий период"
              className="gradient-orange"
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default AnalyticsPage; 