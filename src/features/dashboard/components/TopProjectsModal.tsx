import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface TopProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  projects: Array<{
    project: string;
    value: number;
    count: number;
    avgER?: number;
  }>;
  valueFormatter: (value: number) => string;
}

export default function TopProjectsModal({
  isOpen,
  onClose,
  title,
  projects,
  valueFormatter
}: TopProjectsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay flex items-center justify-center z-50 p-4">
      <div className="modal-content light dark:dark max-w-md w-full max-h-[80vh] overflow-hidden animate-scaleIn">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 dark:border-gray-600/20">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Содержимое */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="space-y-4">
            {projects.map((project, index) => (
              <div 
                key={project.project} 
                className="glass-card dark:glass-card-dark p-4 rounded-xl hover:scale-105 transition-all duration-300 animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold rounded-full flex items-center justify-center mr-4 shadow-lg">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-lg">
                        {project.project}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {project.count} записей
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      {valueFormatter(project.value)}
                    </p>
                    {project.avgER !== undefined && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ЕР: {project.avgER.toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 