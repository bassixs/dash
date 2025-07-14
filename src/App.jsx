import React, { useState, useEffect, useRef } from 'react';
import ExcelJS from 'exceljs';
import WebApp from '@twa-dev/sdk';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bars3Icon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import './styles.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

function App() {
  const [data, setData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [periods, setPeriods] = useState([
    '02.06 - 08.06', '09.06 - 15.06', '16.06 - 22.06', 
    '23.06 - 29.06', '30.06 - 06.07', '07.07 - 13.07', '14.07 - 20.07'
  ]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('14.07 - 20.07');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.WebApp) {
        try {
          if (process.env.NODE_ENV !== 'production') {
            console.log('Initializing Telegram Web App...');
            console.log('WebApp version:', window.WebApp.version);
          }
          window.WebApp.ready();
          window.WebApp.expand();
          if (process.env.NODE_ENV !== 'production') {
            console.log('Telegram Web App initialized successfully');
          }
        } catch (err) {
          console.error('Error initializing Telegram Web App:', err);
          setError('Failed to initialize Telegram Web App');
        }
      } else if (process.env.NODE_ENV !== 'production') {
        console.log('Running in browser mode, Telegram Web App SDK not found');
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadExcelData = async () => {
      try {
        setLoading(true);
        setError(null);

        const cachedData = localStorage.getItem('excelData');
        const cachedTimestamp = localStorage.getItem('excelTimestamp');
        const cacheValidDuration = 24 * 60 * 60 * 1000;

        // Force cache refresh on mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (!isMobile && cachedData && cachedTimestamp && (Date.now() - cachedTimestamp < cacheValidDuration)) {
          if (mounted) {
            const parsedData = JSON.parse(cachedData);
            setData(parsedData);
            setProjects(JSON.parse(localStorage.getItem('projects') || '[]'));
            setLoading(false);
            if (process.env.NODE_ENV !== 'production') {
              console.log('Loaded data from cache:', parsedData);
            }
          }
          return;
        }

        const response = await fetch('/спецпроекты.xlsx');
        if (!response.ok) throw new Error(`File not found: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        const allData = [];
        const projectNames = [];

        workbook.eachSheet((worksheet, sheetId) => {
          const sheetName = worksheet.name;
          const header = worksheet.getRow(1).values;
          if (header[1] !== 'Ссылка' || header[2] !== 'Просмотры' || header[3] !== 'СИ' || header[4] !== 'ЕР') {
            console.warn(`Invalid headers in sheet ${sheetName}`);
            return;
          }

          const jsonData = [];
          let currentPeriod = '';

          worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return;
            let link = row.getCell(1).value;
            const views = row.getCell(2).value;
            const si = row.getCell(3).value;
            const er = row.getCell(4).value;

            if (link && typeof link === 'object' && (link.text || link.hyperlink)) {
              link = link.hyperlink || link.text || '';
            }

            if (periods.includes(link)) {
              currentPeriod = link;
              return;
            }

            const parsedViews = typeof views === 'object' && views !== null 
              ? Number(views.text || views.result || views.value || 0)
              : Number(views || 0);
            const parsedEr = typeof er === 'object' && er !== null 
              ? Number(er.text || er.result || er.value || 0)
              : Number(er || 0);

            if (link && typeof link === 'string' && !isNaN(parsedViews) && !isNaN(parsedEr)) {
              jsonData.push({
                Ссылка: link,
                Просмотры: parsedViews,
                СИ: si || 0,
                ЕР: parsedEr,
                Спецпроект: sheetName,
                Период: currentPeriod || 'Не указан'
              });
            }
          });

          if (jsonData.length > 0) {
            projectNames.push(sheetName);
            allData.push(...jsonData);
          } else if (process.env.NODE_ENV !== 'production') {
            console.warn(`Sheet ${sheetName} is empty`);
          }
        });

        if (mounted) {
          setData(allData);
          setProjects(projectNames);
          localStorage.setItem('excelData', JSON.stringify(allData));
          localStorage.setItem('projects', JSON.stringify(projectNames));
          localStorage.setItem('excelTimestamp', Date.now().toString());
          setLoading(false);
          if (process.env.NODE_ENV !== 'production') {
            console.log('Loaded data from Excel:', allData);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setLoading(false);
          console.error('Error loading Excel data:', err);
        }
      }
    };

    loadExcelData();
    return () => {
      mounted = false;
    };
  }, []);

  // Закрытие боковой панели по клику вне области
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  const applyFilters = () => {
    setIsSidebarOpen(false);
  };

  const filteredData = data.filter(row => 
    (!selectedProject || row.Спецпроект === selectedProject) &&
    (!selectedPeriod || row.Период === selectedPeriod)
  );

  const currentPeriodData = filteredData.length > 0 ? filteredData : data.filter(row => row.Период === '14.07 - 20.07');
  const totalViews = currentPeriodData.reduce((sum, row) => sum + row.Просмотры, 0);
  const totalSI = currentPeriodData.reduce((sum, row) => sum + row.СИ, 0);
  const avgER = currentPeriodData.length > 0 
    ? (currentPeriodData.reduce((sum, row) => sum + row.ЕР, 0) / currentPeriodData.length * 100).toFixed(2)
    : 0;
  const targetViews = 2000000;
  const viewProgress = Math.min((totalViews / targetViews) * 100, 100);

  const exportToCSV = () => {
    const headers = 'Ссылка,Просмотры,СИ,ЕР,Спецпроект,Период\n';
    const csv = filteredData.map(row => 
      `"${row.Ссылка}",${row.Просмотры},${row.СИ},${(row.ЕР * 100).toFixed(2)},"${row.Спецпроект}","${row.Период}"`
    ).join('\n');
    const blob = new Blob([headers + csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stats.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // График просмотров по проектам
  const projectViewsData = {
    labels: projects.filter(p => currentPeriodData.some(row => row.Спецпроект === p)),
    datasets: [{
      label: 'Просмотры',
      data: projects.filter(p => currentPeriodData.some(row => row.Спецпроект === p))
        .map(p => currentPeriodData.filter(row => row.Спецпроект === p)
          .reduce((sum, row) => sum + row.Просмотры, 0)),
      backgroundColor: '#3b82f6', // Blue
      borderColor: '#1d4ed8',
      borderWidth: 1
    }]
  };

  // График ЕР по периодам
  const erByPeriodData = {
    labels: periods,
    datasets: [{
      label: 'Средний ЕР (%)',
      data: periods.map(period => {
        const periodData = data.filter(row => row.Период === period && (!selectedProject || row.Спецпроект === selectedProject));
        return periodData.length > 0 
          ? (periodData.reduce((sum, row) => sum + row.ЕР, 0) / periodData.length * 100).toFixed(2)
          : 0;
      }),
      fill: false,
      borderColor: '#f97316', // Orange
      tension: 0.2
    }]
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans">
      <button 
        className="fixed top-4 right-4 p-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
      </button>

      <div 
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 z-50 p-6`}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Фильтры</h2>
        <div className="mb-4">
          <label className="block text-gray-600 mb-2">Спецпроект</label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            aria-label="Выбор спецпроекта"
          >
            <option value="">Все спецпроекты</option>
            {projects.map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-gray-600 mb-2">Период</label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            aria-label="Выбор периода"
          >
            <option value="">Все периоды</option>
            {periods.map(period => (
              <option key={period} value={period}>{period}</option>
            ))}
          </select>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={applyFilters}
            className="flex-1 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
          >
            <ArrowRightIcon className="h-5 w-5 mr-2" /> Применить
          </button>
          <button
            onClick={() => {
              setSelectedProject('');
              setSelectedPeriod('');
              setIsSidebarOpen(false);
            }}
            className="flex-1 p-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
          >
            Сбросить
          </button>
        </div>
        <button
          onClick={exportToCSV}
          className="w-full mt-4 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Экспорт в CSV
        </button>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Аналитика спецпроектов
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="spinner border-t-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4 bg-white rounded-lg shadow">
          Ошибка: {error}. Попробуйте обновить страницу.
        </div>
      ) : (
        <>
          <div className="mb-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Период: {selectedPeriod || '14.07 - 20.07'}
            </h2>
            <div className="mb-6">
              <div className="text-gray-600 mb-2">
                Просмотры: {totalViews.toLocaleString()} / {targetViews.toLocaleString()}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-1000" 
                  style={{ width: `${viewProgress}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <div className="text-2xl font-bold text-blue-600">{totalViews.toLocaleString()}</div>
                <div className="text-gray-600">Просмотры</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <div className="text-2xl font-bold text-blue-600">{avgER}%</div>
                <div className="text-gray-600">Средний ЕР</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <div className="text-2xl font-bold text-blue-600">{totalSI.toLocaleString()}</div>
                <div className="text-gray-600">СИ</div>
              </div>
            </div>
          </div>

          <div className="mb-8 bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Просмотры по проектам</h3>
            <div style={{ height: '250px' }}>
              <Bar
                data={projectViewsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { display: false },
                    tooltip: { 
                      enabled: true,
                      callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.raw.toLocaleString()}`
                      }
                    }
                  },
                  scales: {
                    y: { 
                      beginAtZero: true,
                      ticks: { font: { size: 12 } }
                    },
                    x: { 
                      ticks: { 
                        font: { size: 12 },
                        maxRotation: 45,
                        minRotation: 45
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Средний ЕР по периодам</h3>
            <div style={{ height: '250px' }}>
              <Line
                data={erByPeriodData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { display: false },
                    tooltip: { 
                      enabled: true,
                      callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.raw}%`
                      }
                    }
                  },
                  scales: {
                    y: { 
                      beginAtZero: true,
                      ticks: { font: { size: 12 } }
                    },
                    x: { ticks: { font: { size: 12 } } }
                  }
                }}
              />
            </div>
          </div>

          {filteredData.length === 0 && (
            <div className="mt-4 bg-white p-4 rounded-lg shadow text-center text-gray-600">
              Нет данных для выбранных фильтров. Попробуйте изменить проект или период.
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;