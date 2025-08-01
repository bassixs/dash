import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useKPIStore, KPI } from '@shared/store/useKPIStore';
import { useDashboardStore } from '@shared/store/useDashboardStore';

import { useExcelData } from '../hooks/useExcelData';

interface KPISettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KPISettings({ isOpen, onClose }: KPISettingsProps) {
  const { selectedProject, selectedPeriod } = useDashboardStore();
  const { data } = useExcelData();
  const {
    kpis,
    currentKPI,
    progress,
    addKPI,
    updateKPI,
    deleteKPI,
    setCurrentKPI,
    updateProgress,
    calculateProgressPercentage,
  } = useKPIStore();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    targetViews: '',
    targetSI: '',
    targetER: '',
  });

  // Устанавливаем текущий KPI при изменении проекта или периода
  useEffect(() => {
    if (selectedProject && selectedPeriod) {
      setCurrentKPI(selectedProject, selectedPeriod);
    }
  }, [selectedProject, selectedPeriod, setCurrentKPI]);

  // Обновляем прогресс на основе реальных данных
  useEffect(() => {
    if (data?.data && selectedProject && selectedPeriod) {
      const projectData = data.data.filter(
        (record) => record.project === selectedProject && record.period === selectedPeriod
      );
      
      if (projectData.length > 0) {
        const totalViews = projectData.reduce((sum, record) => sum + record.views, 0);
        const totalSI = projectData.reduce((sum, record) => sum + record.si, 0);
        const avgER = totalViews > 0 ? (totalSI / totalViews) * 100 : 0;
        
        updateProgress(selectedProject, selectedPeriod, {
          views: totalViews,
          si: totalSI,
          er: avgER,
        });
      }
    }
  }, [data, selectedProject, selectedPeriod, updateProgress]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProject || !selectedPeriod) {
      alert('Выберите проект и период');
      return;
    }

    const kpiData = {
      project: selectedProject,
      period: selectedPeriod,
      targetViews: parseInt(formData.targetViews) || 0,
      targetSI: parseInt(formData.targetSI) || 0,
      targetER: parseFloat(formData.targetER) || 0,
    };

    if (currentKPI && isEditing) {
      updateKPI(currentKPI.id, kpiData);
    } else {
      addKPI(kpiData);
    }

    setFormData({ targetViews: '', targetSI: '', targetER: '' });
    setIsEditing(false);
  };

  const handleEdit = (kpi: KPI) => {
    setFormData({
      targetViews: kpi.targetViews.toString(),
      targetSI: kpi.targetSI.toString(),
      targetER: kpi.targetER.toString(),
    });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить KPI?')) {
      deleteKPI(id);
    }
  };

  const progressPercentages = calculateProgressPercentage(selectedProject, selectedPeriod);
  const currentProgress = progress.find(
    (p) => p.project === selectedProject && p.period === selectedPeriod
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Настройка KPI
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Информация о проекте и периоде */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              {selectedProject || 'Все проекты'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Период: {selectedPeriod || 'Все периоды'}
            </p>
          </div>

          {/* Текущий прогресс */}
          {currentProgress && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Текущий прогресс
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {currentProgress.currentViews.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Просмотры</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {currentProgress.currentSI.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">СИ</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {currentProgress.currentER.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">ЕР</div>
                </div>
              </div>
            </div>
          )}

          {/* Форма настройки KPI */}
          <form onSubmit={handleSubmit} className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              {isEditing ? 'Редактировать KPI' : 'Установить цели'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Целевые просмотры
                </label>
                <input
                  type="number"
                  value={formData.targetViews}
                  onChange={(e) => setFormData({ ...formData, targetViews: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Целевые СИ
                </label>
                <input
                  type="number"
                  value={formData.targetSI}
                  onChange={(e) => setFormData({ ...formData, targetSI: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Целевой ЕР (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.targetER}
                  onChange={(e) => setFormData({ ...formData, targetER: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.0"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="btn-primary flex items-center gap-2"
              >
                {isEditing ? (
                  <>
                    <PencilIcon className="w-4 h-4" />
                    Обновить KPI
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4" />
                    Установить KPI
                  </>
                )}
              </button>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ targetViews: '', targetSI: '', targetER: '' });
                  }}
                  className="btn-secondary"
                >
                  Отмена
                </button>
              )}
            </div>
          </form>

          {/* Прогресс-бары */}
          {currentKPI && currentProgress && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Прогресс по целям
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Просмотры</span>
                    <span className="font-medium">
                      {progressPercentages.views.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progressPercentages.views, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">СИ</span>
                    <span className="font-medium">
                      {progressPercentages.si.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progressPercentages.si, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">ЕР</span>
                    <span className="font-medium">
                      {progressPercentages.er.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progressPercentages.er, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Список KPI */}
          {kpis.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Все KPI
              </h3>
              <div className="space-y-2">
                {kpis.map((kpi) => (
                  <div
                    key={kpi.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {kpi.project}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {kpi.period} • Просмотры: {kpi.targetViews.toLocaleString()} • СИ: {kpi.targetSI.toLocaleString()} • ЕР: {kpi.targetER.toFixed(1)}%
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(kpi)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(kpi.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 