import React, { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import WebApp from '@twa-dev/sdk';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.WebApp) {
        try {
          if (process.env.NODE_ENV !== 'production') {
            console.log('Инициализация Telegram Web App...');
            console.log('WebApp version:', window.WebApp.version);
          }
          window.WebApp.ready();
          window.WebApp.expand();
          if (process.env.NODE_ENV !== 'production') {
            console.log('Telegram Web App инициализирован успешно');
          }
        } catch (err) {
          console.error('Ошибка инициализации Telegram Web App:', err);
        }
      } else if (process.env.NODE_ENV !== 'production') {
        console.log('Telegram Web App SDK не найден, работа в режиме браузера');
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

        if (cachedData && cachedTimestamp && (Date.now() - cachedTimestamp < cacheValidDuration)) {
          if (mounted) {
            setData(JSON.parse(cachedData));
            setProjects(JSON.parse(localStorage.getItem('projects') || '[]'));
            setLoading(false);
          }
          return;
        }

        const response = await fetch('/спецпроекты.xlsx');
        if (!response.ok) throw new Error(`Файл не найден: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        const allData = [];
        const projectNames = [];

        workbook.eachSheet((worksheet, sheetId) => {
          const sheetName = worksheet.name;
          projectNames.push(sheetName);

          const header = worksheet.getRow(1).values;
          if (header[1] !== 'Ссылка' || header[2] !== 'Просмотры' || header[3] !== 'СИ' || header[4] !== 'ЕР') {
            throw new Error(`Некорректные заголовки в листе ${sheetName}`);
          }

          const jsonData = [];
          let currentPeriod = '';
          const periodMap = new Map();

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
              periodMap.set(link, currentPeriod || 'Не указан');
            }
          });

          if (jsonData.length === 0) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn(`Лист ${sheetName} пуст`);
            }
            return;
          }

          allData.push(...jsonData);
        });

        if (mounted) {
          setData(allData);
          setProjects(projectNames);
          localStorage.setItem('excelData', JSON.stringify(allData));
          localStorage.setItem('projects', JSON.stringify(projectNames));
          localStorage.setItem('excelTimestamp', Date.now().toString());
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    loadExcelData();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredData = data.filter(row => 
    (!selectedProject || row.Спецпроект === selectedProject) &&
    (!selectedPeriod || row.Период === selectedPeriod)
  );

  const currentPeriodData = data.filter(row => row.Период === '14.07 - 20.07');
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

  // Данные для графика просмотров по проектам
  const projectViewsData = {
    labels: projects.filter(p => currentPeriodData.some(row => row.Спецпроект === p)),
    datasets: [{
      label: 'Просмотры',
      data: projects.filter(p => currentPeriodData.some(row => row.Спецпроект === p))
        .map(p => currentPeriodData.filter(row => row.Спецпроект === p)
          .reduce((sum, row) => sum + row.Просмотры, 0)),
      backgroundColor: 'rgba(129, 216, 208, 0.7)', // tiffany
      borderColor: 'rgba(129, 216, 208, 1)',
      borderWidth: 1
    }]
  };

  // Данные для графика ЕР по периодам
  const erByPeriodData = {
    labels: periods,
    datasets: [{
      label: 'Средний ЕР (%)',
      data: periods.map(period => {
        const periodData = data.filter(row => row.Период === period);
        return periodData.length > 0 
          ? (periodData.reduce((sum, row) => sum + row.ЕР, 0) / periodData.length * 100).toFixed(2)
          : 0;
      }),
      fill: false,
      borderColor: 'rgba(255, 105, 180, 1)', // pink
      tension: 0.1
    }]
  };

  return (
    <div className="p-4 max-w-5xl mx-auto glass-container">
      <button 
        className="absolute top-4 right-4 glass-button p-2"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <XMarkIcon className="h-6 w-6 text-white" /> : <Bars3Icon className="h-6 w-6 text-white" />}
      </button>

      <div className={`fixed top-0 right-0 h-full w-64 glass-sidebar transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50`}>
        <div className="p-4">
          <h2 className="text-xl font-bold text-white mb-4">Фильтры</h2>
          <select
            className="p-3 mb-4 w-full border-none rounded-lg glass-select bg-purple-800 bg-opacity-50 text-white"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            aria-label="Выбор спецпроекта"
          >
            <option value="" className="bg-purple-900">Все спецпроекты</option>
            {projects.map(project => (
              <option key={project} value={project} className="bg-purple-900">{project}</option>
            ))}
          </select>
          <select
            className="p-3 mb-4 w-full border-none rounded-lg glass-select bg-green-800 bg-opacity-50 text-white"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            aria-label="Выбор периода"
          >
            <option value="" className="bg-green-900">Все периоды</option>
            {periods.map(period => (
              <option key={period} value={period} className="bg-green-900">{period}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setSelectedProject('');
              setSelectedPeriod('');
            }}
            className="p-3 mb-4 w-full rounded-lg glass-button bg-orange-600 hover:bg-orange-700"
          >
            Сбросить фильтры
          </button>
          <button
            onClick={exportToCSV}
            className="p-3 w-full rounded-lg glass-button bg-orange-600 hover:bg-orange-700"
          >
            Экспорт в CSV
          </button>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-white mb-6 text-center">
        Дашборд спецпроектов
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="spinner glass-spinner border-t-orange-600"></div>
        </div>
      ) : error ? (
        <div className="text-pink-400 text-center">
          Ошибка: {error}. Попробуйте обновить страницу.
        </div>
      ) : (
        <>
          <div className="mb-8 glass-card p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Период: {selectedPeriod || '14.07 - 20.07'}</h2>
            <div className="mb-4">
              <div className="text-white mb-2">Просмотры: {totalViews.toLocaleString()} / {targetViews.toLocaleString()}</div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-tiffany to-pink h-4 rounded-full transition-all duration-1000" 
                  style={{ width: `${viewProgress}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-tiffany">{totalViews.toLocaleString()}</div>
                <div className="text-white">Просмотры</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-tiffany">{avgER}%</div>
                <div className="text-white">Средний ЕР</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-tiffany">{totalSI.toLocaleString()}</div>
                <div className="text-white">СИ</div>
              </div>
            </div>
          </div>

          <div className="mb-8 glass-card p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Просмотры по проектам (текущий период)</h3>
            <div style={{ height: '300px' }}>
              <Bar
                data={projectViewsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { display: false },
                    tooltip: { enabled: true }
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

          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Средний ЕР по периодам</h3>
            <div style={{ height: '300px' }}>
              <Line
                data={erByPeriodData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { display: false },
                    tooltip: { enabled: true }
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
            <div className="glass-card p-4 text-center text-white">
              Нет данных. Попробуйте выбрать другой проект или период, или сбросьте фильтры.
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;