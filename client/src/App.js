import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { init, useWebApp } from '@telegram-apps/sdk';
import PeriodMenu from './components/PeriodMenu';
import ProjectMenu from './components/ProjectMenu';
import Dashboard from './components/Dashboard';

const App = () => {
  const [theme, setTheme] = useState('light');
  const webApp = useWebApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (webApp) {
      setTheme(webApp.colorScheme);
      webApp.ready();
    }
  }, [webApp]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <Routes>
        <Route path="/" element={<PeriodMenu navigate={navigate} />} />
        <Route path="/projects/:period" element={<ProjectMenu navigate={navigate} />} />
        <Route path="/dashboard/:type/:period/:sheet?" element={<Dashboard />} />
      </Routes>
    </div>
  );
};

export default App;