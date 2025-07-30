import React from 'react';

   export default function SettingsPage() {
     return (
       <div className="p-4 sm:p-6">
         <h1 className="text-3xl font-bold mb-6 text-center">Настройки</h1>
         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
           <h3 className="text-lg font-semibold mb-4">Настройки приложения</h3>
           <div className="space-y-4">
             <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
               Сменить тему
             </button>
             <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
               Импортировать новый Excel
             </button>
           </div>
         </div>
       </div>
     );
   }