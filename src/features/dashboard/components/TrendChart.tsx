import React, { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { ProjectRecordInterface } from '@core/models/ProjectRecord';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TrendChartProps {
  data: ProjectRecordInterface[];
  selectedProject: string;
  periods: string[];
}

export default function TrendChart({ data, selectedProject, periods }: TrendChartProps) {
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const chartData = useMemo(() => {
    // Фильтруем данные по проекту
    const filteredData = selectedProject 
      ? data.filter(record => record.project === selectedProject)
      : data;

    // Группируем данные по периодам
    const periodData = periods.map(period => {
      const periodRecords = filteredData.filter(record => record.period === period);
      const totalViews = periodRecords.reduce((sum, record) => sum + record.views, 0);
      const totalSI = periodRecords.reduce((sum, record) => sum + record.si, 0);
      const avgER = totalViews > 0 ? (totalSI / totalViews) * 100 : 0;
      
      return {
        period,
        views: totalViews,
        si: totalSI,
        er: avgER
      };
    });

    // Вычисляем тренд (рост/падение)
    const trendData = periodData.map((item, index) => {
      if (index === 0) return { ...item, trend: 0 };
      
      const prevViews = periodData[index - 1].views;
      const currentViews = item.views;
      const trend = prevViews > 0 ? ((currentViews - prevViews) / prevViews) * 100 : 0;
      
      return { ...item, trend };
    });

    return {
      labels: trendData.map(item => item.period),
      datasets: [
        {
          label: 'Просмотры',
          data: trendData.map(item => item.views),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: trendData.map(item => 
            item.trend > 0 ? 'rgb(34, 197, 94)' : 
            item.trend < 0 ? 'rgb(239, 68, 68)' : 
            'rgb(156, 163, 175)'
          ),
          pointBorderColor: trendData.map(item => 
            item.trend > 0 ? 'rgb(34, 197, 94)' : 
            item.trend < 0 ? 'rgb(239, 68, 68)' : 
            'rgb(156, 163, 175)'
          ),
          pointRadius: 6,
          pointHoverRadius: 8,
        }
      ]
    };
  }, [data, selectedProject, periods]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          title: (context: any) => `Период: ${context[0].label}`,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (context: any) => {
            const value = context.parsed.y;
            const prevValue = context.dataIndex > 0 ? chartData.datasets[0].data[context.dataIndex - 1] : value;
            const change = prevValue > 0 ? ((value - prevValue) / prevValue) * 100 : 0;
            
            return [
              `Просмотры: ${value.toLocaleString()}`,
              `Изменение: ${change > 0 ? '+' : ''}${change.toFixed(1)}%`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.2)'
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          },
          callback: (value: number | string) => {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            return `${(numValue / 1000).toFixed(0)}k`;
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart' as const
    }
  };

  // Вычисляем общий тренд
  const overallTrend = useMemo(() => {
    if (chartData.datasets[0].data.length < 2) return 0;
    
    const firstValue = chartData.datasets[0].data[0];
    const lastValue = chartData.datasets[0].data[chartData.datasets[0].data.length - 1];
    
    return firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
  }, [chartData]);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-500 ${
      isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
    }`}>
      {/* Заголовок с трендом */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {selectedProject || 'Все проекты'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Динамика просмотров по периодам
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${
            overallTrend > 0 ? 'text-green-600' : 
            overallTrend < 0 ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {overallTrend > 0 ? '+' : ''}{overallTrend.toFixed(1)}%
          </span>
          <div className={`w-2 h-2 rounded-full ${
            overallTrend > 0 ? 'bg-green-500' : 
            overallTrend < 0 ? 'bg-red-500' : 
            'bg-gray-500'
          }`} />
        </div>
      </div>

      {/* График */}
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>

      {/* Легенда */}
      <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-gray-600 dark:text-gray-400">Рост</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-gray-600 dark:text-gray-400">Падение</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-500 rounded-full" />
          <span className="text-gray-600 dark:text-gray-400">Стабильно</span>
        </div>
      </div>
    </div>
  );
} 