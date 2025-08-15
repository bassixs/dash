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
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-95"
        >
          <FunnelIcon className="w-5 h-5" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-14 right-0 modern-card p-6 min-w-72 animate-scaleIn">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Фильтры</h3>
          
          <div className="space-y-5">
            {/* Фильтр по проекту */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Проект
              </label>
              <select
                value={selectedProject || ''}
                onChange={(e) => setSelectedProject(e.target.value || '')}
                className="input"
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
                className="input"
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
              className="btn-secondary w-full"
            >
              Сбросить фильтры
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

