import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Charts = ({ data, projects, periods }) => {
  // Данные для столбчатой диаграммы (просмотры по проектам)
  const barData = {
    labels: projects,
    datasets: [
      {
        label: 'Просмотры',
        data: projects.map(project =>
          data
            .filter(row => row.Спецпроект === project)
            .reduce((sum, row) => sum + row.Просмотры, 0)
        ),
        backgroundColor: ['#81D8D0', '#FF69B4', '#FFFFFF', '#81D8D0', '#FF69B4'],
      },
    ],
  };

  // Данные для линейного графика (средний ЕР по периодам)
  const lineData = {
    labels: periods,
    datasets: [
      {
        label: 'Средний ЕР (%)',
        data: periods.map(period =>
          {
            const filtered = data.filter(row => row.Период === period);
            const avgEr = filtered.length
              ? filtered.reduce((sum, row) => sum + row.ЕР, 0) / filtered.length * 100
              : 0;
            return avgEr.toFixed(2);
          }
        ),
        borderColor: '#FF69B4',
        backgroundColor: '#FF69B4',
        fill: false,
      },
    ],
  };

  return (
    <div className="mb-6 space-y-6">
      <div className="glass-card p-4">
        <h2 className="text-xl font-semibold text-white mb-4">Просмотры по спецпроектам</h2>
        <Bar
          data={barData}
          options={{
            responsive: true,
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Просмотры', color: '#FFFFFF' } },
              x: { title: { display: true, text: 'Спецпроекты', color: '#FFFFFF' } },
            },
            plugins: {
              legend: { labels: { color: '#FFFFFF' } },
              title: { display: false },
            },
          }}
        />
      </div>
      <div className="glass-card p-4">
        <h2 className="text-xl font-semibold text-white mb-4">Средний ЕР по периодам</h2>
        <Line
          data={lineData}
          options={{
            responsive: true,
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'ЕР (%)', color: '#FFFFFF' } },
              x: { title: { display: true, text: 'Периоды', color: '#FFFFFF' } },
            },
            plugins: {
              legend: { labels: { color: '#FFFFFF' } },
              title: { display: false },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Charts;