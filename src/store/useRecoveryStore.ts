import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RecoverySession, TimelineEntry } from '../types';

interface RecoveryState {
  currentVoiceSession: {
    transcript: string;
    active: boolean;
    listening: boolean;
  };
  activeSession: RecoverySession | null;
  sessions: RecoverySession[];
  timeline: TimelineEntry[];
  
  // Actions
  setVoiceSession: (session: Partial<{ transcript: string; active: boolean; listening: boolean }>) => void;
  setActiveSession: (session: RecoverySession | null) => void;
  addSession: (session: RecoverySession) => void;
  setTimeline: (timeline: TimelineEntry[]) => void;
  addTimelineEntry: (entry: TimelineEntry) => void;
  clearTimeline: () => void;
}

export const useRecoveryStore = create<RecoveryState>()(
  persist(
    (set) => ({
      currentVoiceSession: {
        transcript: '',
        active: false,
        listening: false,
      },
      activeSession: null,
      sessions: [],
      timeline: [],
      
      setVoiceSession: (session) =>
        set((state) => ({
          currentVoiceSession: { ...state.currentVoiceSession, ...session },
        })),
      setActiveSession: (session) => set({ activeSession: session }),
      addSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions],
        })),
      setTimeline: (timeline) => set({ timeline }),
      addTimelineEntry: (entry) =>
        set((state) => ({
          timeline: [entry, ...state.timeline],
        })),
      clearTimeline: () => set({ timeline: [] }),
    }),
    {
      name: 'saho-recovery',
    }
  )
);
