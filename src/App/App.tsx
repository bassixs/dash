import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from '@features/dashboard';
import { ChartsPage, SettingsPage, Navbar } from '@features/dashboard/components';
import '@shared/styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-[78px]">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/charts" element={<ChartsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
        <Navbar />
      </div>
    </BrowserRouter>
  );
}
