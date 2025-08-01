import React, { useMemo, useEffect, useState } from 'react';
import { ProjectRecordInterface } from '@core/models/ProjectRecord';
import { sortPeriodsSimple, getLastPeriod } from '@shared/utils/periodUtils';

import { useDashboardStore } from '../../shared/store/useDashboardStore';

import { useExcelData } from './hooks/useExcelData';
import { useFilteredData } from './hooks/useFilteredData';
import StatCard from './components/StatCard';
import ProgressBar from './components/ProgressBar';
import FiltersPanel from './components/FiltersPanel';
import Loading from './components/Loading';
import ErrorMessage from './components/Error';
import ErrorBoundary from './components/ErrorBoundary';
import TopProjectsModal from './components/TopProjectsModal';

export default function Dashboard() {
  const { data, isLoading, error } = useExcelData();
  const { selectedProject, selectedPeriod, setSelectedPeriod } = useDashboardStore();
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'views' | 'er' | 'si' | 'records' | null;
  }>({ isOpen: false, type: null });

  // Автоматически устанавливаем последний период при загрузке данных
  useEffect(() => {
    if (data?.data && !selectedPeriod) {
      const periods = [...new Set(data.data.map(record => record.period))];
      const sortedPeriods = sortPeriodsSimple(periods);
      const lastPeriod = getLastPeriod(sortedPeriods);
      
      if (lastPeriod) {
        setSelectedPeriod(lastPeriod);
      }
    }
  }, [data, selectedPeriod, setSelectedPeriod]);

  // Используем хук для фильтрации данных
  const filteredData = useFilteredData(data?.data || []);

  const currentData = useMemo(() => {
    console.log('currentData calculation:', { filteredLength: filteredData.length, dataLength: data?.data.length });
    return filteredData.length > 0 ? filteredData : data?.data || [];
  }, [filteredData, data]);

  useEffect(() => {
    console.log('Dashboard data update:', {
      dataLength: data?.data?.length || 0,
      filteredLength: filteredData.length,
      selectedProject,
      selectedPeriod,
      currentDataLength: currentData.length
    });
  }, [data, filteredData, selectedProject, selectedPeriod, currentData]);

  // Улучшенный расчет статистики
  const { totalViews, totalSI, avgER, totalLinks } = useMemo(() => {
    const totalViews = filteredData.reduce((sum: number, r: ProjectRecordInterface) => sum + r.views, 0);
    const totalSI = filteredData.reduce((sum: number, r: ProjectRecordInterface) => sum + r.si, 0);
    
    // Исправленный расчет ЕР - используем формулу СИ/просмотры * 100
    const avgER = filteredData.length
      ? (filteredData.reduce((sum: number, r: ProjectRecordInterface) => sum + (r.si / r.views) * 100, 0) / filteredData.length).toFixed(1)
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

  // Рассчитываем прогресс для выбранного периода
  const progressData = useMemo(() => {
    if (!selectedPeriod) return null;
    
    const selectedPeriodData = data?.data.filter(record => record.period === selectedPeriod) || [];
    const totalViews = selectedPeriodData.reduce((sum, record) => sum + record.views, 0);
    const target = 2000000; // 2 миллиона просмотров
    
    console.log('Progress Bar Debug:', {
      selectedPeriod,
      selectedPeriodDataLength: selectedPeriodData.length,
      totalViews,
      target
    });
    
    return {
      current: totalViews,
      target,
      period: selectedPeriod
    };
  }, [data, selectedPeriod]);

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
        
        {/* Заголовок */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Аналитика спецпроектов</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {selectedPeriod || 'Все периоды'}
            {selectedProject && ` • ${selectedProject}`}
          </p>
        </div>

        {/* Основная статистика */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard 
              label="Просмотры" 
              value={totalViews.toLocaleString()} 
              onClick={() => handleStatCardClick('views')} 
              className="bg-blue-50 dark:bg-blue-900/20 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30"
            />
            <StatCard 
              label="Средний ЕР" 
              value={`${avgER}%`} 
              onClick={() => handleStatCardClick('er')} 
              className="bg-green-50 dark:bg-green-900/20 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30"
            />
            <StatCard 
              label="СИ" 
              value={totalSI.toLocaleString()} 
              onClick={() => handleStatCardClick('si')} 
              className="bg-purple-50 dark:bg-purple-900/20 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30"
            />
            <StatCard 
              label="Записей" 
              value={totalLinks.toLocaleString()} 
              onClick={() => handleStatCardClick('records')} 
              className="bg-orange-50 dark:bg-orange-900/20 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30"
            />
          </div>
        </div>

        {/* Прогресс бар для последнего периода */}
        {progressData && (
          <div className="mb-4">
            <ProgressBar 
              current={progressData.current}
              target={progressData.target}
              label="Прогресс просмотров"
              period={progressData.period}
            />
          </div>
        )}

        {/* Модальные окна */}
        <TopProjectsModal
          isOpen={modalState.isOpen && modalState.type === 'views'}
          onClose={closeModal}
          title="Топ проектов по просмотрам"
          projects={topProjects.views.map(p => ({ ...p, value: p.views }))}
          valueFormatter={(value) => value.toLocaleString()}
        />
        
        <TopProjectsModal
          isOpen={modalState.isOpen && modalState.type === 'er'}
          onClose={closeModal}
          title="Топ проектов по ЕР"
          projects={topProjects.er.map(p => ({ ...p, value: p.avgER }))}
          valueFormatter={(value) => `${value.toFixed(1)}%`}
        />
        
        <TopProjectsModal
          isOpen={modalState.isOpen && modalState.type === 'si'}
          onClose={closeModal}
          title="Топ проектов по СИ"
          projects={topProjects.si.map(p => ({ ...p, value: p.si }))}
          valueFormatter={(value) => value.toLocaleString()}
        />
        
        <TopProjectsModal
          isOpen={modalState.isOpen && modalState.type === 'records'}
          onClose={closeModal}
          title="Топ проектов по количеству записей"
          projects={topProjects.records.map(p => ({ ...p, value: p.count }))}
          valueFormatter={(value) => value.toLocaleString()}
        />
      </div>
    </ErrorBoundary>
  );
}