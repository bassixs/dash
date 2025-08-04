import React, { useState, useMemo, useCallback } from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ProjectRecordInterface } from '@core/models/ProjectRecord';
import { sortPeriodsSimple, isValidPeriod, getPeriodsForDisplay } from '@shared/utils/periodUtils';
import { useDashboardStore } from '@shared/store/useDashboardStore';

import { useExcelData } from '../hooks/useExcelData';

export default function FiltersPanel() {
  const { data } = useExcelData();
  const { selectedProject, selectedPeriod, setSelectedProject, setSelectedPeriod, resetFilters } = useDashboardStore();
  const [isOpen, setIsOpen] = useState(false);

  // Получаем уникальные проекты из данных
  const projects = useMemo(() => {
    return data?.data ? [...new Set(data.data.map((r: ProjectRecordInterface) => r.project))].sort() : [];
  }, [data?.data]);

  // Получаем периоды из данных
  const periods = useMemo(() => {
    if (!data?.data) return [];
    
    const allPeriods = [...new Set(data.data.map((r: ProjectRecordInterface) => r.period))];
    const validPeriods = allPeriods.filter(isValidPeriod);
    const sortedPeriods = sortPeriodsSimple(validPeriods);
    return getPeriodsForDisplay(sortedPeriods);
  }, [data]);

  const handleProjectChange = useCallback((value: string) => {
    setSelectedProject(value);
  }, [setSelectedProject]);

  const handlePeriodChange = useCallback((value: string) => {
    setSelectedPeriod(value);
  }, [setSelectedPeriod]);

  const handleReset = useCallback(() => {
    resetFilters();
    setIsOpen(false);
  }, [resetFilters]);

  const toggleFilters = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Кнопка фильтров */}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleFilters}
          className="btn-modern hover-lift flex items-center gap-2"
          aria-label="Открыть фильтры"
        >
          <FunnelIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Фильтры</span>
        </button>
      </div>

      {/* Панель фильтров */}
      {isOpen && (
        <div className="card-modern neo mb-6 animate-fade-in-scale">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold gradient-text">Фильтры</h3>
            <button
              onClick={toggleFilters}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Закрыть фильтры"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Фильтр по проекту */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Проект
              </label>
              <select
                value={selectedProject || ''}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Все проекты</option>
                {projects.map((project) => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>

            {/* Фильтр по периоду */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Период
              </label>
              <select
                value={selectedPeriod || ''}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Все периоды</option>
                {periods.map((period) => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Кнопка сброса */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors hover-lift"
            >
              Сбросить фильтры
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

