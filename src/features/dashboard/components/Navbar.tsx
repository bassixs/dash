import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, ChartBarIcon, CogIcon } from '@heroicons/react/24/outline';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Дашборд', icon: HomeIcon },
  { path: '/charts', label: 'Графики', icon: ChartBarIcon },
  { path: '/settings', label: 'Настройки', icon: CogIcon },
];

/**
 * Компонент навигационной панели
 */
export default function Navbar(): React.JSX.Element {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-blue-600 rounded-t-2xl shadow-lg flex justify-around items-center h-[78px] max-w-[400px] mx-auto"
      role="navigation"
      aria-label="Основная навигация"
    >
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center p-2 text-white transition-colors duration-200 ${
              isActive ? 'text-blue-200' : 'hover:text-blue-200'
            }`
          }
          aria-label={item.label}
        >
          <item.icon className="w-6 h-6" aria-hidden="true" />
          <span className="text-xs">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}