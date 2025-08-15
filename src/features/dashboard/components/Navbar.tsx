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
      className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 rounded-t-3xl shadow-2xl flex justify-around items-center h-[85px] max-w-[400px] mx-auto z-50 border-t border-white/20"
      role="navigation"
      aria-label="Основная навигация"
    >
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => 
            `flex flex-col items-center p-3 text-white transition-all duration-300 relative group ${
              isActive 
                ? 'text-white scale-110' 
                : 'text-white/80 hover:text-white hover:scale-105'
            }`
          }
          aria-label={item.label}
        >
          <div className={`relative p-2 rounded-full transition-all duration-300 ${
            'group-hover:bg-white/20 group-active:scale-95'
          }`}>
            <item.icon className="w-6 h-6" aria-hidden="true" />
          </div>
          <span className="text-xs font-medium mt-1 transition-all duration-300">{item.label}</span>

          {/* Улучшенный индикатор выбранного экрана */}
          <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full transition-all duration-500 ${
            'opacity-0 group-hover:opacity-50'
          }`} />
        </NavLink>
      ))}
    </nav>
  );
}