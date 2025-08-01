import React, { useState } from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { useDashboardStore } from '@shared/store/useDashboardStore';

export default function FiltersPanel() {
  const { selectedProject, selectedPeriod, setSelectedProject, setSelectedPeriod, resetFilters } = useDashboardStore();
  const [isOpen, setIsOpen] = useState(false);

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
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Все проекты</option>
                <option value="Проект 1">Проект 1</option>
                <option value="Проект 2">Проект 2</option>
                <option value="Проект 3">Проект 3</option>
              </select>
            </div>

            {/* Фильтр по периоду */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Период
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Все периоды</option>
                <option value="07.07 - 13.07">07.07 - 13.07</option>
                <option value="14.07 - 20.07">14.07 - 20.07</option>
                <option value="21.07 - 27.07">21.07 - 27.07</option>
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

