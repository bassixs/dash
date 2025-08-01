import React, { useEffect } from 'react';
import { Cog6ToothIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import { useKPIStore } from '@shared/store/useKPIStore';
import { useDashboardStore } from '@shared/store/useDashboardStore';

import { useExcelData } from '../hooks/useExcelData';

export default function KPICard() {
  const { selectedProject, selectedPeriod } = useDashboardStore();
  const { data } = useExcelData();
  const {
    currentKPI,
    progress,
    setCurrentKPI,
    updateProgress,
    calculateProgressPercentage,
  } = useKPIStore();

  // Устанавливаем текущий KPI при изменении проекта или периода
  useEffect(() => {
    if (selectedProject && selectedPeriod) {
      setCurrentKPI(selectedProject, selectedPeriod);
    }
  }, [selectedProject, selectedPeriod, setCurrentKPI]);

  // Обновляем прогресс на основе реальных данных
  useEffect(() => {
    if (data?.data && selectedProject && selectedPeriod) {
      const projectData = data.data.filter(
        (record) => record.project === selectedProject && record.period === selectedPeriod
      );
      
      if (projectData.length > 0) {
        const totalViews = projectData.reduce((sum, record) => sum + record.views, 0);
        const totalSI = projectData.reduce((sum, record) => sum + record.si, 0);
        const avgER = totalViews > 0 ? (totalSI / totalViews) * 100 : 0;
        
        updateProgress(selectedProject, selectedPeriod, {
          views: totalViews,
          si: totalSI,
          er: avgER,
        });
      }
    }
  }, [data, selectedProject, selectedPeriod, updateProgress]);

  const currentProgress = progress.find(
    (p) => p.project === selectedProject && p.period === selectedPeriod
  );

  const progressPercentages = calculateProgressPercentage(selectedProject, selectedPeriod);

  // Если нет периода, не показываем карточку
  if (!selectedPeriod) {
    return null;
  }

  // Если нет KPI для текущего проекта и периода, показываем сообщение о необходимости установить KPI
  if (!currentKPI) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Cog6ToothIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            KPI для {selectedProject || 'всех проектов'}
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Для периода <strong>{selectedPeriod}</strong> не установлены KPI
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Нажмите кнопку настроек, чтобы установить цели
          </p>
        </div>
      </div>
    );
  }

  // Если нет прогресса, не показываем детали
  if (!currentProgress) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Cog6ToothIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            KPI для {selectedProject || 'всех проектов'}
          </h3>
        </div>
        <div className="text-center py-4">
          <p className="text-gray-600 dark:text-gray-400">
            Загрузка данных прогресса...
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
          KPI для {selectedProject}
        </h3>
      </div>

      <div className="space-y-4">
        {/* Просмотры */}
        <div>
          <div className="flex justify-between items-center mb-2">
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
            <span>{currentProgress.currentViews.toLocaleString()} / {currentKPI.targetViews.toLocaleString()}</span>
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
          <div className="flex justify-between items-center mb-2">
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
            <span>{currentProgress.currentSI.toLocaleString()} / {currentKPI.targetSI.toLocaleString()}</span>
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
          <div className="flex justify-between items-center mb-2">
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
            <span>{currentProgress.currentER.toFixed(1)}% / {currentKPI.targetER.toFixed(1)}%</span>
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
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Общий прогресс
          </span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {((progressPercentages.views + progressPercentages.si + progressPercentages.er) / 3).toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min((progressPercentages.views + progressPercentages.si + progressPercentages.er) / 3, 100)}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
} 