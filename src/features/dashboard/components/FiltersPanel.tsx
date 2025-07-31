import React, { useState, useEffect } from 'react';
import { useExcelData } from '../hooks/useExcelData';
import { useDashboardStore } from '../../../shared/store/useDashboardStore';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ProjectRecordInterface } from '@core/models/ProjectRecord';
import { sortPeriods, isValidPeriod } from '@shared/utils/periodUtils';

/**
 * Компонент панели фильтров для дашборда
 */
export default function FiltersPanel() {
  const { data } = useExcelData();
  const { selectedProject, selectedPeriod, setSelectedProject, setSelectedPeriod, resetFilters } = useDashboardStore();
  const [open, setOpen] = useState(false);

  if (!data) return null;

  const projects = [...new Set(data.data.map((r: ProjectRecordInterface) => r.project))].sort();
  
  const periods = sortPeriods(
    [...new Set(data.data.map((r: ProjectRecordInterface) => r.period))]
      .filter(isValidPeriod)
  );

  console.log('FiltersPanel Debug:', {
    allPeriods: [...new Set(data.data.map((r: ProjectRecordInterface) => r.period))],
    filteredPeriods: [...new Set(data.data.map((r: ProjectRecordInterface) => r.period))].filter(isValidPeriod),
    sortedPeriods: periods,
    selectedPeriod
  });

  // Устанавливаем последний период как начальный только если нет выбранного периода
  useEffect(() => {
    if (periods.length > 0 && !selectedPeriod) {
      console.log('FiltersPanel: No period selected, but not setting default');
      // Не устанавливаем период автоматически, чтобы "Все периоды" работало
    }
  }, [periods, selectedPeriod, setSelectedPeriod]);

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="btn-primary p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        aria-label="Фильтры"
      >
        {open ? <XMarkIcon className="w-6 h-6" /> : <FunnelIcon className="w-6 h-6" />}
      </button>

      {open && (
        <div className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl p-6 overflow-y-auto animate-slideIn">
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Фильтры</h2>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Спецпроект
            </label>
            <select
              className="select"
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value || '')}
              aria-label="Выберите спецпроект"
            >
              <option value="">Все спецпроекты</option>
              {projects.map((project) => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
          </div>

          <div className="mb-8">
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Период
            </label>
            <select
              className="select"
              value={selectedPeriod || ''}
              onChange={(e) => setSelectedPeriod(e.target.value || '')}
              aria-label="Выберите период"
            >
              <option value="">Все периоды</option>
              {periods.map((period) => (
                <option key={period} value={period}>{period}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <button
              className="btn-primary flex-1"
              onClick={() => setOpen(false)}
            >
              Сохранить
            </button>
            <button
              className="btn-secondary flex-1"
              onClick={() => {
                resetFilters();
                setOpen(false);
              }}
            >
              Сбросить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

