import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppState, ParticipationScore } from '../types';
import { updateState } from '../services/store';
import { ArrowLeft, Save, Check } from 'lucide-react';

interface Props {
  data: AppState;
}

const GradingPage: React.FC<Props> = ({ data }) => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const cls = data.classes.find(c => c.id === classId);
  const students = data.students.filter(s => s.classId === classId);
  const today = new Date().toISOString().split('T')[0];

  const [grades, setGrades] = useState<Record<string, ParticipationScore>>({});

  const setGrade = (studentId: string, score: ParticipationScore) => {
    setGrades(prev => ({ ...prev, [studentId]: score }));
  };

  const saveGrades = () => {
    updateState(prev => {
      const newLogs = Object.entries(grades).map(([studentId, score]) => ({
        id: Math.random().toString(36).substr(2, 9),
        studentId,
        classId: classId!,
        date: today,
        score,
        timestamp: Date.now()
      }));
      return {
        ...prev,
        participationLogs: [...prev.participationLogs, ...newLogs]
      };
    });
    navigate(-1);
  };

  if (!cls) return <div>Klasse nicht gefunden</div>;

  const scoreOptions: { score: ParticipationScore; label: string; color: string }[] = [
    { score: 2, label: '++', color: 'bg-green-600 text-white' },
    { score: 1, label: '+', color: 'bg-green-100 text-green-800 border-green-200' },
    { score: 0, label: '0', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    { score: -1, label: '-', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { score: -2, label: '--', color: 'bg-red-600 text-white' },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 shadow-sm flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-bold text-lg text-slate-800">{cls.name}</h1>
          <p className="text-xs text-slate-500">Mitarbeit • {new Date().toLocaleDateString('de-DE')}</p>
        </div>
        <button onClick={saveGrades} className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1 shadow-md active:scale-95 transition">
          <Save size={16} /> Speichern
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {students.map(student => (
          <div key={student.id} className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <span className="font-medium text-slate-900">{student.name}</span>
              {grades[student.id] !== undefined && <Check size={16} className="text-green-500" />}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {scoreOptions.map((opt) => (
                <button
                  key={opt.score}
                  onClick={() => setGrade(student.id, opt.score)}
                  className={`
                    py-3 rounded-lg text-sm font-bold border transition-all duration-200
                    ${opt.color}
                    ${grades[student.id] === opt.score ? 'ring-2 ring-offset-1 ring-indigo-500 scale-105 shadow-md' : 'opacity-80 border-transparent'}
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        {students.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            Keine Schüler in dieser Klasse. Fügen Sie Schüler im Reiter Klassen hinzu.
          </div>
        )}
      </div>
    </div>
  );
};

export default GradingPage;
