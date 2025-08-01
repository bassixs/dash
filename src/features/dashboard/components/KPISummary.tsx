import React, { useState, useMemo, useEffect } from 'react';
import { Cog6ToothIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useKPIStore } from '@shared/store/useKPIStore';
import { useDashboardStore } from '@shared/store/useDashboardStore';

import { useExcelData } from '../hooks/useExcelData';

export default function KPISummary() {
  const { selectedPeriod } = useDashboardStore();
  const { data } = useExcelData();
  const {
    kpis,
    progress,
    updateProgress,
    calculateProgressPercentage,
  } = useKPIStore();

  const [isExpanded, setIsExpanded] = useState(false);

  // Проверяем, есть ли KPI для текущего периода
  const hasKPIForPeriod = useMemo(() => {
    return kpis.some(kpi => kpi.period === selectedPeriod);
  }, [kpis, selectedPeriod]);

  // Получаем все KPI для текущего периода
  const periodKPIs = useMemo(() => {
    return kpis.filter(kpi => kpi.period === selectedPeriod);
  }, [kpis, selectedPeriod]);

  // Рассчитываем общий прогресс по всем проектам
  const overallProgress = useMemo(() => {
    let totalViewsProgress = 0;
    let totalSIProgress = 0;
    let totalERProgress = 0;
    let validProjects = 0;

    periodKPIs.forEach(kpi => {
      const currentProgress = progress.find(
        (p) => p.project === kpi.project && p.period === selectedPeriod
      );
      
      if (currentProgress) {
        const progressPercentages = calculateProgressPercentage(kpi.project, selectedPeriod);
        totalViewsProgress += progressPercentages.views;
        totalSIProgress += progressPercentages.si;
        totalERProgress += progressPercentages.er;
        validProjects++;
      }
    });

    if (validProjects === 0) return { views: 0, si: 0, er: 0 };

    return {
      views: totalViewsProgress / validProjects,
      si: totalSIProgress / validProjects,
      er: totalERProgress / validProjects,
    };
  }, [periodKPIs, progress, selectedPeriod, calculateProgressPercentage]);

  // Обновляем прогресс для всех проектов в текущем периоде
  useEffect(() => {
    if (data?.data && selectedPeriod) {
      periodKPIs.forEach(kpi => {
        const projectData = data.data.filter(
          (record) => record.project === kpi.project && record.period === selectedPeriod
        );
        
        if (projectData.length > 0) {
          const totalViews = projectData.reduce((sum, record) => sum + record.views, 0);
          const totalSI = projectData.reduce((sum, record) => sum + record.si, 0);
          const avgER = totalViews > 0 ? (totalSI / totalViews) * 100 : 0;
          
          updateProgress(kpi.project, selectedPeriod, {
            views: totalViews,
            si: totalSI,
            er: avgER,
          });
        }
      });
    }
  }, [data, selectedPeriod, periodKPIs, updateProgress]);

  // Если нет KPI для текущего периода, не показываем карточку
  if (!selectedPeriod || !hasKPIForPeriod) {
    return null;
  }

  // Если нет данных прогресса, показываем загрузку
  const hasProgressData = progress.some(p => p.period === selectedPeriod);
  if (!hasProgressData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cog6ToothIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              KPI для периода {selectedPeriod}
            </span>
          </div>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-blue-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressTextColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600 dark:text-green-400';
    if (percentage >= 80) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      {/* Компактная карточка */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cog6ToothIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              KPI для периода {selectedPeriod}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({periodKPIs.length} проект{periodKPIs.length > 1 ? 'ов' : ''})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${getProgressTextColor(overallProgress.views)}`}>
              {overallProgress.views.toFixed(1)}%
            </span>
            {isExpanded ? (
              <ChevronUpIcon className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </div>
        
        {/* Общий прогресс-бар */}
        <div className="mt-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(overallProgress.views)}`}
              style={{ width: `${Math.min(overallProgress.views, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Раскрытая секция */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {periodKPIs.map((kpi) => {
              const currentProgress = progress.find(
                (p) => p.project === kpi.project && p.period === selectedPeriod
              );
              
              if (!currentProgress) return null;

              const progressPercentages = calculateProgressPercentage(kpi.project, selectedPeriod);

              return (
                <div key={kpi.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">
                    {kpi.project}
                  </h4>
                  
                  <div className="space-y-2">
                    {/* Просмотры */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Просмотры</span>
                        <span className={`text-xs font-bold ${getProgressTextColor(progressPercentages.views)}`}>
                          {progressPercentages.views.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all duration-300 ${getProgressColor(progressPercentages.views)}`}
                          style={{ width: `${Math.min(progressPercentages.views, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* СИ */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400">СИ</span>
                        <span className={`text-xs font-bold ${getProgressTextColor(progressPercentages.si)}`}>
                          {progressPercentages.si.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all duration-300 ${getProgressColor(progressPercentages.si)}`}
                          style={{ width: `${Math.min(progressPercentages.si, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* ЕР */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400">ЕР</span>
                        <span className={`text-xs font-bold ${getProgressTextColor(progressPercentages.er)}`}>
                          {progressPercentages.er.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all duration-300 ${getProgressColor(progressPercentages.er)}`}
                          style={{ width: `${Math.min(progressPercentages.er, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 