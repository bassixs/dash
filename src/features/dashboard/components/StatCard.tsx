import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  className?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, className = '', onClick }) => {
  return (
    <div 
      className={`p-4 rounded-xl transition-all duration-300 ${className}`}
      onClick={onClick}
    >
      <div className="text-center">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          {label}
        </p>
        <p className="text-xl font-bold gradient-text">
          {value}
        </p>
      </div>
    </div>
  );
};

export default StatCard;
