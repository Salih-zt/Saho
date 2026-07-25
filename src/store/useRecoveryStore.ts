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
  addTimelineEntry: (entry: TimelineEntry) => void;
  clearTimeline: () => void;
}

const mockTimeline: TimelineEntry[] = [
  {
    id: 't-1',
    userId: 'any',
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    type: 'milestone',
    title: 'Recovery Path Initiated',
    description: 'You downloaded SAHO and configured your Circle of Safety. A brave first step.',
  },
  {
    id: 't-2',
    userId: 'any',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    type: 'breathing',
    title: 'Deep Breathing Session',
    description: 'Completed 3 minutes of guided breathing to navigate a mild afternoon craving.',
  },
  {
    id: 't-3',
    userId: 'any',
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    type: 'education',
    title: 'Learned about Cravings',
    description: 'Read the "Navigating Cravings" micro-card to understand physical triggers.',
  }
];

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
      timeline: mockTimeline,
      
      setVoiceSession: (session) =>
        set((state) => ({
          currentVoiceSession: { ...state.currentVoiceSession, ...session },
        })),
      setActiveSession: (session) => set({ activeSession: session }),
      addSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions],
        })),
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
