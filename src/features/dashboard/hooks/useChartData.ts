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
          er: [],
          count: 0
        };
      }

      acc[record.project].views += record.views;
      acc[record.project].er.push(record.er);
      acc[record.project].count += 1;

      return acc;
    }, {} as Record<string, { views: number; er: number[]; count: number }>);

    const projects = Object.keys(projectData);
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
      '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
    ];

    return {
      labels: projects,
      datasets: [{
        data: projects.map(project => {
          if (metric === 'views') {
            return projectData[project].views;
          } else {
            // Средний ЕР для проекта
            const avgER = projectData[project].er.reduce((sum, er) => sum + er, 0) / projectData[project].er.length;
            return parseFloat((avgER * 100).toFixed(2));
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
        acc[day] = { views: 0, er: [] };
      }
      acc[day].views += record.views;
      acc[day].er.push(record.er);
      return acc;
    }, {} as Record<string, { views: number; er: number[] }>);

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
            const avgER = dailyData[day].er.reduce((sum, er) => sum + er, 0) / dailyData[day].er.length;
            return parseFloat((avgER * 100).toFixed(2));
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
      '0-1%': { min: 0, max: 0.01, count: 0, totalER: 0 },
      '1-2%': { min: 0.01, max: 0.02, count: 0, totalER: 0 },
      '2-3%': { min: 0.02, max: 0.03, count: 0, totalER: 0 },
      '3-4%': { min: 0.03, max: 0.04, count: 0, totalER: 0 },
      '4-5%': { min: 0.04, max: 0.05, count: 0, totalER: 0 },
      '5%+': { min: 0.05, max: 1, count: 0, totalER: 0 },
    };

    filteredData.forEach(record => {
      for (const [range, config] of Object.entries(erRanges)) {
        if (record.er >= config.min && record.er < config.max) {
          config.count++;
          config.totalER += record.er;
          break;
        }
      }
    });

    const ranges = Object.keys(erRanges);
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

    return {
      labels: ranges,
      datasets: [{
        data: ranges.map(range => erRanges[range as keyof typeof erRanges].count),
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 2,
      }],
    };
  }, [data, selectedPeriod]);
}