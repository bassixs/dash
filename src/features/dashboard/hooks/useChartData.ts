import { useMemo } from 'react';
import { ProjectRecordInterface } from '../../../core/models/ProjectRecord';
import { ChartData } from 'chart.js';

/**
 * Хук для подготовки данных графиков.
 * @param data Массив записей
 * @param projects Список проектов
 * @param periods Список периодов
 * @param selectedProject Выбранный проект (опционально)
 * @returns Данные для графиков просмотров и ЕР
 */
export function useChartData(
  data: ProjectRecordInterface[],
  projects: string[],
  periods: string[],
  selectedProject: string | ''
): { projectViewsData: ChartData<'bar'>; erByPeriodData: ChartData<'line'> } {
  const projectViewsData = useMemo(() => ({
    labels: projects,
    datasets: [{
      label: 'Просмотры',
      data: projects.map((p) =>
        data.filter((r) => r.project === p).reduce((sum, r) => sum + r.views, 0)
      ),
      backgroundColor: projects.map((_, i) => 
        window.matchMedia('(prefers-color-scheme: dark)').matches 
          ? `hsl(${(i * 360) / projects.length}, 70%, 60%)` 
          : `hsl(${(i * 360) / projects.length}, 70%, 50%)`
      ),
    }],
  }), [data, projects]);

  const erByPeriodData = useMemo(() => ({
    labels: periods,
    datasets: [{
      label: 'ЕР (%)',
      data: periods.map((period) => {
        const rows = data.filter((r) => r.period === period && (!selectedProject || r.project === selectedProject));
        return rows.length ? parseFloat((rows.reduce((sum, r) => sum + r.er, 0) / rows.length * 100).toFixed(2)) : 0;
      }),
      borderColor: '#f97316',
      backgroundColor: '#f97316',
      tension: 0.3,
      fill: false,
    }],
  }), [data, periods, selectedProject]);

  return { projectViewsData, erByPeriodData };
}