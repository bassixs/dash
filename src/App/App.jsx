import React, { useEffect } from 'react';
import { initTelegramSDK } from '../shared/utils/telegram';
import DashboardPage from '../features/dashboard';

function App() {
  useEffect(() => {
    initTelegramSDK(); // Инициализация Telegram Mini App SDK
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <DashboardPage />
    </main>
  );
}

export default App;
