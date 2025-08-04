import React, { useState, useEffect, useMemo } from 'react';
import { ChartOptions } from 'chart.js';
import { useDashboardStore } from '@shared/store/useDashboardStore';
import { ProjectRecordInterface } from '@core/models/ProjectRecord';
import { sortPeriodsSimple, getLastPeriod } from '@shared/utils/periodUtils';

import { useExcelData } from './hooks/useExcelData';
import { useFilteredData } from './hooks/useFilteredData';
import { useProjectsChartData } from './hooks/useChartData';
import FiltersPanel from './components/FiltersPanel';
import StatCard from './components/StatCard';
import ProgressBar from './components/ProgressBar';
import TopProjectsModal from './components/TopProjectsModal';
import Chart from './components/Chart';
import ActivityRings from './components/ActivityRings';
import PeriodScales from './components/PeriodScales';
import HealthStats from './components/HealthStats';
import Loading from './components/Loading';
import ErrorMessage from './components/Error';
import ErrorBoundary from './components/ErrorBoundary';

export default function Dashboard() {
  const { data, isLoading, error } = useExcelData();
  const { selectedProject, selectedPeriod, setSelectedPeriod } = useDashboardStore();
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'views' | 'er' | 'si' | 'records' | null;
  }>({ isOpen: false, type: null });
  
  // Флаг для отслеживания, был ли уже установлен период
  const [periodInitialized, setPeriodInitialized] = useState(false);

  // Автоматически устанавливаем последний период при загрузке данных только один раз
  useEffect(() => {
    if (data?.data && !selectedPeriod && !periodInitialized) {
      const periods = [...new Set(data.data.map(record => record.period))];
      const sortedPeriods = sortPeriodsSimple(periods);
      const lastPeriod = getLastPeriod(sortedPeriods);
      
      if (lastPeriod) {
        setSelectedPeriod(lastPeriod);
        setPeriodInitialized(true);
      }
    }
  }, [data, selectedPeriod, setSelectedPeriod, periodInitialized]);

  // Используем хук для фильтрации данных
  const filteredData = useFilteredData(data?.data || []);

  // Данные для диаграммы распределения просмотров
  const projectsViewsChartData = useProjectsChartData(data?.data || [], selectedPeriod, 'views');

  // Улучшенный расчет статистики
  const { totalViews, totalSI, avgER, totalLinks } = useMemo(() => {
    const totalViews = filteredData.reduce((sum: number, r: ProjectRecordInterface) => sum + r.views, 0);
    const totalSI = filteredData.reduce((sum: number, r: ProjectRecordInterface) => sum + r.si, 0);
    
    // Исправленный расчет ЕР - используем формулу СИ/просмотры * 100
    const avgER = filteredData.length > 0 && totalViews > 0
      ? ((totalSI / totalViews) * 100).toFixed(1)
      : '0.0';
    
    const totalLinks = filteredData.length;

    return { totalViews, totalSI, avgER, totalLinks };
  }, [filteredData]);

  // Рассчитываем топы проектов
  const topProjects = useMemo(() => {
    const projectStats = filteredData.reduce((acc: { [key: string]: { views: number; si: number; count: number } }, record: ProjectRecordInterface) => {
      if (!acc[record.project]) {
        acc[record.project] = { views: 0, si: 0, count: 0 };
      }
      acc[record.project].views += record.views;
      acc[record.project].si += record.si;
      acc[record.project].count += 1;
      return acc;
    }, {});

    const projects = Object.entries(projectStats).map(([project, stats]) => ({
      project,
      views: stats.views,
      si: stats.si,
      count: stats.count,
      avgER: stats.views > 0 ? (stats.si / stats.views) * 100 : 0
    }));

    return {
      views: projects.sort((a, b) => b.views - a.views).slice(0, 5),
      si: projects.sort((a, b) => b.si - a.si).slice(0, 5),
      records: projects.sort((a, b) => b.count - a.count).slice(0, 5),
      er: projects.filter(p => p.avgER > 0).sort((a, b) => b.avgER - a.avgER).slice(0, 5)
    };
  }, [filteredData]);

  // Рассчитываем прогресс для актуального периода (28.07 - 03.08)
  const progressData = useMemo(() => {
    if (!data?.data) return null;
    
    // Фиксированный актуальный период
    const actualPeriod = '28.07 - 03.08';
    const actualPeriodData = data.data.filter(record => record.period === actualPeriod) || [];
    const totalViews = actualPeriodData.reduce((sum, record) => sum + record.views, 0);
    const target = 2000000; // 2 миллиона просмотров
    
    return {
      current: totalViews,
      target,
      period: actualPeriod
    };
  }, [data]);

  // Настройки для doughnut диаграммы
  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: false
      },
      y: {
        display: false
      }
    }
  };

  const handleStatCardClick = (type: 'views' | 'er' | 'si' | 'records') => {
    setModalState({ isOpen: true, type });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: null });
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={error instanceof Error ? error.message : 'Не удалось загрузить данные. Попробуйте снова.'} />;

  return (
    <ErrorBoundary>
      <div className="p-4 pb-20">
        <FiltersPanel />
        
        {/* Заголовок с градиентным текстом */}
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold gradient-text mb-2">Аналитика спецпроектов</h1>
          <p className="text-sm text-white/80 mt-1">
            {selectedPeriod || 'Все периоды'}
            {selectedProject && ` • ${selectedProject}`}
          </p>
        </div>

        {/* Колесо активности в стиле Apple Health */}
        <div className="mb-8 animate-fade-in-up stagger-1">
          <div className="card-modern p-6 flex justify-center">
            <ActivityRings
              views={totalViews}
              viewsTarget={2000000}
            />
          </div>
        </div>

        {/* Шкалы по периодам в стиле Apple Health */}
        <div className="mb-8 animate-fade-in-up stagger-2">
          <PeriodScales
            data={data?.data || []}
            selectedPeriod={selectedPeriod}
          />
        </div>

        {/* Детальная статистика в стиле Apple Health */}
        <div className="mb-8 animate-fade-in-up stagger-3">
          <HealthStats
            totalViews={totalViews}
            totalSI={totalSI}
            avgER={avgER}
            totalLinks={totalLinks}
          />
        </div>

        {/* Основная статистика с неоморфизмом */}
        <div className="card-modern mb-6 animate-fade-in-up stagger-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="Просмотры"
              value={totalViews.toLocaleString()}
              onClick={() => handleStatCardClick('views')}
              className="neo hover-lift cursor-pointer"
            />
            <StatCard
              label="Средний ЕР"
              value={`${avgER}%`}
              onClick={() => handleStatCardClick('er')}
              className="neo hover-lift cursor-pointer"
            />
            <StatCard
              label="СИ"
              value={totalSI.toLocaleString()}
              onClick={() => handleStatCardClick('si')}
              className="neo hover-lift cursor-pointer"
            />
            <StatCard
              label="Записей"
              value={totalLinks.toLocaleString()}
              onClick={() => handleStatCardClick('records')}
              className="neo hover-lift cursor-pointer"
            />
          </div>
        </div>

        {/* Прогресс бар для актуального периода */}
        {progressData && (
          <div className="mb-6 animate-fade-in-up stagger-5">
            <ProgressBar
              current={progressData.current}
              target={progressData.target}
              label="Прогресс по просмотрам"
              period={progressData.period}
            />
          </div>
        )}

        {/* Диаграмма распределения просмотров по проектам */}
        <div className="card-modern mb-6 animate-fade-in-up stagger-6">
          <h3 className="text-lg font-semibold mb-4 text-white">Распределение просмотров по спецпроектам</h3>
          <div className="h-80">
            <Chart type="doughnut" data={projectsViewsChartData} options={doughnutOptions} />
          </div>
        </div>

        {/* Модальные окна */}
        {modalState.isOpen && modalState.type && (
          <TopProjectsModal
            isOpen={modalState.isOpen}
            onClose={closeModal}
            title={
              modalState.type === 'views' ? 'Топ проектов по просмотрам' :
              modalState.type === 'si' ? 'Топ проектов по СИ' :
              modalState.type === 'er' ? 'Топ проектов по ЕР' :
              'Топ проектов по записям'
            }
            projects={
              modalState.type === 'views' ? topProjects.views.map(p => ({ ...p, value: p.views })) :
              modalState.type === 'si' ? topProjects.si.map(p => ({ ...p, value: p.si })) :
              modalState.type === 'er' ? topProjects.er.map(p => ({ ...p, value: p.avgER })) :
              topProjects.records.map(p => ({ ...p, value: p.count }))
            }
            valueFormatter={
              modalState.type === 'er' ? 
                (value) => `${value.toFixed(1)}%` :
                (value) => value.toLocaleString()
            }
          />
        )}
      </div>
    </ErrorBoundary>
  );
}