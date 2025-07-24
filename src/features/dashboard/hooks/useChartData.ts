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
  const projectViewsData = useMemo(() => {
    const filteredData = selectedProject
      ? data.filter((r) => r.project === selectedProject)
      : data;
    return {
      labels: projects,
      datasets: [{
        label: 'Просмотры',
        data: projects.map((p) =>
          filteredData
            .filter((r) => r.project === p)
            .reduce((sum, r) => sum + (Number.isFinite(r.views) ? r.views : 0), 0)
        ),
        backgroundColor: projects.map((_, i) => 
          window.matchMedia('(prefers-color-scheme: dark)').matches 
            ? `hsl(${(i * 360) / projects.length}, 70%, 60%)` 
            : `hsl(${(i * 360) / projects.length}, 70%, 50%)`
        ),
      }],
    };
  }, [data, projects, selectedProject]);

  const erByPeriodData = useMemo(() => {
    const filteredData = selectedProject
      ? data.filter((r) => r.project === selectedProject)
      : data;
    return {
      labels: periods,
      datasets: [{
        label: 'ЕР (%)',
        data: periods.map((period) => {
          const rows = filteredData.filter((r) => r.period === period);
          return rows.length 
            ? parseFloat((rows.reduce((sum, r) => sum + (Number.isFinite(r.er) ? r.er : 0), 0) / rows.length * 100).toFixed(2))
            : 0;
        }),
        borderColor: '#f97316',
        backgroundColor: '#f97316',
        tension: 0.3,
        fill: false,
      }],
    };
  }, [data, periods, selectedProject]);

  return { projectViewsData, erByPeriodData };
}