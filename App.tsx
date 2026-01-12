import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Calendar, Users, BarChart3, PlusCircle } from 'lucide-react';
import { loadState } from './services/store';
import { AppState } from './types';

// Pages
import CalendarPage from './pages/CalendarPage';
import ClassesPage from './pages/ClassesPage';
import TicketPage from './pages/TicketPage';
import AnalyticsPage from './pages/AnalyticsPage';
import GradingPage from './pages/GradingPage';

const App: React.FC = () => {
  const [data, setData] = useState<AppState>(loadState());

  useEffect(() => {
    const handleStorageChange = () => {
      setData(loadState());
    };
    window.addEventListener('state-updated', handleStorageChange);
    return () => window.removeEventListener('state-updated', handleStorageChange);
  }, []);

  return (
    <HashRouter>
      <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-20 no-scrollbar">
          <Routes>
            <Route path="/" element={<CalendarPage data={data} />} />
            <Route path="/classes" element={<ClassesPage data={data} />} />
            <Route path="/ticket" element={<TicketPage data={data} />} />
            <Route path="/analytics" element={<AnalyticsPage data={data} />} />
            <Route path="/grade/:classId" element={<GradingPage data={data} />} />
          </Routes>
        </main>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </HashRouter>
  );
};

const BottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Calendar, label: 'Stundenplan' },
    { path: '/classes', icon: Users, label: 'Klassen' },
    { path: '/ticket', icon: PlusCircle, label: 'Eintrag', highlight: true },
    { path: '/analytics', icon: BarChart3, label: 'Berichte' },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center w-full h-full space-y-1
              ${isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}
            `}
          >
            {item.highlight ? (
               <div className="bg-indigo-600 text-white p-3 rounded-full -mt-6 shadow-lg border-4 border-gray-50">
                 <item.icon size={24} />
               </div>
            ) : (
              <>
                <item.icon size={20} />
                <span className="text-xs font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default App;
