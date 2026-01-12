import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppState } from '../types';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface Props {
  data: AppState;
}

const DAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

const CalendarPage: React.FC<Props> = ({ data }) => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());

  const sessionsForDay = data.schedule
    .filter((s) => s.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const getClass = (id: string) => data.classes.find((c) => c.id === id);

  const handleDayChange = (direction: 'prev' | 'next') => {
    setSelectedDay((prev) => {
      if (direction === 'prev') return prev === 0 ? 6 : prev - 1;
      return prev === 6 ? 0 : prev + 1;
    });
  };

  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Stundenplan</h1>
        <div className="text-sm text-slate-500">{new Date().toLocaleDateString('de-DE')}</div>
      </header>

      {/* Day Navigation */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
        <button onClick={() => handleDayChange('prev')} className="p-2 hover:bg-slate-50 rounded-full text-slate-600">
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900">{DAYS[selectedDay]}</h2>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Tagesansicht</p>
        </div>
        <button onClick={() => handleDayChange('next')} className="p-2 hover:bg-slate-50 rounded-full text-slate-600">
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {sessionsForDay.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <div className="mb-2">☕</div>
            <p>Kein Unterricht an diesem Tag geplant.</p>
          </div>
        ) : (
          sessionsForDay.map((session) => {
            const classData = getClass(session.classId);
            if (!classData) return null;

            return (
              <div
                key={session.id}
                onClick={() => navigate(`/grade/${classData.id}`)}
                className="group relative bg-white rounded-xl shadow-sm border border-slate-100 p-4 transition active:scale-95 cursor-pointer hover:border-indigo-200"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-2 rounded-l-xl ${classData.color}`} />
                <div className="pl-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{classData.name}</h3>
                    <p className="text-slate-500 text-sm">
                      {session.startTime} - {session.endTime}
                    </p>
                  </div>
                  <button className="bg-indigo-50 text-indigo-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <CheckCircle2 size={24} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
