import React, { useState, useEffect } from 'react';

interface ProgressBarProps {
  current: number;
  target: number;
  label: string;
  period: string;
}

/**
 * Компонент прогресс бара для отображения прогресса просмотров
 */
export default function ProgressBar({ current, target, label, period }: ProgressBarProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  const percentage = Math.min((current / target) * 100, 100);
  
  // Анимация при появлении компонента
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Анимация заполнения прогресс бара
  useEffect(() => {
    if (isVisible) {
      const duration = 1500; // 1.5 секунды
      const steps = 60; // 60 кадров
      const stepDuration = duration / steps;
      const stepValue = percentage / steps;
      
      let currentStep = 0;
      
      const interval = setInterval(() => {
        currentStep++;
        setAnimatedProgress(Math.min(currentStep * stepValue, percentage));
        
        if (currentStep >= steps) {
          clearInterval(interval);
        }
      }, stepDuration);
      
      return () => clearInterval(interval);
    }
  }, [isVisible, percentage]);
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 transition-all duration-500 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{label}</h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">{period}</span>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{current.toLocaleString()}</span>
          <span>{target.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-300 flex items-center justify-center relative"
          style={{ 
            width: `${animatedProgress}%`,
            transition: 'width 0.3s ease-out'
          }}
        >
          {/* Эффект свечения */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          
          {animatedProgress > 15 && (
            <span className="text-white text-xs font-medium relative z-10">
              {animatedProgress.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
      
      <div className="mt-2 text-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Осталось: {(target - current).toLocaleString()} просмотров
        </span>
      </div>
      
      {/* Дополнительные визуальные эффекты */}
      <div className="mt-3 flex justify-center">
        <div className="flex space-x-1">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className={`w-1 h-1 rounded-full transition-all duration-300 ${
                animatedProgress > (i * 33) ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 