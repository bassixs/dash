import React from 'react';
import { Cog6ToothIcon, SunIcon, MoonIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
  return (
    <div className="p-6 pb-24 min-h-screen">
      <div className="text-center mb-8 animate-fadeIn">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
          Настройки
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
          Управление приложением
        </p>
      </div>
      
      <div className="card light dark:dark p-8 animate-scaleIn">
        <div className="flex items-center mb-6">
          <Cog6ToothIcon className="w-6 h-6 text-blue-500 mr-3" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Настройки приложения
          </h3>
        </div>
        
        <div className="space-y-6">
          <div className="glass-card dark:glass-card-dark p-6 rounded-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <SunIcon className="w-5 h-5 text-yellow-500 mr-3" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Тема оформления</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Переключить между светлой и темной темой</p>
                </div>
              </div>
              <button className="btn-primary">
                Сменить тему
              </button>
            </div>
          </div>
          
          <div className="glass-card dark:glass-card-dark p-6 rounded-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DocumentArrowUpIcon className="w-5 h-5 text-green-500 mr-3" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Импорт данных</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Загрузить новый Excel файл с данными</p>
                </div>
              </div>
              <button className="btn-primary">
                Импортировать
              </button>
            </div>
          </div>
          
          <div className="glass-card dark:glass-card-dark p-6 rounded-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Cog6ToothIcon className="w-5 h-5 text-purple-500 mr-3" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Дополнительные настройки</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Расширенные параметры приложения</p>
                </div>
              </div>
              <button className="btn-secondary">
                Настроить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}