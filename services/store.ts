import { AppState } from '../types';

const STORAGE_KEY = 'concordia_data_v1';

const INITIAL_STATE: AppState = {
  classes: [
    { id: 'c1', name: 'Geschichte 7b', color: 'bg-blue-500' },
    { id: 'c2', name: 'Mathe 5a', color: 'bg-green-500' },
  ],
  students: [
    { id: 's1', name: 'Leon Müller', classId: 'c1' },
    { id: 's2', name: 'Mia Schmidt', classId: 'c1' },
    { id: 's3', name: 'Elias Weber', classId: 'c2' },
  ],
  schedule: [
    { id: 'sch1', classId: 'c1', dayOfWeek: 1, startTime: '08:00', endTime: '09:30' }, // Montag
    { id: 'sch2', classId: 'c1', dayOfWeek: 3, startTime: '10:00', endTime: '11:30' }, // Mittwoch
    { id: 'sch3', classId: 'c2', dayOfWeek: 2, startTime: '08:00', endTime: '09:30' }, // Dienstag
  ],
  participationLogs: [],
  behaviorLogs: [],
};

export const loadState = (): AppState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return INITIAL_STATE;
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse state", e);
    return INITIAL_STATE;
  }
};

export const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const updateState = (updater: (state: AppState) => AppState) => {
  const current = loadState();
  const next = updater(current);
  saveState(next);
  window.dispatchEvent(new CustomEvent('state-updated'));
  return next;
};
