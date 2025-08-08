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
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPlanCompleted, setIsPlanCompleted] = useState(false);
  
  const percentage = Math.min((current / target) * 100, 100);
  const remaining = target - current;
  
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
        const newProgress = Math.min(currentStep * stepValue, percentage);
        setAnimatedProgress(newProgress);
        
        // Проверяем, достигли ли мы 100%
        if (newProgress >= 100 && !isPlanCompleted) {
          setIsPlanCompleted(true);
          // Показываем конфети через небольшую задержку
          setTimeout(() => {
            setShowConfetti(true);
          }, 500);
        }
        
        if (currentStep >= steps) {
          clearInterval(interval);
        }
      }, stepDuration);
      
      return () => clearInterval(interval);
    }
  }, [isVisible, percentage, isPlanCompleted]);
  
  // Скрываем конфети через 3 секунды
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  return (
    <div className={`card light dark:dark p-6 transition-all duration-500 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
          {label}
        </h3>
        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{period}</span>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 font-medium">
          <span>{current.toLocaleString()}</span>
          <span>{target.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-2xl h-6 overflow-hidden backdrop-blur-sm">
        <div 
          className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 h-6 rounded-2xl transition-all duration-300 flex items-center justify-center relative shadow-lg"
          style={{ 
            width: `${animatedProgress}%`,
            transition: 'width 0.3s ease-out'
          }}
        >
          {/* Эффект свечения */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          
          {/* Градиентная анимация */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/50 via-purple-400/50 to-blue-500/50 animate-pulse"></div>
          
          {animatedProgress > 15 && (
            <span className="text-white text-xs font-bold relative z-10 drop-shadow-lg">
              {animatedProgress.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <span className={`text-sm font-semibold ${isPlanCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
          {isPlanCompleted ? '🎉 План выполнен!' : `Осталось: ${remaining.toLocaleString()} просмотров`}
        </span>
      </div>
      
      {/* Дополнительные визуальные эффекты */}
      <div className="mt-4 flex justify-center">
        <div className="flex space-x-2">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                animatedProgress > (i * 33) 
                  ? 'bg-gradient-to-r from-blue-400 to-purple-400 shadow-lg' 
                  : 'bg-gray-300/50 dark:bg-gray-600/50'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Анимация конфети */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            >
              <div
                className={`w-3 h-3 rounded-full shadow-lg ${
                  ['bg-yellow-400', 'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'][
                    Math.floor(Math.random() * 5)
                  ]
                }`}
                style={{
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 