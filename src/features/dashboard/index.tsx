import React from 'react';
import { useExcelData } from './hooks/useExcelData';
import { useFilteredData } from './hooks/useFilteredData';
import { useChartData } from './hooks/useChartData';
import { useDashboardStore } from '../../shared/store/useDashboardStore';
import StatCard from './components/StatCard';
import FiltersPanel from './components/FiltersPanel';
import DataTable from './components/DataTable';
import Loading from './components/Loading';
import ErrorMessage from './components/Error';
import Chart from './components/Chart';
import { ProjectRecord } from '../../core/models/ProjectRecord';

interface ExcelData {
  data: ProjectRecord[];
  projects: string[];
}

/**
 * Главная страница дашборда.
 */
function DashboardPage() {
  const { data, isLoading, error } = useExcelData();
  const { selectedPeriod, selectedProject } = useDashboardStore();
  const filtered = useFilteredData(data?.data || []);
  const periods = [...new Set(data?.data.map((r: ProjectRecord) => r.period) || [])];
  const { projectViewsData, erByPeriodData } = useChartData(
    filtered.length > 0 ? filtered : data?.data.filter((r: ProjectRecord) => r.period === '14.07 - 20.07') || [],
    data?.projects || [],
    periods,
    selectedProject
  );

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={error.message} />;

  const currentData = filtered.length > 0 ? filtered : data?.data.filter((r: ProjectRecord) => r.period === '14.07 - 20.07') || [];
  const totalViews = currentData.reduce((sum: number, r: ProjectRecord) => sum + r.views, 0);
  const totalSI = currentData.reduce((sum: number, r: ProjectRecord) => sum + r.si, 0);
  const avgER = currentData.length ? (currentData.reduce((sum: number, r: ProjectRecord) => sum + r.er, 0) / currentData.length * 100).toFixed(2) : 0;
  const viewTarget = 2_000_000;
  const viewProgress = Math.min((totalViews / viewTarget) * 100, 100);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Просмотры', color: '#FFFFFF' } },
      x: { title: { display: true, text: 'Спецпроекты', color: '#FFFFFF' } },
    },
    plugins: {
      legend: { labels: { color: '#FFFFFF' } },
      title: { display: false },
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'ЕР (%)', color: '#FFFFFF' } },
      x: { title: { display: true, text: 'Периоды', color: '#FFFFFF' } },
    },
    plugins: {
      legend: { labels: { color: '#FFFFFF' } },
      title: { display: false },
    },
  };

  return (
    <div className="p-4 sm:p-6 relative">
      <FiltersPanel />

      <h1 className="text-3xl font-bold mb-6 text-center">Аналитика спецпроектов</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-6">
        <h2 className="text-xl mb-2 font-semibold">Период: {selectedPeriod || '14.07 - 20.07'}</h2>

        <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Просмотры: {totalViews.toLocaleString()} / {viewTarget.toLocaleString()}
        </div>

        <div className="w-full bg-gray-200 h-3 rounded-full mb-4">
          <div className="h-3 bg-blue-600 rounded-full transition-all duration-700 ease-in-out" style={{ width: `${viewProgress}%` }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Просмотры" value={totalViews.toLocaleString()} />
          <StatCard label="Средний ЕР" value={`${avgER}%`} />
          <StatCard label="СИ" value={totalSI.toLocaleString()} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Просмотры по проектам</h3>
        <Chart type="bar" data={projectViewsData} options={chartOptions} />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">ЕР по периодам</h3>
        <Chart type="line" data={erByPeriodData} options={lineChartOptions} />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">Данные</h3>
        <DataTable data={currentData} />
      </div>
    </div>
  );
}

export default DashboardPage;
