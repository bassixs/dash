import React, { useState, useEffect } from 'react';
import { useDashboardStore } from '../../../shared/store/useDashboardStore';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useExcelData } from '../hooks/useExcelData';
import { saveAs } from 'file-saver';
import { ProjectRecordInterface } from '../../../core/models/ProjectRecord';

interface ExcelData {
  data: ProjectRecordInterface[];
  projects: string[];
}

/**
 * Компонент панели фильтров для выбора проекта и периода.
 */
export default function FiltersPanel() {
  const {
    selectedProject,
    selectedPeriod,
    setSelectedProject,
    setSelectedPeriod,
    resetFilters,
  } = useDashboardStore();
  const [open, setOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState<'success' | 'error' | null>(null);
  const { data } = useExcelData();

  if (!data) return null;

  const periods = [...new Set(data.data.map((r: ProjectRecordInterface) => r.period))]
    .filter((p) => p && p.match(/^\d{2}\.\d{2}\s*-\s*\d{2}\.\d{2}$/))
    .sort();

  // Устанавливаем последний период как начальный только если нет выбранного периода
  useEffect(() => {
    if (periods.length > 0 && !selectedPeriod) {
      console.log('FiltersPanel: Setting initial period:', periods[periods.length - 1]);
      setSelectedPeriod(periods[periods.length - 1]);
    }
  }, [periods, selectedPeriod, setSelectedPeriod]);

  console.log('FiltersPanel:', { periods, selectedProject, selectedPeriod });

  const exportCSV = () => {
    try {
      const rows = data.data.filter((row) => {
        const matchProject = selectedProject ? row.project === selectedProject : true;
        const matchPeriod = selectedPeriod ? row.period === selectedPeriod : true;
        return matchProject && matchPeriod;
      });

      if (rows.length === 0) {
        setExportStatus('error');
        setTimeout(() => setExportStatus(null), 3000);
        return;
      }

      const headers = ['Ссылка', 'Просмотры', 'СИ', 'ЕР', 'Спецпроект', 'Период'];
      const csvContent = [
        headers.join(','),
        ...rows.map((r: ProjectRecordInterface) =>
          `"${r.link}",${r.views},${r.si},${(r.er * 100).toFixed(2)},"${r.project}","${r.period}"`
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'export.csv');
      setExportStatus('success');
      setTimeout(() => setExportStatus(null), 3000);
    } catch (err) {
      console.error('Export CSV error:', err);
      setExportStatus('error');
      setTimeout(() => setExportStatus(null), 3000);
    }
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

      {open && (
        <div className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl p-6 overflow-y-auto animate-slideIn">
          <h2 className="text-xl font-bold mb-4">Фильтры</h2>

          {exportStatus === 'success' && (
            <div className="text-green-500 mb-4">Файл успешно экспортирован!</div>
          )}
          {exportStatus === 'error' && (
            <div className="text-red-500 mb-4">Ошибка при экспорте. Данных нет или произошла ошибка.</div>
          )}

          <div className="mb-4">
            <label className="block mb-1 text-sm text-gray-600 dark:text-gray-300">Спецпроект</label>
            <select
              className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value || '')}
              aria-label="Выберите спецпроект"
            >
              <option value="">Все спецпроекты</option>
              {data.projects.map((project) => (
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

          <button
            onClick={exportCSV}
            className="w-full mt-4 p-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Экспорт в CSV
          </button>
        </div>
      )}
    </div>
  );
}

