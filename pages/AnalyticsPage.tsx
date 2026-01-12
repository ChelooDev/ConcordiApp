import React, { useState, useMemo } from 'react';
import { AppState } from '../types';
import { generateStudentReport } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { Sparkles, Loader2, Search } from 'lucide-react';

interface Props {
  data: AppState;
}

const AnalyticsPage: React.FC<Props> = ({ data }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Overall Stats
  const totalPositive = data.behaviorLogs.filter(l => l.severity > 0).length;
  const totalNegative = data.behaviorLogs.filter(l => l.severity < 0).length;
  // Fallback for empty data to avoid empty chart
  const pieData = (totalPositive === 0 && totalNegative === 0) 
    ? [{ name: 'Keine Daten', value: 1 }] 
    : [
        { name: 'Positiv', value: totalPositive },
        { name: 'Negativ', value: totalNegative }
      ];
      
  const COLORS = (totalPositive === 0 && totalNegative === 0) 
    ? ['#e2e8f0'] 
    : ['#22c55e', '#ef4444'];

  const selectedStudent = data.students.find(s => s.id === selectedStudentId);

  const studentStats = useMemo(() => {
    if (!selectedStudentId) return null;
    const pLogs = data.participationLogs.filter(l => l.studentId === selectedStudentId);
    const bLogs = data.behaviorLogs.filter(l => l.studentId === selectedStudentId);
    
    const score = pLogs.reduce((acc, l) => acc + l.score, 0);
    const incidents = bLogs.length;

    // Simple weekly data for chart
    const last7Days = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });

    const chartData = last7Days.map(date => ({
        date: date.slice(5), // MM-DD
        score: pLogs.filter(l => l.date === date).reduce((acc, l) => acc + l.score, 0)
    }));

    return { score, incidents, chartData, pLogs, bLogs };
  }, [selectedStudentId, data]);

  const handleGenerateReport = async () => {
    if (!selectedStudent || !studentStats) return;
    setLoadingAi(true);
    setAiReport(null);
    const report = await generateStudentReport(selectedStudent, studentStats.bLogs, studentStats.pLogs);
    setAiReport(report);
    setLoadingAi(false);
  };

  return (
    <div className="p-4 space-y-6">
       <header>
        <h1 className="text-2xl font-bold text-slate-800">Analyse</h1>
      </header>

      {/* Global Overview Card */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
         <div className="w-1/2">
            <h3 className="text-lg font-bold text-slate-700">Klassenbilanz</h3>
            <p className="text-sm text-slate-500">Positive vs Negative Einträge</p>
         </div>
         <div className="w-1/2 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* Student Filter */}
      <div className="space-y-4">
        <label className="text-sm font-semibold text-slate-500 uppercase">Detaillierter Schülerbericht</label>
        <div className="relative">
             <Search className="absolute left-3 top-3 text-slate-400" size={16} />
             <select
                className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-slate-200 appearance-none focus:ring-2 focus:ring-indigo-500 outline-none"
                value={selectedStudentId}
                onChange={(e) => { setSelectedStudentId(e.target.value); setAiReport(null); }}
             >
                <option value="">Schüler auswählen...</option>
                {data.students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
             </select>
        </div>
      </div>

      {selectedStudent && studentStats && (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-100 text-center">
                    <div className="text-2xl font-bold text-indigo-600">{studentStats.score}</div>
                    <div className="text-xs text-slate-500">Mitarbeitsnote</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 text-center">
                    <div className="text-2xl font-bold text-slate-700">{studentStats.incidents}</div>
                    <div className="text-xs text-slate-500">Verhaltenseinträge</div>
                </div>
            </div>

            {/* Participation Trend */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 h-48">
                 <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase">7-Tage-Trend (Mitarbeit)</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={studentStats.chartData}>
                        <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
            </div>

            {/* AI Action */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                           <Sparkles size={18} className="text-indigo-600" /> KI-Einblicke
                        </h3>
                        <p className="text-xs text-indigo-700 mt-1">Zusammenfassung & Strategie generieren</p>
                    </div>
                    {!aiReport && (
                        <button 
                            onClick={handleGenerateReport}
                            disabled={loadingAi}
                            className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loadingAi ? <Loader2 className="animate-spin" size={16} /> : 'Generieren'}
                        </button>
                    )}
                </div>
                
                {aiReport && (
                    <div className="text-sm text-indigo-900 bg-white p-3 rounded-lg border border-indigo-100 leading-relaxed whitespace-pre-line">
                        {aiReport}
                    </div>
                )}
            </div>
            
            {/* History List */}
            <div className="space-y-2">
                 <h4 className="text-xs font-semibold text-slate-400 uppercase">Letzte Einträge</h4>
                 {studentStats.bLogs.slice().reverse().slice(0, 5).map(log => (
                     <div key={log.id} className="bg-white p-3 rounded-lg border border-slate-100 text-sm">
                         <div className="flex justify-between">
                            <span className="font-medium text-slate-800">{log.category}</span>
                            <span className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</span>
                         </div>
                         <p className="text-slate-600 mt-1">{log.observation}</p>
                     </div>
                 ))}
                 {studentStats.bLogs.length === 0 && <p className="text-xs text-slate-400 italic">Keine Einträge vorhanden.</p>}
            </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
