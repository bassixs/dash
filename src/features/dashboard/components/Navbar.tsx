import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ChartBarIcon,
  HomeIcon,
  Cog6ToothIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';

const navItems = [
  { path: '/', label: 'Дашборд', icon: HomeIcon },
  { path: '/charts', label: 'Графики', icon: ChartBarIcon },
  { path: '/analytics', label: 'Аналитика', icon: ChartPieIcon },
  { path: '/settings', label: 'Настройки', icon: Cog6ToothIcon },
];

/**
 * Компонент навигационной панели
 */
export default function Navbar(): React.JSX.Element {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-blue-600 rounded-t-2xl shadow-lg flex justify-around items-center h-[78px] max-w-[400px] mx-auto"
      role="navigation"
      aria-label="Основная навигация"
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center p-2 text-white transition-colors duration-200 relative ${
              isActive ? 'text-blue-200' : 'hover:text-blue-200'
            }`}
            aria-label={item.label}
          >
            <item.icon className="w-6 h-6" aria-hidden="true" />
            <span className="text-xs">{item.label}</span>

            {/* Индикатор выбранного экрана */}
            {isActive && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-white rounded-full transition-all duration-300" />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}