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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Содержимое */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="space-y-3">
            {projects.map((project, index) => (
              <div key={project.project} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center mr-3">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{project.project}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{project.count} записей</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {valueFormatter(project.value)}
                  </p>
                  {project.avgER !== undefined && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ЕР: {project.avgER.toFixed(1)}%
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 