import React, { useMemo, useEffect, useState } from 'react';
import { ProjectRecordInterface } from '@core/models/ProjectRecord';
import { sortPeriodsSimple, isValidPeriod, getLastPeriod } from '@shared/utils/periodUtils';

import { useDashboardStore } from '../../shared/store/useDashboardStore';

import { useExcelData } from './hooks/useExcelData';
import { useFilteredData } from './hooks/useFilteredData';
import StatCard from './components/StatCard';
import ProgressBar from './components/ProgressBar';
import FiltersPanel from './components/FiltersPanel';
import Loading from './components/Loading';
import ErrorMessage from './components/Error';
import ErrorBoundary from './components/ErrorBoundary';
import KPISummary from './components/KPISummary';
import KPISettings from './components/KPISettings';

function DashboardPage() {
  const { data, isLoading, error } = useExcelData();
  const { selectedPeriod, selectedProject, setSelectedPeriod } = useDashboardStore();
  const filtered = useFilteredData(data?.data || []);
  const [isKPISettingsOpen, setIsKPISettingsOpen] = useState(false);
  
  const periods = useMemo(() => {
    const allPeriods = [...new Set(data?.data.map((r: ProjectRecordInterface) => r.period) || [])];
    console.log('DashboardPage - All periods:', allPeriods);
    
    const validPeriods = allPeriods.filter(isValidPeriod);
    console.log('DashboardPage - Valid periods:', validPeriods);
    
    const sortedPeriods = sortPeriodsSimple(validPeriods);
    console.log('DashboardPage - Sorted periods (simple):', sortedPeriods);
    
    return sortedPeriods;
  }, [data]);

  const currentData = useMemo(() => {
    console.log('currentData calculation:', { filteredLength: filtered.length, dataLength: data?.data.length });
    return filtered.length > 0 ? filtered : data?.data || [];
  }, [filtered, data]);

  useEffect(() => {
    if (periods.length > 0 && !selectedPeriod) {
      console.log('DashboardPage: Setting default period to', periods[periods.length - 1]);
      setSelectedPeriod(periods[periods.length - 1]); // Устанавливаем последний (актуальный) период
    }
  }, [periods, selectedPeriod, setSelectedPeriod]);

  // Улучшенный расчет статистики
  const { totalViews, totalSI, avgER, totalLinks, topProjects } = useMemo(() => {
    const totalViews = filtered.reduce((sum: number, r: ProjectRecordInterface) => sum + r.views, 0);
    const totalSI = filtered.reduce((sum: number, r: ProjectRecordInterface) => sum + r.si, 0);
    
    // Отладочная информация для ЕР
    console.log('ER Debug:', {
      filteredLength: filtered.length,
      sampleER: filtered.slice(0, 5).map(r => ({ 
        er: r.er, 
        calculatedER: (r.si / r.views) * 100,
        project: r.project,
        views: r.views,
        si: r.si
      })),
      allER: filtered.map(r => r.er)
    });
    
    // Исправленный расчет ЕР - используем формулу СИ/просмотры * 100
    const avgER = filtered.length
      ? (filtered.reduce((sum: number, r: ProjectRecordInterface) => sum + (r.si / r.views) * 100, 0) / filtered.length).toFixed(1)
      : '0.0';
    
    console.log('ER Calculation:', {
      totalER: filtered.reduce((sum: number, r: ProjectRecordInterface) => sum + (r.si / r.views) * 100, 0),
      avgER,
      filteredLength: filtered.length
    });
    
    const totalLinks = filtered.length;

    // Топ проектов по просмотрам
    const projectStats = filtered.reduce((acc, record) => {
      if (!acc[record.project]) {
        acc[record.project] = { views: 0, si: 0, count: 0 };
      }
      acc[record.project].views += record.views;
      acc[record.project].si += record.si;
      acc[record.project].count += 1;
      return acc;
    }, {} as Record<string, { views: number; si: number; count: number }>);

    const topProjects = Object.entries(projectStats)
      .map(([project, stats]) => ({
        project,
        views: stats.views,
        avgER: stats.views > 0 ? ((stats.si / stats.views) * 100).toFixed(1) : '0.0',
        count: stats.count
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    return { totalViews, totalSI, avgER, totalLinks, topProjects };
  }, [filtered]);

  // Получаем последний период для прогресс бара
  const lastPeriod = getLastPeriod(periods);

  // Рассчитываем прогресс для последнего периода
  const progressData = useMemo(() => {
    if (!lastPeriod) return null;
    
    const lastPeriodData = data?.data.filter(record => record.period === lastPeriod) || [];
    const totalViews = lastPeriodData.reduce((sum, record) => sum + record.views, 0);
    const target = 2000000; // 2 миллиона просмотров
    
    console.log('Progress Bar Debug:', {
      lastPeriod,
      allPeriods: periods,
      lastPeriodDataLength: lastPeriodData.length,
      totalViews,
      target,
      lastPeriodData: lastPeriodData.slice(0, 3) // Показываем первые 3 записи для отладки
    });
    
    return {
      current: totalViews,
      target,
      period: lastPeriod
    };
  }, [data, lastPeriod, periods]);

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={error instanceof Error ? error.message : 'Не удалось загрузить данные. Попробуйте снова.'} />;

  console.log('DashboardPage Debug:', { 
    periods, 
    currentDataLength: currentData.length, 
    selectedProject, 
    selectedPeriod, 
    lastPeriod,
    periodsLength: periods.length,
    firstPeriod: periods[0],
    lastPeriodInArray: periods[periods.length - 1],
    allDataPeriods: data?.data.map(r => r.period).slice(0, 10) // Показываем первые 10 периодов
  });

  return (
    <ErrorBoundary>
      <div className="p-4 pb-20">
        <FiltersPanel onOpenKPISettings={() => setIsKPISettingsOpen(true)} />
        
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
              onClick={() => {}} 
              className="bg-blue-50 dark:bg-blue-900/20"
            />
            <StatCard 
              label="Средний ЕР" 
              value={`${avgER}%`} 
              onClick={() => {}} 
              className="bg-green-50 dark:bg-green-900/20"
            />
            <StatCard 
              label="СИ" 
              value={totalSI.toLocaleString()} 
              onClick={() => {}} 
              className="bg-purple-50 dark:bg-purple-900/20"
            />
            <StatCard 
              label="Записей" 
              value={totalLinks.toLocaleString()} 
              onClick={() => {}} 
              className="bg-orange-50 dark:bg-orange-900/20"
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

        {/* Топ проектов */}
        {topProjects.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Топ проектов по просмотрам</h3>
            <div className="space-y-3">
              {topProjects.map((project, index) => (
                <div key={project.project} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center mr-3">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{project.project}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{project.count} записей</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {project.views.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ЕР: {project.avgER}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Модальное окно настроек KPI */}
        <KPISettings 
          isOpen={isKPISettingsOpen} 
          onClose={() => setIsKPISettingsOpen(false)} 
        />

        {/* KPI Summary - фиксированный внизу */}
        <KPISummary />
      </div>
    </ErrorBoundary>
  );
}

export default DashboardPage;