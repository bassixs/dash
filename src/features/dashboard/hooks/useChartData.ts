import { useMemo } from 'react';
import { ProjectRecordInterface } from '../../../core/models/ProjectRecord';
import { ChartData } from 'chart.js';

/**
 * Хук для подготовки данных диаграмм по проектам
 */
export function useProjectsChartData(
  data: ProjectRecordInterface[],
  selectedPeriod: string | '',
  metric: 'views' | 'er'
): ChartData<'doughnut'> {
  return useMemo(() => {
    // Группируем данные по проектам
    const projectData = data.reduce((acc, record) => {
      // Фильтруем по периоду, если выбран
      if (selectedPeriod && record.period !== selectedPeriod) {
        return acc;
      }

      if (!acc[record.project]) {
        acc[record.project] = {
          views: 0,
          si: 0,
          count: 0
        };
      }

      acc[record.project].views += record.views;
      acc[record.project].si += record.si;
      acc[record.project].count += 1;

      return acc;
    }, {} as Record<string, { views: number; si: number; count: number }>);

    const projects = Object.keys(projectData);
    const colors = [
      '#FF6384', '#36A2EB', '#4BC0C0', '#9966FF', 
      '#FF9F40', '#FF6384', '#C9CBCF', '#FF6384'
    ];

    return {
      labels: projects,
      datasets: [{
        data: projects.map(project => {
          if (metric === 'views') {
            return projectData[project].views;
          } else {
            // Средний ЕР для проекта - используем формулу СИ/просмотры * 100
            const totalViews = projectData[project].views;
            const totalSI = projectData[project].si;
            return totalViews > 0 ? parseFloat(((totalSI / totalViews) * 100).toFixed(2)) : 0;
          }
        }),
        backgroundColor: projects.map((_, index) => colors[index % colors.length]),
        borderColor: projects.map((_, index) => colors[index % colors.length]),
        borderWidth: 2,
      }],
    };
  }, [data, selectedPeriod, metric]);
}

/**
 * Хук для подготовки данных графика по дням недели
 */
export function useWeeklyChartData(
  data: ProjectRecordInterface[],
  selectedProject: string | '',
  selectedPeriod: string | ''
): ChartData<'line'> {
  return useMemo(() => {
    // Фильтруем данные по выбранному проекту и периоду
    const filteredData = data.filter(record => {
      const matchProject = selectedProject ? record.project === selectedProject : true;
      const matchPeriod = selectedPeriod ? record.period === selectedPeriod : true;
      return matchProject && matchPeriod;
    });

    // Группируем по дням недели (предполагаем, что в данных есть информация о днях)
    // Для демонстрации используем простую группировку по записям
    const dailyData = filteredData.reduce((acc, record, index) => {
      const day = `День ${Math.floor(index / 10) + 1}`; // Упрощенная группировка
      if (!acc[day]) {
        acc[day] = { views: 0, si: 0 };
      }
      acc[day].views += record.views;
      acc[day].si += record.si;
      return acc;
    }, {} as Record<string, { views: number; si: number }>);

    const days = Object.keys(dailyData);

    return {
      labels: days,
      datasets: [
        {
          label: 'Просмотры',
          data: days.map(day => dailyData[day].views),
          borderColor: '#f97316',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          tension: 0.3,
          fill: true,
        },
        {
          label: 'Средний ЕР (%)',
          data: days.map(day => {
            const views = dailyData[day].views;
            const si = dailyData[day].si;
            return views > 0 ? parseFloat(((si / views) * 100).toFixed(2)) : 0;
          }),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
          fill: true,
          yAxisID: 'y1',
        }
      ],
    };
  }, [data, selectedProject, selectedPeriod]);
}

/**
 * Хук для подготовки данных ЕР диаграммы
 */
export function useERChartData(
  data: ProjectRecordInterface[],
  selectedPeriod: string | ''
): ChartData<'doughnut'> {
  return useMemo(() => {
    // Фильтруем по периоду, если выбран
    const filteredData = selectedPeriod 
      ? data.filter(record => record.period === selectedPeriod)
      : data;

    // Группируем по диапазонам ЕР
    const erRanges = {
      '0-0.1%': 0,
      '0.1-0.5%': 0,
      '0.5-1%': 0,
      '1-2%': 0,
      '2%+': 0,
    };

    filteredData.forEach(record => {
      const erPercent = record.views > 0 ? (record.si / record.views) * 100 : 0;
      if (erPercent < 0.1) erRanges['0-0.1%']++;
      else if (erPercent < 0.5) erRanges['0.1-0.5%']++;
      else if (erPercent < 1) erRanges['0.5-1%']++;
      else if (erPercent < 2) erRanges['1-2%']++;
      else erRanges['2%+']++;
    });

    const ranges = Object.keys(erRanges);
    const colors = ['#FF6384', '#36A2EB', '#4BC0C0', '#9966FF', '#FF9F40'];

    return {
      labels: ranges,
      datasets: [{
        data: ranges.map(range => erRanges[range as keyof typeof erRanges]),
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 2,
      }],
    };
  }, [data, selectedPeriod]);
}