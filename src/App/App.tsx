import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Dashboard from '../features/dashboard';
import AnalyticsPage from '../features/dashboard/components/AnalyticsPage';
import SettingsPage from '../features/dashboard/components/SettingsPage';
import Navbar from '../features/dashboard/components/Navbar';
import '../shared/styles/global.css';

// Создаем QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen relative overflow-hidden">
          {/* Плавающие геометрические фигуры */}
          <div className="floating-shapes">
            <div className="floating-shape"></div>
            <div className="floating-shape"></div>
            <div className="floating-shape"></div>
          </div>
          
          {/* Основной контент */}
          <div className="relative z-10">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
          
          {/* Навигация */}
          <Navbar />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
