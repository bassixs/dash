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
        return <ArrowUpIcon className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowDownIcon className="w-4 h-4 text-red-500" />;
      case 'stable':
        return <MinusIcon className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 transition-all duration-300 hover:shadow-md ${className} ${
      isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </h4>
        <div className="flex items-center space-x-1">
          {getTrendIcon()}
        </div>
      </div>
      
      <div className="mb-1">
        <span className={`text-xl font-bold ${getTrendColor()}`}>
          {value}
        </span>
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
} 