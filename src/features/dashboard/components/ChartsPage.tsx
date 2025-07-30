import React from 'react';
import { useExcelData } from '@features/dashboard/hooks/useExcelData';
import { useProjectsChartData, useERChartData, useWeeklyChartData } from '@features/dashboard/hooks/useChartData';
import { useDashboardStore } from '@shared/store/useDashboardStore';
import Chart from '@features/dashboard/components/Chart';
import FiltersPanel from '@features/dashboard/components/FiltersPanel';
import Loading from '@features/dashboard/components/Loading';
import ErrorMessage from '@features/dashboard/components/Error';
import { ChartOptions } from 'chart.js';

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

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
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
    plugins: { 
      legend: { 
        labels: { color: '#FFFFFF' } 
      } 
    },
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={error instanceof Error ? error.message : 'Неизвестная ошибка'} />;

  return (
    <div className="p-4 sm:p-6">
      <FiltersPanel />
      <h1 className="text-3xl font-bold mb-6 text-center">Графики и диаграммы</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Диаграмма просмотров по проектам */}
        {shouldShowProjectsChart && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4">Распределение просмотров по спецпроектам</h3>
            <Chart type="doughnut" data={projectsViewsChartData} />
          </div>
        )}

        {/* Диаграмма ЕР по проектам */}
        {shouldShowProjectsChart && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4">Средний ЕР по спецпроектам</h3>
            <Chart type="doughnut" data={projectsERChartData} />
          </div>
        )}

        {/* Диаграмма распределения по ЕР */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">Распределение по ЕР</h3>
          <Chart type="doughnut" data={erChartData} />
        </div>

        {/* График по дням недели */}
        {shouldShowWeeklyChart && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">
              Динамика просмотров и ЕР для {selectedProject} за период {selectedPeriod}
            </h3>
            <Chart 
              type="line" 
              data={weeklyChartData} 
              options={chartOptions}
            />
          </div>
        )}
      </div>
    </div>
  );
}