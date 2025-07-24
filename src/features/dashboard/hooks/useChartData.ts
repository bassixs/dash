import { useMemo } from 'react';
import { ProjectRecordInterface } from '../../../core/models/ProjectRecord';
import { ChartData } from 'chart.js';

/**
 * Хук для подготовки данных графиков.
 * @param data Массив записей
 * @param projects Список проектов
 * @param periods Список периодов
 * @param selectedProject Выбранный проект (опционально)
 * @param metric Тип метрики ('views' или 'er')
 * @returns Данные для графика
 */
export function useChartData(
  data: ProjectRecordInterface[],
  projects: string[],
  periods: string[],
  selectedProject: string | '',
  metric: 'views' | 'er'
): ChartData<'line'> {
  return useMemo(() => {
    if (selectedProject) {
      // График для выбранного спецпроекта
      return {
        labels: periods,
        datasets: [{
          label: metric === 'views' ? 'Просмотры' : 'ЕР (%)',
          data: periods.map((period) => {
            const rows = data.filter((r) => r.period === period && r.project === selectedProject);
            if (metric === 'views') {
              return rows.reduce((sum, r) => sum + r.views, 0);
            }
            return rows.length ? parseFloat((rows.reduce((sum, r) => sum + r.er, 0) / rows.length * 100).toFixed(2)) : 0;
          }),
          borderColor: '#f97316',
          backgroundColor: '#f97316',
          tension: 0.3,
          fill: false,
        }],
      };
    } else {
      // График для всех спецпроектов по периодам
      return {
        labels: periods,
        datasets: projects.map((project, i) => ({
          label: `${project} (${metric === 'views' ? 'Просмотры' : 'ЕР (%)'})`,
          data: periods.map((period) => {
            const rows = data.filter((r) => r.period === period && r.project === project);
            if (metric === 'views') {
              return rows.reduce((sum, r) => sum + r.views, 0);
            }
            return rows.length ? parseFloat((rows.reduce((sum, r) => sum + r.er, 0) / rows.length * 100).toFixed(2)) : 0;
          }),
          borderColor: `hsl(${(i * 360) / projects.length}, 70%, 50%)`,
          backgroundColor: `hsl(${(i * 360) / projects.length}, 70%, 50%)`,
          tension: 0.3,
          fill: false,
        })),
      };
    }
  }, [data, projects, periods, selectedProject, metric]);
}