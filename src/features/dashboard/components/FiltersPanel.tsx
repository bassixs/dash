import React, { useState, useMemo } from 'react';
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
          className="btn-primary p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <FunnelIcon className="w-5 h-5" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-16 right-0 filter-panel light dark:dark min-w-80 animate-slideIn">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Фильтры</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Фильтр по проекту */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Проект
              </label>
              <select
                value={selectedProject || ''}
                onChange={(e) => setSelectedProject(e.target.value || '')}
                className="select"
              >
                <option value="">Все проекты</option>
                {projects.map((project) => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>

            {/* Фильтр по периоду */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Период
              </label>
              <select
                value={selectedPeriod || ''}
                onChange={(e) => setSelectedPeriod(e.target.value || '')}
                className="select"
              >
                <option value="">Все периоды</option>
                {periods.map((period) => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>

            {/* Кнопка сброса */}
            <button
              onClick={() => {
                resetFilters();
                setIsOpen(false);
              }}
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

