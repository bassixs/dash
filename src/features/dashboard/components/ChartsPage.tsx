import React from 'react';
   import { useExcelData } from '@features/dashboard/hooks/useExcelData';
   import { useChartData } from '@features/dashboard/hooks/useChartData';
   import { useDashboardStore } from '@shared/store/useDashboardStore';
   import Chart from '@features/dashboard/components/Chart';
   import FiltersPanel from '@features/dashboard/components/FiltersPanel';
   import Loading from '@features/dashboard/components/Loading';
   import ErrorMessage from '@features/dashboard/components/Error';
   import { ChartOptions } from 'chart.js';

   export default function ChartsPage() {
     const { data, isLoading, error } = useExcelData();
     const { selectedPeriod, selectedProject } = useDashboardStore();
     const periods = React.useMemo(() => {
       return [...new Set(data?.data.map((r) => r.period) || [])].filter((p) =>
         p?.match(/^\d{2}\.\d{2}\s*-\s*\d{2}\.\d{2}$/)
       ).sort();
     }, [data]);

     const viewsChartData = useChartData(data?.data || [], data?.projects || [], periods, selectedProject, 'views');
     const erChartData = useChartData(data?.data || [], data?.projects || [], periods, selectedProject, 'er');

     const chartOptions: ChartOptions<'line'> = {
       responsive: true,
       maintainAspectRatio: false,
       scales: {
         y: { beginAtZero: true, title: { display: true, text: 'Значение', color: '#FFFFFF' } },
         x: { title: { display: true, text: 'Периоды', color: '#FFFFFF' } },
       },
       plugins: { legend: { labels: { color: '#FFFFFF' } } },
     };

     if (isLoading) return <Loading />;
     if (error) return <ErrorMessage message={error instanceof Error ? error.message : 'Неизвестная ошибка'} />;

     return (
       <div className="p-4 sm:p-6">
         <FiltersPanel />
         <h1 className="text-3xl font-bold mb-6 text-center">Графики</h1>
         <div className="grid grid-cols-1 gap-6">
           <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
             <h3 className="text-lg font-semibold mb-4">Просмотры</h3>
             <Chart type="line" data={viewsChartData} options={{ ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales?.y, title: { ...chartOptions.scales?.y?.title, text: 'Просмотры' } } } }} />
           </div>
           <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
             <h3 className="text-lg font-semibold mb-4">ЕР (%)</h3>
             <Chart type="line" data={erChartData} options={{ ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales?.y, title: { ...chartOptions.scales?.y?.title, text: 'ЕР (%)' } } } }} />
           </div>
         </div>
       </div>
     );
   }