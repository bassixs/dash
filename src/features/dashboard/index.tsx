import React, { useMemo, useState, useEffect } from 'react';
import { ChartOptions } from 'chart.js';
import { useDashboardStore } from '@shared/store/useDashboardStore';
import { sortPeriods } from '@shared/utils/periodUtils';

import { useExcelData } from './hooks/useExcelData';
import { useFilteredData } from './hooks/useFilteredData';
import { useProjectsChartData } from './hooks/useChartData';
import Navbar from './components/Navbar';
import StatCard from './components/StatCard';
import ProgressBar from './components/ProgressBar';
import FiltersPanel from './components/FiltersPanel';
import TopProjectsModal from './components/TopProjectsModal';
import ErrorBoundary from './components/ErrorBoundary';
import Chart from './components/Chart';

const Dashboard: React.FC = () => {
  const { data, error } = useExcelData();
  const { selectedPeriod, setSelectedPeriod } = useDashboardStore();
  
  const [periodInitialized, setPeriodInitialized] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    projects: [],
    valueFormatter: (value: number) => value.toString()
  });

  // Автоматически устанавливаем последний период при первой загрузке
  useEffect(() => {
    if (data && data.data && data.data.length > 0 && !periodInitialized) {
      const periods = [...new Set(data.data.map(item => item.period))].filter(Boolean);
      const sortedPeriods = sortPeriods(periods);
      if (sortedPeriods.length > 0) {
        setSelectedPeriod(sortedPeriods[sortedPeriods.length - 1]);
      }
      setPeriodInitialized(true);
    }
  }, [data, periodInitialized, setSelectedPeriod]);

  // Используем хук для фильтрации данных
  const filteredData = useFilteredData(data?.data || []);

  // Данные для диаграммы распределения просмотров
  const projectsChartData = useProjectsChartData(data?.data || [], selectedPeriod, 'views');

  // Прогресс бар всегда показывает данные для актуального периода
  const progressData = useMemo(() => {
    if (!data?.data) return { current: 0, target: 100 };
    
    const actualPeriod = '28.07 - 03.08';
    const periodData = data.data.filter(item => item.period === actualPeriod);
    
    const totalViews = periodData.reduce((sum, item) => sum + item.views, 0);
    const avgViews = periodData.length > 0 ? totalViews / periodData.length : 0;
    
    return {
      current: avgViews,
      target: 1000 // Целевое значение
    };
  }, [data]);

  // Статистика для карточек
  const stats = useMemo(() => {
    if (!filteredData) return { totalViews: 0, avgSI: 0, avgER: 0, totalRecords: 0 };

    const totalViews = filteredData.reduce((sum, item) => sum + item.views, 0);
    const totalSI = filteredData.reduce((sum, item) => sum + item.si, 0);
    const totalER = filteredData.reduce((sum, item) => sum + item.er, 0);
    const recordCount = filteredData.length;

    return {
      totalViews,
      avgSI: recordCount > 0 ? totalSI / recordCount : 0,
      avgER: recordCount > 0 ? totalER / recordCount : 0,
      totalRecords: recordCount
    };
  }, [filteredData]);

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#374151',
          font: {
            size: 12
          }
        }
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <ErrorBoundary>
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Ошибка загрузки данных</h2>
              <p className="text-gray-600">{error instanceof Error ? error.message : String(error)}</p>
            </div>
          </ErrorBoundary>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <ErrorBoundary>
          {/* Заголовок */}
          <div className="text-center mb-8 animate-fade-in-up">
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Аналитика проектов
            </h1>
            <p className="text-gray-600">
              Мониторинг эффективности и прогресса
            </p>
          </div>

          {/* Фильтры */}
          <div className="mb-6 animate-fade-in-up stagger-1">
            <FiltersPanel />
          </div>

          {/* Статистические карточки */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in-up stagger-2">
            <StatCard
              label="Всего просмотров"
              value={stats.totalViews.toLocaleString()}
            />
            <StatCard
              label="Средний SI"
              value={stats.avgSI.toFixed(2)}
            />
            <StatCard
              label="Средний ER"
              value={stats.avgER.toFixed(2)}
            />
            <StatCard
              label="Записей"
              value={stats.totalRecords.toString()}
            />
          </div>

          {/* Прогресс бар */}
          <div className="mb-8 animate-fade-in-up stagger-3">
            <ProgressBar
              current={progressData.current}
              target={progressData.target}
              label="Прогресс по просмотрам"
              period="28.07 - 03.08"
            />
          </div>

          {/* График распределения просмотров */}
          <div className="card-modern neo p-6 mb-8 animate-fade-in-up stagger-4">
            <h3 className="text-xl font-semibold gradient-text mb-4">
              Распределение просмотров по проектам
            </h3>
            <div className="h-64">
              <Chart
                type="doughnut"
                data={projectsChartData}
                options={doughnutOptions}
              />
            </div>
          </div>

          {/* Модальное окно для топ проектов */}
          {modalState.isOpen && (
            <TopProjectsModal
              isOpen={modalState.isOpen}
              title={modalState.title}
              projects={modalState.projects}
              valueFormatter={modalState.valueFormatter}
              onClose={() => setModalState({ isOpen: false, title: '', projects: [], valueFormatter: (value: number) => value.toString() })}
            />
          )}
        </ErrorBoundary>
      </div>
      
      <Navbar />
    </div>
  );
};

export default Dashboard;