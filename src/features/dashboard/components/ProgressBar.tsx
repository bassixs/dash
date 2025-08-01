import React from 'react';

interface ProgressBarProps {
  current: number;
  target: number;
  label: string;
  period: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, target, label, period }) => {
  const percentage = Math.min((current / target) * 100, 100);
  
  return (
    <div className="card-modern animate-fade-in-up">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-white">{label}</h3>
        <span className="text-sm text-white/80">{period}</span>
      </div>
      
      <div className="progress-modern mb-3">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ 
            width: `${percentage}%`,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 0 20px rgba(102, 126, 234, 0.5)'
          }}
        />
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <span className="text-white/80">
          Текущий: {current.toLocaleString()}
        </span>
        <span className="text-white/80">
          Цель: {target.toLocaleString()}
        </span>
        <span className="font-semibold gradient-text">
          {percentage.toFixed(1)}%
        </span>
      </div>
      
      {/* Анимированные частицы при достижении целей */}
      {percentage >= 100 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
          <div className="absolute top-0 right-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
        </div>
      )}
    </div>
  );
};

export default ProgressBar; 