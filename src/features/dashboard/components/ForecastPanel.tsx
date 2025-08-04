import React, { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { ProjectRecordInterface } from '@core/models/ProjectRecord';

interface ForecastPanelProps {
  data: ProjectRecordInterface[];
  periods: string[];
  selectedProject: string;
}

export default function ForecastPanel({ data, periods, selectedProject }: ForecastPanelProps) {
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const forecastData = useMemo(() => {
    if (periods.length < 3) return null;

    // Фильтруем данные по проекту
    const filteredData = selectedProject 
      ? data.filter(record => record.project === selectedProject)
      : data;

    // Группируем данные по периодам
    const periodData = periods.map((period, index) => {
      const periodRecords = filteredData.filter(record => record.period === period);
      const totalViews = periodRecords.reduce((sum, record) => sum + record.views, 0);
      return { x: index, y: totalViews, period };
    }).filter(item => item.y > 0);

    if (periodData.length < 3) return null;

    // Линейная регрессия
    const n = periodData.length;
    const sumX = periodData.reduce((sum, item) => sum + item.x, 0);
    const sumY = periodData.reduce((sum, item) => sum + item.y, 0);
    const sumXY = periodData.reduce((sum, item) => sum + item.x * item.y, 0);
    const sumX2 = periodData.reduce((sum, item) => sum + item.x * item.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Вычисляем R²
    const meanY = sumY / n;
    const ssRes = periodData.reduce((sum, item) => {
      const predicted = slope * item.x + intercept;
      return sum + Math.pow(item.y - predicted, 2);
    }, 0);
    const ssTot = periodData.reduce((sum, item) => {
      return sum + Math.pow(item.y - meanY, 2);
    }, 0);
    const rSquared = 1 - (ssRes / ssTot);

    // Прогноз на следующий период
    const nextPeriodIndex = periods.length;
    const nextPeriodForecast = slope * nextPeriodIndex + intercept;

    // Доверительный интервал (упрощенный)
    const confidenceInterval = 0.15; // 15% от прогноза
    const confidenceLower = nextPeriodForecast * (1 - confidenceInterval);
    const confidenceUpper = nextPeriodForecast * (1 + confidenceInterval);

    // Исторические данные
    const historical = periodData.map(item => ({ x: item.x, y: item.y }));

    // Прогнозная линия
    const forecast = [
      ...periodData.map(item => ({ x: item.x, y: slope * item.x + intercept })),
      { x: nextPeriodIndex, y: nextPeriodForecast }
    ];

    // Доверительный интервал
    const confidenceData = [
      ...periodData.map(item => ({ 
        x: item.x, 
        y1: (slope * item.x + intercept) * (1 - confidenceInterval),
        y2: (slope * item.x + intercept) * (1 + confidenceInterval)
      })),
      { x: nextPeriodIndex, y1: confidenceLower, y2: confidenceUpper }
    ];

    return {
      historical,
      forecast,
      confidence: confidenceData,
      metrics: {
        rSquared,
        meanError: Math.sqrt(ssRes / n),
        nextPeriodForecast,
        confidence: confidenceInterval * 100
      }
    };
  }, [data, periods, selectedProject]);

  if (!forecastData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Недостаточно данных для прогнозирования (нужно минимум 3 периода)
        </p>
      </div>
    );
  }

  const { historical, forecast, metrics } = forecastData;

  const chartData = {
    labels: [...periods, 'Прогноз'],
    datasets: [
      {
        label: 'Исторические данные',
        data: historical.map(item => item.y),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: false,
        pointRadius: 6,
        pointBackgroundColor: 'rgb(59, 130, 246)',
      },
      {
        label: 'Прогноз',
        data: forecast.map(item => item.y),
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderWidth: 3,
        borderDash: [5, 5],
        fill: false,
        pointRadius: 6,
        pointBackgroundColor: 'rgb(249, 115, 22)',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          title: (context: any) => {
            const index = context[0].dataIndex;
            return index < periods.length ? `Период: ${periods[index]}` : 'Прогноз';
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (context: any) => {
            const value = context.parsed.y;
            const label = context.dataset.label || '';
            return `${label}: ${value.toLocaleString()}`;
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
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart' as const
    }
  };

  return (
    <div className={`transition-all duration-500 ${
      isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
    }`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* График прогноза */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Прогноз просмотров
          </h4>
          <div className="h-64">
            <Line data={chartData} options={options} />
          </div>
        </div>

        {/* Карточка прогноза */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Следующий период
          </h4>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {metrics.nextPeriodForecast.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Прогноз просмотров
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Точность модели</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {(metrics.rSquared * 100).toFixed(1)}%
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Средняя ошибка</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {metrics.meanError.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Уровень доверия</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {metrics.confidence.toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-sm text-orange-800 dark:text-orange-200">
                <strong>Доверительный интервал:</strong>
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                {(metrics.nextPeriodForecast * 0.85).toLocaleString()} - {(metrics.nextPeriodForecast * 1.15).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Метрики качества прогноза */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Качество прогноза
        </h4>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {(metrics.rSquared * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              R² коэффициент
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {metrics.confidence.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Уровень доверия
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
              {metrics.meanError.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Средняя ошибка
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 