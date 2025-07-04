import React from 'react';
import { Settings, BarChart, Plus, Brain } from 'lucide-react';
import StatsModalNew from './StatsModalNew';
import NewPVMModal from './NewPVMModal'; 
import AnalyticsModal from './AnalyticsModal';

export default function Header() {
  const [dateTime, setDateTime] = React.useState(new Date());
  const [showNewStats, setShowNewStats] = React.useState(false);
  const [showNewPVM, setShowNewPVM] = React.useState(false);
  const [showAnalytics, setShowAnalytics] = React.useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-gray-900 text-white p-4 border-b border-gray-700">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img
            src="https://i.imghippo.com/files/pD5615EE.jpg"
            alt="Qarmet Logo"
            className="h-12 mr-4 rounded"
          />
        </div>
        <h1 className="text-2xl font-bold">Учёт пробегов ПВМ МНЛЗ 3</h1>
        <div className="flex items-center gap-4">
          <time className="text-lg">
            {dateTime.toLocaleString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </time>
          <button 
            onClick={() => setShowNewStats(true)}
            className="p-2 hover:bg-gray-700 rounded-full"
            title="Новая статистика"
          >
            <BarChart className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setShowNewPVM(true)}
            className="p-2 hover:bg-gray-700 rounded-full"
            title="Добавить ПВМ"
          >
            <Plus className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setShowAnalytics(true)}
            className="p-2 hover:bg-gray-700 rounded-full"
            title="Анализ данных"
          >
            <Brain className="w-6 h-6" />
          </button>
        </div>
      </div>
      {showNewStats && (
        <StatsModalNew onClose={() => setShowNewStats(false)} />
      )}
      {showNewPVM && (
        <NewPVMModal onClose={() => setShowNewPVM(false)} />
      )}
      {showAnalytics && (
        <AnalyticsModal onClose={() => setShowAnalytics(false)} />
      )}
    </header>
  );
}