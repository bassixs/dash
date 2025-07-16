import React from 'react';
import { useExcelData } from './hooks/useExcelData';
import { useFilteredData } from './hooks/useFilteredData';
import { useDashboardStore } from '../../shared/store/useDashboardStore';
import StatCard from './components/StatCard';
import FiltersPanel from './components/FiltersPanel';
import Loading from './components/Loading';
import ErrorMessage from './components/Error';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

function DashboardPage() {
  const { data, isLoading, error } = useExcelData();
  const filtered = useFilteredData(data?.data || []);
  const { selectedPeriod, selectedProject } = useDashboardStore();

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={error.message} />;

  const currentData = filtered.length > 0 ? filtered : data?.data.filter((r) => r.period === '14.07 - 20.07') || [];
  const totalViews = currentData.reduce((sum, r) => sum + r.views, 0);
  const totalSI = currentData.reduce((sum, r) => sum + r.si, 0);
  const avgER = currentData.length ? (currentData.reduce((sum, r) => sum + r.er, 0) / currentData.length * 100).toFixed(2) : 0;
  const viewTarget = 2_000_000;
  const viewProgress = Math.min((totalViews / viewTarget) * 100, 100);

  const projectViewsData = {
    labels: data.projects.filter((p) => currentData.some((r) => r.project === p)),
    datasets: [{
      label: 'Просмотры',
      data: data.projects.map((p) =>
        currentData.filter((r) => r.project === p).reduce((sum, r) => sum + r.views, 0)
      ),
      backgroundColor: '#3b82f6'
    }]
  };

  const periods = [...new Set(data.data.map((r) => r.period))];

  const erByPeriodData = {
    labels: periods,
    datasets: [{
      label: 'ЕР (%)',
      data: periods.map((period) => {
        const rows = data.data.filter(r => r.period === period && (!selectedProject || r.project === selectedProject));
        return rows.length ? (rows.reduce((sum, r) => sum + r.er, 0) / rows.length * 100).toFixed(2) : 0;
      }),
      borderColor: '#f97316',
      tension: 0.3,
      fill: false
    }]
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
        <div className="h-64">
          <Bar data={projectViewsData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">ЕР по периодам</h3>
        <div className="h-64">
          <Line data={erByPeriodData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
