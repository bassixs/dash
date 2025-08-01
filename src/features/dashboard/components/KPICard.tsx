import React, { useEffect, useMemo } from 'react';
import { Cog6ToothIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import { useKPIStore } from '@shared/store/useKPIStore';
import { useDashboardStore } from '@shared/store/useDashboardStore';

import { useExcelData } from '../hooks/useExcelData';

export default function KPICard() {
  const { selectedPeriod } = useDashboardStore();
  const { data } = useExcelData();
  const {
    kpis,
    progress,
    updateProgress,
    calculateProgressPercentage,
  } = useKPIStore();

  // Проверяем, есть ли KPI для текущего периода
  const hasKPIForPeriod = useMemo(() => {
    return kpis.some(kpi => kpi.period === selectedPeriod);
  }, [kpis, selectedPeriod]);

  // Получаем все KPI для текущего периода
  const periodKPIs = useMemo(() => {
    return kpis.filter(kpi => kpi.period === selectedPeriod);
  }, [kpis, selectedPeriod]);

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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Cog6ToothIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            KPI для периода {selectedPeriod}
          </h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Обновление данных прогресса...
          </p>
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

  const getTrendIcon = (percentage: number) => {
    if (percentage >= 100) return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
    if (percentage >= 80) return <ArrowTrendingUpIcon className="w-4 h-4 text-blue-500" />;
    return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Cog6ToothIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          KPI для периода {selectedPeriod}
        </h3>
      </div>

      <div className="space-y-4">
        {periodKPIs.map((kpi) => {
          const currentProgress = progress.find(
            (p) => p.project === kpi.project && p.period === selectedPeriod
          );
          
          if (!currentProgress) return null;

          const progressPercentages = calculateProgressPercentage(kpi.project, selectedPeriod);

          return (
            <div key={kpi.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                {kpi.project}
              </h4>
              
              <div className="space-y-3">
                {/* Просмотры */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Просмотры
                    </span>
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-bold ${getProgressTextColor(progressPercentages.views)}`}>
                        {progressPercentages.views.toFixed(1)}%
                      </span>
                      {getTrendIcon(progressPercentages.views)}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>{currentProgress.currentViews.toLocaleString()} / {kpi.targetViews.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progressPercentages.views)}`}
                      style={{ width: `${Math.min(progressPercentages.views, 100)}%` }}
                    />
                  </div>
                </div>

                {/* СИ */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      СИ
                    </span>
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-bold ${getProgressTextColor(progressPercentages.si)}`}>
                        {progressPercentages.si.toFixed(1)}%
                      </span>
                      {getTrendIcon(progressPercentages.si)}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>{currentProgress.currentSI.toLocaleString()} / {kpi.targetSI.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progressPercentages.si)}`}
                      style={{ width: `${Math.min(progressPercentages.si, 100)}%` }}
                    />
                  </div>
                </div>

                {/* ЕР */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      ЕР
                    </span>
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-bold ${getProgressTextColor(progressPercentages.er)}`}>
                        {progressPercentages.er.toFixed(1)}%
                      </span>
                      {getTrendIcon(progressPercentages.er)}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>{currentProgress.currentER.toFixed(1)}% / {kpi.targetER.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progressPercentages.er)}`}
                      style={{ width: `${Math.min(progressPercentages.er, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Общий прогресс */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Общий прогресс
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {((progressPercentages.views + progressPercentages.si + progressPercentages.er) / 3).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((progressPercentages.views + progressPercentages.si + progressPercentages.er) / 3, 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 