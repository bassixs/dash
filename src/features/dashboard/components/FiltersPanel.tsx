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
        className="p-2 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition"
        aria-label="Фильтры"
      >
        {open ? <XMarkIcon className="w-6 h-6" /> : <FunnelIcon className="w-6 h-6" />}
      </button>

      {open && (
        <div className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl p-6 overflow-y-auto animate-slideIn">
          <h2 className="text-xl font-bold mb-4">Фильтры</h2>

          <div className="mb-4">
            <label className="block mb-1 text-sm text-gray-600 dark:text-gray-300">Спецпроект</label>
            <select
              className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
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

          <div className="mb-6">
            <label className="block mb-1 text-sm text-gray-600 dark:text-gray-300">Период</label>
            <select
              className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
              onClick={() => setOpen(false)}
            >
              Сохранить
            </button>
            <button
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 p-2 rounded"
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

