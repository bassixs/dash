import React, { useState } from 'react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/solid';

interface MetricsCardProps {
  title: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  description: string;
  className?: string;
}

export default function MetricsCard({ title, value, trend, description, className = '' }: MetricsCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowUpIcon className="w-5 h-5 text-green-500" />;
      case 'down':
        return <ArrowDownIcon className="w-5 h-5 text-red-500" />;
      case 'stable':
        return <MinusIcon className="w-5 h-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      case 'stable':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className={`stat-card light dark:dark card-hover p-6 transition-all duration-300 ${className} ${
      isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {title}
        </h4>
        <div className="flex items-center space-x-1">
          {getTrendIcon()}
        </div>
      </div>
      
      <div className="mb-2">
        <span className={`text-2xl font-bold ${getTrendColor()}`}>
          {value}
        </span>
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
        {description}
      </p>
    </div>
  );
} 