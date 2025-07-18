import { useMemo } from 'react';
import { ProjectRecord } from '../../../core/models/ProjectRecord';

/**
 * Хук для подготовки данных графиков.
 * @param data Массив записей
 * @param projects Список проектов
 * @param periods Список периодов
 * @param selectedProject Выбранный проект (опционально)
 * @returns Данные для графиков просмотров и ЕР
 */
export function useChartData(data: ProjectRecord[], projects: string[], periods: string[], selectedProject: string | '') {
  const projectViewsData = useMemo(() => ({
    labels: projects.filter((p) => data.some((r) => r.project === p)),
    datasets: [{
      label: 'Просмотры',
      data: projects.map((p) =>
        data.filter((r) => r.project === p).reduce((sum, r) => sum + r.views, 0)
      ),
      backgroundColor: projects.map((_, i) => `hsl(${(i * 360) / projects.length}, 70%, 50%)`),
    }],
  }), [data, projects]);

  const erByPeriodData = useMemo(() => ({
    labels: periods,
    datasets: [{
      label: 'ЕР (%)',
      data: periods.map((period) => {
        const rows = data.filter((r) => r.period === period && (!selectedProject || r.project === selectedProject));
        return rows.length ? (rows.reduce((sum, r) => sum + r.er, 0) / rows.length * 100).toFixed(2) : 0;
      }),
      borderColor: '#f97316',
      backgroundColor: '#f97316',
      tension: 0.3,
      fill: false,
    }],
  }), [data, periods, selectedProject]);

  return { projectViewsData, erByPeriodData };
}