import React from 'react';

interface HealthStatProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
  icon?: string;
}

const HealthStat: React.FC<HealthStatProps> = ({ 
  label, 
  value, 
  subtitle, 
  trend, 
  color = 'gradient-text',
  icon 
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '→';
      default: return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      case 'stable': return 'text-blue-400';
      default: return '';
    }
  };

  return (
    <div className="neo p-4 rounded-xl hover-lift">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {icon && <span className="text-lg">{icon}</span>}
          <span className="text-sm font-medium text-white/80">{label}</span>
        </div>
        {trend && (
          <span className={`text-sm ${getTrendColor()}`}>
            {getTrendIcon()}
          </span>
        )}
      </div>
      
      <div className={`text-2xl font-bold ${color}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      
      {subtitle && (
        <div className="text-xs text-white/60 mt-1">
          {subtitle}
        </div>
      )}
    </div>
  );
};

interface HealthStatsProps {
  totalViews: number;
  totalSI: number;
  avgER: string;
  totalLinks: number;
  viewsChange?: number;
  siChange?: number;
  erChange?: number;
}

const HealthStats: React.FC<HealthStatsProps> = ({
  totalViews,
  totalSI,
  avgER,
  totalLinks,
  viewsChange,
  siChange,
  erChange
}) => {
  return (
    <div className="card-modern p-6 animate-fade-in-up">
      <h3 className="text-lg font-semibold mb-4 text-white">
        📈 Детальная статистика
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <HealthStat
          label="Просмотры"
          value={totalViews}
          subtitle="Общее количество"
          trend={viewsChange ? (viewsChange > 0 ? 'up' : 'down') : undefined}
          icon="👁️"
        />
        
        <HealthStat
          label="СИ"
          value={totalSI}
          subtitle="Совокупный индекс"
          trend={siChange ? (siChange > 0 ? 'up' : 'down') : undefined}
          icon="📊"
        />
        
        <HealthStat
          label="Средний ЕР"
          value={`${avgER}%`}
          subtitle="В процентах"
          trend={erChange ? (erChange > 0 ? 'up' : 'down') : undefined}
          icon="🎯"
        />
        
        <HealthStat
          label="Записи"
          value={totalLinks}
          subtitle="Количество записей"
          icon="📝"
        />
      </div>
      
      {/* Дополнительная информация */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-white/60">Среднее</div>
            <div className="text-sm font-semibold gradient-text">
              {(totalViews / Math.max(totalLinks, 1)).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-white/60">Максимум</div>
            <div className="text-sm font-semibold gradient-text-secondary">
              {Math.max(totalViews, totalSI).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-white/60">Эффективность</div>
            <div className="text-sm font-semibold" style={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {((totalSI / Math.max(totalViews, 1)) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthStats; 