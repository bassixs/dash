import React, { useState, useEffect } from 'react';
import { FunnelIcon, XMarkIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { ProjectRecordInterface } from '@core/models/ProjectRecord';
import { sortPeriodsSimple, isValidPeriod, getPeriodsForDisplay } from '@shared/utils/periodUtils';

import { useExcelData } from '../hooks/useExcelData';
import { useDashboardStore } from '../../../shared/store/useDashboardStore';

interface FiltersPanelProps {
  onOpenKPISettings?: () => void;
}

/**
 * Компонент панели фильтров для дашборда
 */
export default function FiltersPanel({ onOpenKPISettings }: FiltersPanelProps) {
  const { data } = useExcelData();
  const { selectedProject, selectedPeriod, setSelectedProject, setSelectedPeriod, resetFilters } = useDashboardStore();
  const [open, setOpen] = useState(false);

  // Перемещаем useEffect в начало компонента
  useEffect(() => {
    if (data && data.data.length > 0) {
      const allPeriods = [...new Set(data.data.map((r: ProjectRecordInterface) => r.period))];
      const validPeriods = allPeriods.filter(isValidPeriod);
      const sortedPeriods = sortPeriodsSimple(validPeriods);
      
      if (sortedPeriods.length > 0 && !selectedPeriod) {
        console.log('FiltersPanel: No period selected, but not setting default');
        // Не устанавливаем период автоматически, чтобы "Все периоды" работало
      }
    }
  }, [data, selectedPeriod, setSelectedPeriod]);

  if (!data) return null;

  const projects = [...new Set(data.data.map((r: ProjectRecordInterface) => r.project))].sort();
  
  // Получаем все периоды из данных
  const allPeriods = [...new Set(data.data.map((r: ProjectRecordInterface) => r.period))];
  console.log('All periods from data:', allPeriods);
  
  // Фильтруем валидные периоды
  const validPeriods = allPeriods.filter(isValidPeriod);
  console.log('Valid periods:', validPeriods);
  
  // Сортируем периоды (используем простую логику)
  const sortedPeriods = sortPeriodsSimple(validPeriods);
  console.log('Sorted periods (simple):', sortedPeriods);
  
  // Получаем периоды в обратном порядке для отображения (последние сверху)
  const displayPeriods = getPeriodsForDisplay(sortedPeriods);
  console.log('Display periods:', displayPeriods);

  console.log('FiltersPanel Debug:', {
    allPeriods: allPeriods,
    validPeriods: validPeriods,
    sortedPeriods: sortedPeriods,
    displayPeriods: displayPeriods,
    selectedPeriod,
    periodsLength: sortedPeriods.length,
    firstPeriod: sortedPeriods[0],
    lastPeriod: sortedPeriods[sortedPeriods.length - 1]
  });

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex gap-2">
        {/* Кнопка KPI */}
        {selectedProject && selectedPeriod && onOpenKPISettings && (
          <button
            onClick={onOpenKPISettings}
            className="btn-primary p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            aria-label="Настройки KPI"
            title="Настройки KPI"
          >
            <Cog6ToothIcon className="w-6 h-6" />
          </button>
        )}
        
        {/* Кнопка фильтров */}
        <button
          onClick={() => setOpen(!open)}
          className="btn-primary p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          aria-label="Фильтры"
        >
          {open ? <XMarkIcon className="w-6 h-6" /> : <FunnelIcon className="w-6 h-6" />}
        </button>
      </div>

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
              {displayPeriods.map((period) => (
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

