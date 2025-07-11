import React, { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import WebApp from '@twa-dev/sdk';
import Charts from './components/Charts';
import ErrorBoundary from './components/ErrorBoundary';
import './styles.css';

function App() {
  const [data, setData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [periods, setPeriods] = useState([
    '02.06 - 08.06', '09.06 - 15.06', '16.06 - 22.06', 
    '23.06 - 29.06', '30.06 - 06.07', '07.07 - 13.07'
  ]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <ErrorBoundary>
      <div className="p-4 max-w-5xl mx-auto glass-container">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Дашборд спецпроектов
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 glass-card">
          <select
            className="p-3 border-none rounded-lg glass-select bg-purple-800 bg-opacity-50 text-white"
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
            className="p-3 border-none rounded-lg glass-select bg-green-800 bg-opacity-50 text-white"
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
            onClick={exportToCSV}
            className="p-3 rounded-lg glass-button bg-orange-600 hover:bg-orange-700"
          >
            Экспорт в CSV
          </button>
        </div>

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
            <Charts data={filteredData} projects={projects} periods={periods} />
            {filteredData.length === 0 && (
              <div className="glass-card p-4 text-center text-white">
                Нет данных. Попробуйте выбрать другой проект или период, или сбросьте фильтры.
                <button
                  onClick={() => {
                    setSelectedProject('');
                    setSelectedPeriod('');
                  }}
                  className="ml-2 text-orange-400 underline"
                >
                  Сбросить фильтры
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;