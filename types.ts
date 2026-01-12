export interface ClassGroup {
  id: string;
  name: string;
  color: string; // e.g., 'bg-red-500'
}

export interface Student {
  id: string;
  name: string;
  classId: string;
}

export interface ScheduleItem {
  id: string;
  classId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // "09:00"
  endTime: string; // "10:00"
}

export type ParticipationScore = 2 | 1 | 0 | -1 | -2;

export interface ParticipationLog {
  id: string;
  studentId: string;
  classId: string;
  date: string; // ISO Date string YYYY-MM-DD
  score: ParticipationScore;
  timestamp: number;
}

export type BehaviorCategory = 
  | 'Verantwortung' 
  | 'Arbeits- und Sozialverhalten' 
  | 'Leistung im Fach' 
  | 'Informativ' 
  | 'Sonstige Beobachtungen';

export interface BehaviorIncident {
  id: string;
  studentId: string;
  classId: string;
  category: BehaviorCategory;
  observation: string;
  notes?: string;
  severity: number; // 1 (Positive), -1 (Negative), 0 (Neutral/Info)
  timestamp: number;
}

export interface AppState {
  classes: ClassGroup[];
  students: Student[];
  schedule: ScheduleItem[];
  participationLogs: ParticipationLog[];
  behaviorLogs: BehaviorIncident[];
}
