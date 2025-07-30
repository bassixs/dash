import React, { useMemo } from 'react';
import { useExcelData } from '@features/dashboard/hooks/useExcelData';
import { useProjectsChartData, useERChartData, useWeeklyChartData } from '@features/dashboard/hooks/useChartData';
import { useDashboardStore } from '@shared/store/useDashboardStore';
import Chart from '@features/dashboard/components/Chart';
import FiltersPanel from '@features/dashboard/components/FiltersPanel';
import Loading from '@features/dashboard/components/Loading';
import ErrorMessage from '@features/dashboard/components/Error';
import { ChartOptions } from 'chart.js';
import { ProjectRecordInterface } from '@core/models/ProjectRecord';

export default function ChartsPage() {
  const { data, isLoading, error } = useExcelData();
  const { selectedPeriod, selectedProject } = useDashboardStore();

  // Подготавливаем данные для диаграмм
  const projectsViewsChartData = useProjectsChartData(data?.data || [], selectedPeriod, 'views');
  const projectsERChartData = useProjectsChartData(data?.data || [], selectedPeriod, 'er');
  const erChartData = useERChartData(data?.data || [], selectedPeriod);
  const weeklyChartData = useWeeklyChartData(data?.data || [], selectedProject, selectedPeriod);

  // Определяем, какой тип графика показывать
  const shouldShowWeeklyChart = selectedProject && selectedPeriod;
  const shouldShowProjectsChart = !selectedProject || !selectedPeriod;

  // Дополнительная статистика для мобильного отображения
  const stats = useMemo(() => {
    const filteredData = data?.data.filter(record => {
      const matchProject = selectedProject ? record.project === selectedProject : true;
      const matchPeriod = selectedPeriod ? record.period === selectedPeriod : true;
      return matchProject && matchPeriod;
    }) || [];

    const totalViews = filteredData.reduce((sum, record) => sum + record.views, 0);
    const avgER = filteredData.length
      ? (filteredData.reduce((sum, record) => sum + record.er, 0) / filteredData.length * 100).toFixed(1)
      : '0.0';

    return { totalViews, avgER, recordCount: filteredData.length };
  }, [data, selectedProject, selectedPeriod]);

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // Убираем легенду
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

  // Настройки для doughnut диаграмм
  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // Убираем легенду
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: false // Убираем ось X
      },
      y: {
        display: false // Убираем ось Y
      }
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={error instanceof Error ? error.message : 'Неизвестная ошибка'} />;

  return (
    <div className="p-4 pb-20">
      <FiltersPanel />
      
      {/* Заголовок */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Графики и диаграммы</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {selectedPeriod || 'Все периоды'}
          {selectedProject && ` • ${selectedProject}`}
        </p>
      </div>

      {/* Статистика */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Общая статистика</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalViews.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Просмотры</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.avgER}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Средний ЕР</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.recordCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Записей</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Диаграмма просмотров по проектам */}
        {shouldShowProjectsChart && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Распределение просмотров по спецпроектам</h3>
            <div className="h-80">
              <Chart type="doughnut" data={projectsViewsChartData} options={doughnutOptions} />
            </div>
          </div>
        )}

        {/* Диаграмма ЕР по проектам */}
        {shouldShowProjectsChart && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Средний ЕР по спецпроектам</h3>
            <div className="h-80">
              <Chart type="doughnut" data={projectsERChartData} options={doughnutOptions} />
            </div>
          </div>
        )}

        {/* Диаграмма распределения по ЕР */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Распределение по ЕР</h3>
          <div className="h-80">
            <Chart type="doughnut" data={erChartData} options={doughnutOptions} />
          </div>
        </div>

        {/* График по дням недели */}
        {shouldShowWeeklyChart && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Динамика для {selectedProject}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
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
      </div>
    </div>
  );
}