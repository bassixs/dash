import React, { useState, useMemo } from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { ProjectRecordInterface } from '@core/models/ProjectRecord';
import { sortPeriodsSimple, isValidPeriod, getPeriodsForDisplay } from '@shared/utils/periodUtils';
import { useDashboardStore } from '@shared/store/useDashboardStore';

import { useExcelData } from '../hooks/useExcelData';

export default function FiltersPanel() {
  const { data } = useExcelData();
  const { selectedProject, selectedPeriod, setSelectedProject, setSelectedPeriod, resetFilters } = useDashboardStore();
  const [isOpen, setIsOpen] = useState(false);

  // Получаем уникальные проекты из данных
  const projects = data?.data ? [...new Set(data.data.map((r: ProjectRecordInterface) => r.project))].sort() : [];

  // Получаем периоды из данных
  const periods = useMemo(() => {
    if (!data?.data) return [];
    
    const allPeriods = [...new Set(data.data.map((r: ProjectRecordInterface) => r.period))];
    const validPeriods = allPeriods.filter(isValidPeriod);
    const sortedPeriods = sortPeriodsSimple(validPeriods);
    return getPeriodsForDisplay(sortedPeriods);
  }, [data]);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg transition-colors"
        >
          <FunnelIcon className="w-5 h-5" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-12 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 min-w-64">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Фильтры</h3>
          
          <div className="space-y-4">
            {/* Фильтр по проекту */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Проект
              </label>
              <select
                value={selectedProject || ''}
                onChange={(e) => setSelectedProject(e.target.value || '')}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Все проекты</option>
                {projects.map((project) => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>

            {/* Фильтр по периоду */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Период
              </label>
              <select
                value={selectedPeriod || ''}
                onChange={(e) => setSelectedPeriod(e.target.value || '')}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Все периоды</option>
                {periods.map((period) => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>

            {/* Кнопка сброса */}
            <button
              onClick={resetFilters}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Сбросить фильтры
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

