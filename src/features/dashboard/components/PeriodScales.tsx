import React from 'react';
import { ProjectRecordInterface } from '@core/models/ProjectRecord';

interface PeriodScaleProps {
  data: ProjectRecordInterface[];
  selectedPeriod?: string;
}

const PeriodScales: React.FC<PeriodScaleProps> = ({ data, selectedPeriod }) => {
  // Группируем данные по периодам
  const periodData = data.reduce((acc, record) => {
    if (!acc[record.period]) {
      acc[record.period] = {
        views: 0,
        si: 0,
        count: 0
      };
    }
    acc[record.period].views += record.views;
    acc[record.period].si += record.si;
    acc[record.period].count += 1;
    return acc;
  }, {} as Record<string, { views: number; si: number; count: number }>);

  // Сортируем периоды
  const sortedPeriods = Object.entries(periodData)
    .sort(([a], [b]) => {
      const aMatch = a.match(/(\d{2})\.(\d{2})/);
      const bMatch = b.match(/(\d{2})\.(\d{2})/);
      if (aMatch && bMatch) {
        const aDate = new Date(2024, parseInt(aMatch[2]) - 1, parseInt(aMatch[1]));
        const bDate = new Date(2024, parseInt(bMatch[2]) - 1, parseInt(bMatch[1]));
        return aDate.getTime() - bDate.getTime();
      }
      return a.localeCompare(b);
    })
    .slice(-7); // Показываем последние 7 периодов

  const maxViews = Math.max(...sortedPeriods.map(([, data]) => data.views));

  return (
    <div className="card-modern p-6 animate-fade-in-up">
      <h3 className="text-lg font-semibold mb-4 text-white">
        📊 Активность по периодам
      </h3>
      
      <div className="space-y-4">
        {sortedPeriods.map(([period, data]) => {
          const progress = maxViews > 0 ? (data.views / maxViews) * 100 : 0;
          const isSelected = selectedPeriod === period;
          
          return (
            <div 
              key={period}
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                isSelected 
                  ? 'bg-white/20 border border-white/30' 
                  : 'hover:bg-white/10'
              }`}
            >
              {/* Период */}
              <div className="flex-1">
                <div className="text-sm font-medium text-white">
                  {period}
                </div>
                <div className="text-xs text-white/60">
                  {data.count} записей
                </div>
              </div>
              
              {/* Шкала прогресса */}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="flex-1 bg-white/10 rounded-full h-2">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${progress}%`,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 0 10px rgba(102, 126, 234, 0.5)'
                      }}
                    />
                  </div>
                  <span className="text-xs text-white/80 min-w-[40px] text-right">
                    {progress.toFixed(0)}%
                  </span>
                </div>
              </div>
              
              {/* Статистика */}
              <div className="text-right">
                <div className="text-sm font-semibold gradient-text">
                  {data.views.toLocaleString()}
                </div>
                <div className="text-xs text-white/60">
                  просмотров
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Легенда */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>Мин: {Math.min(...sortedPeriods.map(([, data]) => data.views)).toLocaleString()}</span>
          <span>Макс: {maxViews.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default PeriodScales; 