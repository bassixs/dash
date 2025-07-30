import React, { useMemo, useEffect } from 'react';
   import { useExcelData } from './hooks/useExcelData';
   import { useFilteredData } from './hooks/useFilteredData';
   import { useDashboardStore } from '../../shared/store/useDashboardStore';
   import StatCard from './components/StatCard';
   import FiltersPanel from './components/FiltersPanel';
   import DataTable from './components/DataTable';
   import Loading from './components/Loading';
   import ErrorMessage from './components/Error';
   import ErrorBoundary from './components/ErrorBoundary';
   import { ProjectRecordInterface } from '@core/models/ProjectRecord';

   interface ExcelData {
     data: ProjectRecordInterface[];
     projects: string[];
   }

   function DashboardPage() {
     const { data, isLoading, error } = useExcelData();
     const { selectedPeriod, selectedProject, setSelectedPeriod } = useDashboardStore();
     const filtered = useFilteredData(data?.data || []);
     const periods = useMemo(() => {
       const allPeriods = [...new Set(data?.data.map((r: ProjectRecordInterface) => r.period) || [])];
       return allPeriods.filter((p) => p && p.match(/^\d{2}\.\d{2}\s*-\s*\d{2}\.\d{2}$/)).sort();
     }, [data]);

     const currentData = useMemo(() => {
       console.log('currentData calculation:', { filteredLength: filtered.length, dataLength: data?.data.length });
       return filtered.length > 0 ? filtered : data?.data || [];
     }, [filtered, data]);

     useEffect(() => {
       if (periods.length > 0 && !selectedPeriod) {
         console.log('Setting initial period:', periods[periods.length - 1]);
         setSelectedPeriod(periods[periods.length - 1]);
       }
     }, [periods, selectedPeriod, setSelectedPeriod]);

     const { totalViews, totalSI, avgER, totalLinks } = useMemo(() => {
       const totalViews = filtered.reduce((sum: number, r: ProjectRecordInterface) => sum + r.views, 0);
       const totalSI = filtered.reduce((sum: number, r: ProjectRecordInterface) => sum + r.si, 0);
       const avgER = filtered.length
         ? (filtered.reduce((sum: number, r: ProjectRecordInterface) => sum + r.er, 0) / filtered.length * 100).toFixed(2)
         : '0';
       const totalLinks = filtered.length;
       return { totalViews, totalSI, avgER, totalLinks };
     }, [filtered]);

     if (isLoading) return <Loading />;
     if (error) return <ErrorMessage message={error instanceof Error ? error.message : 'Не удалось загрузить данные. Попробуйте снова.'} />;

     console.log('Rendering DashboardPage:', { periods, currentDataLength: currentData.length, selectedProject, selectedPeriod });

     return (
       <ErrorBoundary>
         <div className="p-4 sm:p-6">
           <FiltersPanel />
           <h1 className="text-3xl font-bold mb-6 text-center">Аналитика спецпроектов</h1>
           <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-6">
             <h2 className="text-xl mb-2 font-semibold">Период: {selectedPeriod || periods[periods.length - 1]}</h2>
             <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
               <StatCard label="Просмотры" value={totalViews.toLocaleString()} onClick={() => {}} />
               <StatCard label="Средний ЕР" value={`${avgER}%`} onClick={() => {}} />
               <StatCard label="СИ" value={totalSI.toLocaleString()} onClick={() => {}} />
               <StatCard label="Ссылки" value={totalLinks.toLocaleString()} onClick={() => {}} />
             </div>
           </div>
           <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
             <h3 className="text-lg font-semibold mb-4">Данные</h3>
             <DataTable data={currentData} />
           </div>
         </div>
       </ErrorBoundary>
     );
   }

   export default DashboardPage;