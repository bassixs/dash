import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const { type, period, sheet } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const url = type === 'general'
      ? `http://localhost:5000/api/dashboard/general/${encodeURIComponent(period)}`
      : `http://localhost:5000/api/dashboard/project/${encodeURIComponent(sheet)}/${encodeURIComponent(period)}`;
    
    axios.get(url)
      .then(response => setData(response.data))
      .catch(err => setError('Ошибка загрузки данных'));
  }, [type, period, sheet]);

  if (error) return <div className="container mx-auto">Ошибка: {error}</div>;
  if (!data) return <div className="container mx-auto">Загрузка...</div>;

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Дашборд</h1>
      {/* Здесь можно отобразить данные, например: */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
      {/* Добавьте свою логику отображения данных */}
    </div>
  );
};

export default Dashboard;