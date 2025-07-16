import React, { useState } from 'react';
import { useDashboardStore } from '../../../shared/store/useDashboardStore';
import { motion, AnimatePresence } from 'framer-motion';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useExcelData } from '../hooks/useExcelData';
import { saveAs } from 'file-saver';

export default function FiltersPanel() {
  const {
    selectedProject,
    selectedPeriod,
    setSelectedPeriod,
    setSelectedProject,
    resetFilters
  } = useDashboardStore();

  const [open, setOpen] = useState(false);
  const { data } = useExcelData();

  if (!data) return null;

  const periods = [...new Set(data.data.map(r => r.period))];
  const projects = data.projects;

  const exportCSV = () => {
  const rows = data.data.filter((row) => {
    const matchProject = selectedProject ? row.project === selectedProject : true;
    const matchPeriod = selectedPeriod ? row.period === selectedPeriod : true;
    return matchProject && matchPeriod;
  });

  if (rows.length === 0) return;

  const headers = ['Ссылка', 'Просмотры', 'СИ', 'ЕР', 'Спецпроект', 'Период'];
  const csvContent = [
    headers.join(','),
    ...rows.map((r) =>
      `"${r.link}",${r.views},${r.si},${(r.er * 100).toFixed(2)},"${r.project}","${r.period}"`
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, 'export.csv');
};


  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition"
        aria-label="Фильтры"
      >
        {open ? <XMarkIcon className="w-6 h-6" /> : <FunnelIcon className="w-6 h-6" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="filters"
            initial={{ opacity: 0, x: 200 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 200 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl p-6 overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-4">Фильтры</h2>

            <div className="mb-4">
              <label className="block mb-1 text-sm text-gray-600 dark:text-gray-300">Спецпроект</label>
              <select
                className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
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
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
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
                Применить
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

            <button
              onClick={exportCSV}
              className="w-full mt-4 p-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Экспорт в CSV
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

