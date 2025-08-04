import React from 'react';

interface ActivityRingProps {
  progress: number; // 0-100
  size: number;
  strokeWidth: number;
  color: string;
  delay?: number;
}

const ActivityRing: React.FC<ActivityRingProps> = ({ 
  progress, 
  size, 
  strokeWidth, 
  color, 
  delay = 0 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Фоновое кольцо */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Прогресс кольцо */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        fill="none"
        className="transition-all duration-1000 ease-out"
        style={{ animationDelay: `${delay}ms` }}
      />
    </svg>
  );
};

interface ActivityRingsProps {
  views: number;
  viewsTarget: number;
}

const ActivityRings: React.FC<ActivityRingsProps> = ({
  views,
  viewsTarget
}) => {
  const viewsProgress = Math.min((views / viewsTarget) * 100, 100);

  return (
    <div className="relative flex items-center justify-center">
      {/* Только внешнее кольцо - Просмотры */}
      <div className="absolute">
        <ActivityRing
          progress={viewsProgress}
          size={200}
          strokeWidth={12}
          color="url(#views-gradient)"
        />
        <svg width={0} height={0}>
          <defs>
            <linearGradient id="views-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff6b6b" />
              <stop offset="100%" stopColor="#ee5a24" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {/* Центральная информация */}
      <div className="absolute text-center">
        <div className="text-2xl font-bold gradient-text">
          {views.toLocaleString()}
        </div>
        <div className="text-sm text-white/80">
          просмотров
        </div>
      </div>
    </div>
  );
};

export default ActivityRings; 