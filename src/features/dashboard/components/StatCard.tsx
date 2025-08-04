import React, { memo } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  className?: string;
  onClick?: () => void;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = memo(({ 
  label, 
  value, 
  className = '', 
  onClick,
  trend 
}) => {
  return (
    <div 
      className={`card-modern neo hover-lift cursor-pointer transition-all duration-300 ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="text-center">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          {label}
        </p>
        <p className="text-2xl font-bold gradient-text mb-1">
          {value}
        </p>
        
        {/* Тренд индикатор */}
        {trend && (
          <div className="flex items-center justify-center gap-1">
            <span className={`text-xs font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <div className={`w-2 h-2 rounded-full ${
              trend.isPositive ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </div>
        )}
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;
