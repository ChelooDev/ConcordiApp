import React, { useState } from 'react';
import { AppState, BehaviorCategory } from '../types';
import { updateState } from '../services/store';
import { ChevronDown, Info, ThumbsDown, ThumbsUp } from 'lucide-react';

interface Props {
  data: AppState;
}

// Data structure mapping the requested categories to observations and their implicit severity
// Severity: 1 = Positive, -1 = Negative, 0 = Neutral/Informative
const INCIDENTS: Record<BehaviorCategory, { text: string; severity: number }[]> = {
  "Verantwortung": [
    { text: "Hausaufgaben fehlen", severity: -1 },
    { text: "Fehlendes Unterrichtsmaterial", severity: -1 },
  ],
  "Arbeits- und Sozialverhalten": [
    { text: "Unpassende Wortwahl", severity: -1 },
    { text: "Unangemessenes Verhalten", severity: -1 },
    { text: "Beteiligt sich nicht am Unterricht", severity: -1 },
    { text: "Ignoriert Anweisungen", severity: -1 },
    { text: "Mangelnde Ordnung (Heft, Tisch, etc)", severity: -1 },
    { text: "Zu spät zum Unterricht erschienen", severity: -1 },
    { text: "Unhöfliches Verhalten gegenüber Mitschülern/Lehrern", severity: -1 },
    { text: "Unterbricht den Lehrer/Mitschüler", severity: -1 },
    { text: "Engagiert sich aktiv im Unterricht", severity: 1 },
    { text: "Freundlicher und respektvoller Umgang mit Mitschülern/Lehrern", severity: 1 },
    { text: "Beachtet die Klassenregeln", severity: 1 },
    { text: "Verhalten entspricht den Erwartungen", severity: 1 },
  ],
  "Leistung im Fach": [
    { text: "Sehr gute schriftliche Leistungen/Präsentation im Unterricht", severity: 1 },
    { text: "Ausgezeichnete Leistung (volle Punktzahl)", severity: 1 },
    { text: "Mangelhafte Leistung (niedrige Punktzahl)", severity: -1 },
    { text: "Unfaire Methoden bei der Prüfung", severity: -1 },
    { text: "Aufgaben werden nicht rechtzeitig abgeschlossen", severity: -1 },
    { text: "Abgegebene Hausaufgabe ist unvollständig", severity: -1 },
    { text: "Hat Schwierigkeiten, den Stoff vollständig zu verstehen", severity: -1 },
  ],
  "Informativ": [
    { text: "Häufige Anfragen für Toilettenpausen", severity: 0 },
    { text: "Häufige Anfragen, zur Krankenschwester zu gehen", severity: 0 },
    { text: "Häufige Abwesenheit", severity: 0 },
    { text: "Wirkt häufig müde", severity: 0 },
    { text: "Musste den Unterrichtsraum verlassen", severity: 0 },
  ],
  "Sonstige Beobachtungen": []
};

const TicketPage: React.FC<Props> = ({ data }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(data.classes[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [category, setCategory] = useState<BehaviorCategory>('Verantwortung');
  const [observation, setObservation] = useState('');
  const [severity, setSeverity] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const filteredStudents = data.students.filter(s => s.classId === selectedClassId);

  const handleSubmit = () => {
    if (!selectedStudentId || (!observation && category !== 'Sonstige Beobachtungen')) return;

    // For "Sonstige", allow manual entry without pre-selection, default to neutral if undefined
    const finalObservation = observation || notes; 
    if (!finalObservation) return; 

    updateState(prev => ({
      ...prev,
      behaviorLogs: [...prev.behaviorLogs, {
        id: Math.random().toString(36).substr(2, 9),
        studentId: selectedStudentId,
        classId: selectedClassId,
        category,
        observation: finalObservation,
        notes,
        severity,
        timestamp: Date.now()
      }]
    }));

    setSuccessMsg('Eintrag erfolgreich gespeichert');
    setObservation('');
    setNotes('');
    setSeverity(0);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const selectObservation = (text: string, sev: number) => {
    setObservation(text);
    setSeverity(sev);
  };

  return (
    <div className="p-4 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Verhalten protokollieren</h1>
        <p className="text-slate-500 text-sm">Erstelle einen neuen Eintrag</p>
      </header>

      {successMsg && (
        <div className="bg-green-100 text-green-800 p-3 rounded-lg text-sm font-medium animate-pulse">
          {successMsg}
        </div>
      )}

      <div className="space-y-4">
        {/* Class & Student */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Klasse</label>
            <div className="relative">
              <select
                className="w-full p-2 bg-slate-50 rounded-lg appearance-none border border-slate-200 mt-1 text-slate-900"
                value={selectedClassId}
                onChange={(e) => { setSelectedClassId(e.target.value); setSelectedStudentId(''); }}
              >
                {data.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-4 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Schüler</label>
            <div className="relative">
              <select
                className="w-full p-2 bg-slate-50 rounded-lg appearance-none border border-slate-200 mt-1 text-slate-900"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                disabled={!selectedClassId}
              >
                <option value="">Schüler auswählen...</option>
                {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
               <ChevronDown className="absolute right-3 top-4 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-4">
           <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Kategorie</label>
            <div className="flex gap-2 mt-2 overflow-x-auto pb-2 no-scrollbar">
              {(Object.keys(INCIDENTS) as BehaviorCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setObservation(''); }}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                    category === cat 
                    ? 'bg-slate-800 text-white border-slate-800' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Observations List */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">
              {category === 'Sonstige Beobachtungen' ? 'Beschreibung' : 'Beobachtung auswählen'}
            </label>
            
            {category === 'Sonstige Beobachtungen' ? (
               <input
                type="text"
                value={observation}
                onChange={(e) => { setObservation(e.target.value); setSeverity(0); }}
                placeholder="Was ist passiert?"
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            ) : (
              <div className="flex flex-col gap-2">
                  {INCIDENTS[category].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectObservation(item.text, item.severity)}
                      className={`
                        text-left px-3 py-3 rounded-lg text-sm border transition flex items-center gap-3
                        ${observation === item.text 
                          ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50 text-indigo-900' 
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}
                      `}
                    >
                      {item.severity === 1 && <ThumbsUp size={16} className="text-green-500 shrink-0" />}
                      {item.severity === -1 && <ThumbsDown size={16} className="text-red-500 shrink-0" />}
                      {item.severity === 0 && <Info size={16} className="text-blue-400 shrink-0" />}
                      {item.text}
                    </button>
                  ))}
              </div>
            )}
          </div>

           <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Notizen (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Zusätzliche Infos..."
              className="w-full p-2 border border-slate-200 rounded-lg mt-1 h-20 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selectedStudentId || (!observation && category !== 'Sonstige Beobachtungen')}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition hover:bg-indigo-700"
        >
          Eintrag speichern
        </button>
      </div>
    </div>
  );
};

export default TicketPage;
