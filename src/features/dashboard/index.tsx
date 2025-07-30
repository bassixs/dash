import React, { useMemo, useEffect } from 'react';
import { useExcelData } from './hooks/useExcelData';
import { useFilteredData } from './hooks/useFilteredData';
import { useDashboardStore } from '../../shared/store/useDashboardStore';
import StatCard from './components/StatCard';
import FiltersPanel from './components/FiltersPanel';
import Loading from './components/Loading';
import ErrorMessage from './components/Error';
import ErrorBoundary from './components/ErrorBoundary';
import { ProjectRecordInterface } from '@core/models/ProjectRecord';

interface ExcelData {
  data: ProjectRecordInterface[];
  projects: string[];
}

function DashboardPage() {
  const { data, isLoading, error } = useExcelData();
  const { selectedPeriod, selectedProject, setSelectedPeriod } = useDashboardStore();
  const filtered = useFilteredData(data?.data || []);
  const periods = useMemo(() => {
    const allPeriods = [...new Set(data?.data.map((r: ProjectRecordInterface) => r.period) || [])];
    return allPeriods.filter((p) => p && p.match(/^\d{2}\.\d{2}\s*-\s*\d{2}\.\d{2}$/)).sort();
  }, [data]);

  const currentData = useMemo(() => {
    console.log('currentData calculation:', { filteredLength: filtered.length, dataLength: data?.data.length });
    return filtered.length > 0 ? filtered : data?.data || [];
  }, [filtered, data]);

  useEffect(() => {
    if (periods.length > 0 && !selectedPeriod) {
      console.log('Setting initial period:', periods[periods.length - 1]);
      setSelectedPeriod(periods[periods.length - 1]);
    }
  }, [periods, selectedPeriod, setSelectedPeriod]);

  // Улучшенный расчет статистики
  const { totalViews, totalSI, avgER, totalLinks, topProjects, erDistribution } = useMemo(() => {
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

    // Распределение ЕР
    const erRanges = {
      '0-0.1%': 0,
      '0.1-0.5%': 0,
      '0.5-1%': 0,
      '1-2%': 0,
      '2%+': 0
    };

    filtered.forEach(record => {
      const erPercent = record.views > 0 ? (record.si / record.views) * 100 : 0;
      if (erPercent < 0.1) erRanges['0-0.1%']++;
      else if (erPercent < 0.5) erRanges['0.1-0.5%']++;
      else if (erPercent < 1) erRanges['0.5-1%']++;
      else if (erPercent < 2) erRanges['1-2%']++;
      else erRanges['2%+']++;
    });

    return { totalViews, totalSI, avgER, totalLinks, topProjects, erDistribution: erRanges };
  }, [filtered]);

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={error instanceof Error ? error.message : 'Не удалось загрузить данные. Попробуйте снова.'} />;

  console.log('Rendering DashboardPage:', { periods, currentDataLength: currentData.length, selectedProject, selectedPeriod });

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

        {/* Распределение ЕР */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Распределение по ЕР</h3>
          <div className="space-y-2">
            {Object.entries(erDistribution).map(([range, count]) => (
              <div key={range} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{range}</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(count / totalLinks) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Дополнительная информация</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>• Средний ЕР: {avgER}%</p>
            <p>• Всего записей: {totalLinks}</p>
            <p>• Обработано проектов: {topProjects.length}</p>
            {selectedProject && (
              <p>• Выбран проект: {selectedProject}</p>
            )}
            {selectedPeriod && (
              <p>• Выбран период: {selectedPeriod}</p>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default DashboardPage;