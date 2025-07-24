import React, { useMemo } from 'react';
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
import { ProjectRecordInterface } from '@core/models/ProjectRecord';

interface ExcelData {
  data: ProjectRecordInterface[];
  projects: string[];
}

function DashboardPage() {
  // Все хуки вызываются в начале
  const { data, isLoading, error } = useExcelData();
  const { selectedPeriod, selectedProject } = useDashboardStore();
  const filtered = useFilteredData(data?.data || []);
  const periods = useMemo(() => {
    const allPeriods = [...new Set(data?.data.map((r: ProjectRecordInterface) => r.period) || [])];
    return allPeriods.filter((p) => p && p.match(/^\d{2}\.\d{2}\s*-\s*\d{2}\.\d{2}$/)).sort();
  }, [data]);
  const { projectViewsData, erByPeriodData } = useChartData(
    filtered,
    data?.projects || [],
    periods,
    selectedProject
  );
  const currentData = useMemo(() => filtered.length > 0 ? filtered : data?.data || [], [filtered, data]);

  // Вычисляем данные для прогресс-бара только для последнего периода
  const latestPeriod = periods[periods.length - 1] || '14.07 - 20.07';
  const latestPeriodData = useMemo(() => {
    return data?.data.filter((r: ProjectRecordInterface) => r.period === latestPeriod) || [];
  }, [data, latestPeriod]);
  const { totalViews, totalSI, avgER } = useMemo(() => {
    const totalViews = latestPeriodData.reduce((sum: number, r: ProjectRecordInterface) => sum + r.views, 0);
    const totalSI = latestPeriodData.reduce((sum: number, r: ProjectRecordInterface) => sum + r.si, 0);
    const avgER = latestPeriodData.length
      ? (latestPeriodData.reduce((sum: number, r: ProjectRecordInterface) => sum + r.er, 0) / latestPeriodData.length * 100).toFixed(2)
      : '0';
    return { totalViews, totalSI, avgER };
  }, [latestPeriodData]);

  // Условный рендеринг после всех хуков
  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={error instanceof Error ? error.message : 'Неизвестная ошибка'} />;

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
        <h2 className="text-xl mb-2 font-semibold">Период: {latestPeriod}</h2>

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