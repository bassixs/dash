import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  ChartBarIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Дашборд' },
    { path: '/analytics', icon: ChartBarIcon, label: 'Аналитика' },
    { path: '/settings', icon: Cog6ToothIcon, label: 'Настройки' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="glass mx-auto max-w-md rounded-2xl p-2">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-lg scale-110' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
                
                {/* Анимированный индикатор активного элемента */}
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;