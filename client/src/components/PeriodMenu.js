import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PeriodMenu = ({ navigate }) => {
  const [periods, setPeriods] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/periods')
      .then(response => setPeriods(response.data))
      .catch(err => setError('Ошибка загрузки периодов'));
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Выберите период</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 gap-2">
        {periods.map(period => (
          <button
            key={period}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            onClick={() => navigate(`/projects/${encodeURIComponent(period)}`)}
          >
            {period}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PeriodMenu;