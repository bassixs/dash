import React from 'react';
import { useParams } from 'react-router-dom';

const ProjectMenu = ({ navigate }) => {
  const { period } = useParams();
  const projects = [
    'Шеф сделал', 'Здесь и сейчас', 'Новый Калужский', 'Наши лица',
    'Гордость региона', 'Песни о родном крае', 'Калужская тропа',
    'ЦУРу 5 лет', 'ДЭГ', 'Ответ Губернатора', 'Невозможно без',
    'Здесь мой дом', '#Я_ГОРЖУСЬ'
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Период: {period}</h1>
      <button
        className="bg-green-500 text-white p-2 rounded mb-4 w-full"
        onClick={() => navigate(`/dashboard/general/${encodeURIComponent(period)}`)}
      >
        Общий дашборд
      </button>
      <h2 className="text-xl font-semibold mb-2">Выберите проект</h2>
      <div className="grid grid-cols-1 gap-2">
        {projects.map(project => (
          <button
            key={project}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            onClick={() => navigate(`/dashboard/project/${encodeURIComponent(period)}/${encodeURIComponent(project)}`)}
          >
            {project}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProjectMenu;