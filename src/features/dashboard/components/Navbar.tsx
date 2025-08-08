import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  Cog6ToothIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';

const navItems = [
  { path: '/', label: 'Дашборд', icon: HomeIcon },
  { path: '/analytics', label: 'Аналитика', icon: ChartPieIcon },
  { path: '/settings', label: 'Настройки', icon: Cog6ToothIcon },
];

/**
 * Компонент навигационной панели
 */
export default function Navbar(): React.JSX.Element {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 glass-card dark:glass-card-dark rounded-t-3xl shadow-2xl flex justify-around items-center h-[88px] max-w-[420px] mx-auto z-50 border-t border-white/20 dark:border-gray-600/20"
      role="navigation"
      aria-label="Основная навигация"
    >
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => 
            `nav-item ${isActive ? 'active' : ''}`
          }
          aria-label={item.label}
        >
          <div className="relative">
            <item.icon className="w-7 h-7 mb-1 transition-all duration-300" aria-hidden="true" />
            <span className="text-xs font-medium transition-all duration-300">
              {item.label}
            </span>
            
            {/* Индикатор активного экрана */}
            <div className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-300 ${
              ({ isActive }: { isActive: boolean }) => isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`} />
          </div>
        </NavLink>
      ))}
    </nav>
  );
}