import React, { useState } from 'react';
import { AppState } from '../types';
import { updateState } from '../services/store';
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';

const simpleId = () => Math.random().toString(36).substr(2, 9);

interface Props {
  data: AppState;
}

const ClassesPage: React.FC<Props> = ({ data }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [newStudentName, setNewStudentName] = useState('');

  const createClass = () => {
    if (!newClassName.trim()) return;
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    updateState((prev) => ({
      ...prev,
      classes: [...prev.classes, { id: simpleId(), name: newClassName, color: randomColor }],
    }));
    setNewClassName('');
    setIsCreating(false);
  };

  const deleteClass = (id: string) => {
    if (!confirm('Diese Klasse und alle Schüler löschen?')) return;
    updateState((prev) => ({
      ...prev,
      classes: prev.classes.filter(c => c.id !== id),
      students: prev.students.filter(s => s.classId !== id),
      schedule: prev.schedule.filter(s => s.classId !== id),
    }));
  };

  const addStudent = (classId: string) => {
    if (!newStudentName.trim()) return;
    updateState((prev) => ({
      ...prev,
      students: [...prev.students, { id: simpleId(), name: newStudentName, classId }],
    }));
    setNewStudentName('');
  };

  const deleteStudent = (id: string) => {
     updateState((prev) => ({
      ...prev,
      students: prev.students.filter(s => s.id !== id),
    }));
  };

  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Klassen</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          <Plus size={16} /> Neue Klasse
        </button>
      </header>

      {isCreating && (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-indigo-100 animate-in fade-in slide-in-from-top-4">
          <input
            autoFocus
            type="text"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder="Klassenname (z.B. Bio 10a)"
            className="w-full p-2 border border-slate-200 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsCreating(false)} className="px-3 py-1 text-slate-500">Abbrechen</button>
            <button onClick={createClass} className="px-3 py-1 bg-indigo-600 text-white rounded-md">Erstellen</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {data.classes.map((cls) => {
          const students = data.students.filter(s => s.classId === cls.id);
          const isExpanded = expandedClass === cls.id;

          return (
            <div key={cls.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                onClick={() => setExpandedClass(isExpanded ? null : cls.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${cls.color}`} />
                  <div>
                    <h3 className="font-semibold text-slate-800">{cls.name}</h3>
                    <p className="text-xs text-slate-500">{students.length} Schüler</p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
              </div>

              {isExpanded && (
                <div className="bg-slate-50 border-t border-slate-100 p-4 space-y-3">
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder="Schülername hinzufügen..."
                      className="flex-1 p-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      onKeyDown={(e) => e.key === 'Enter' && addStudent(cls.id)}
                    />
                    <button onClick={() => addStudent(cls.id)} className="bg-indigo-600 text-white p-2 rounded-md">
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {students.map(s => (
                      <div key={s.id} className="flex justify-between items-center bg-white p-2 rounded border border-slate-100 text-sm">
                        <span>{s.name}</span>
                        <button onClick={(e) => { e.stopPropagation(); deleteStudent(s.id); }} className="text-slate-400 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {students.length === 0 && <p className="text-xs text-slate-400 text-center italic">Noch keine Schüler.</p>}
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-200 flex justify-end">
                     <button onClick={(e) => { e.stopPropagation(); deleteClass(cls.id); }} className="text-red-500 text-xs flex items-center gap-1 hover:underline">
                        <Trash2 size={12} /> Klasse löschen
                     </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClassesPage;
