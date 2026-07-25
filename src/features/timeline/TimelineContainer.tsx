'use client';

import React, { useState, useEffect } from 'react';
import { useRecoveryStore } from '../../store/useRecoveryStore';
import { TimelineEntry } from '../../types';
import { 
  History, Calendar, Wind, Phone, BookOpen, 
  Award, Heart, Sparkles, RefreshCw 
} from 'lucide-react';

const REFLECTIONS = [
  "Your recovery is not defined by a single moment, but by your continuous choice to move forward. Be gentle with yourself today.",
  "Every slow breath you take is a declaration of your strength and worth. You deserve this healing path.",
  "You do not have to see the whole staircase, just take the first step. Today, focus on getting through one moment at a time.",
  "Cravings are waves that rise, peak, and break. You are the shore, stable and enduring. Let them wash over you and dissolve.",
  "Asking for support is never a sign of weakness; it is the ultimate proof of your courage and self-awareness."
];

export default function TimelineContainer() {
  const { timeline, clearTimeline } = useRecoveryStore();
  const [reflection, setReflection] = useState('');
  const [loadingReflection, setLoadingReflection] = useState(false);

  // Load a daily reflection
  const getReflection = () => {
    setLoadingReflection(true);
    // Simple heuristic selection based on date index, or random
    const idx = new Date().getDate() % REFLECTIONS.length;
    setTimeout(() => {
      setReflection(REFLECTIONS[idx]);
      setLoadingReflection(false);
    }, 500);
  };

  useEffect(() => {
    getReflection();
  }, []);

  const getEntryIcon = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'breathing':
        return <Wind className="w-5 h-5 text-secondary" />;
      case 'contact':
        return <Phone className="w-5 h-5 text-amber-500" />;
      case 'education':
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'milestone':
        return <Award className="w-5 h-5 text-purple-500" />;
      default:
        return <Heart className="w-5 h-5 text-rose-500" />;
    }
  };

  const getEntryColor = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'breathing':
        return 'border-secondary/20 bg-secondary/5';
      case 'contact':
        return 'border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/10';
      case 'education':
        return 'border-blue-200 bg-blue-50/40 dark:border-blue-900/40 dark:bg-blue-950/10';
      case 'milestone':
        return 'border-purple-200 bg-purple-50/40 dark:border-purple-900/40 dark:bg-purple-950/10';
      default:
        return 'border-rose-200 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/10';
    }
  };

  return (
    <div className="max-w-md mx-auto w-full px-4 py-6 space-y-6 pb-20">
      
      {/* Header section */}
      <header className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-primary dark:text-secondary flex items-center gap-2">
          <History className="w-6 h-6 stroke-[2px]" />
          <span>Recovery Timeline</span>
        </h2>
        <p className="text-xs text-muted-foreground">
          Celebrating healthy choices and mindful moments.
        </p>
      </header>

      {/* Daily Reflection Block */}
      <section className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden">
        <div className="flex items-center space-x-1.5 text-secondary">
          <Sparkles className="w-4.5 h-4.5 fill-current" />
          <h3 className="text-xs font-bold uppercase tracking-wider">Compassionate Reflection</h3>
        </div>
        
        {loadingReflection ? (
          <div className="h-10 flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-secondary animate-spin" />
          </div>
        ) : (
          <p className="text-sm font-medium leading-relaxed italic text-foreground/90">
            "{reflection}"
          </p>
        )}
      </section>

      {/* Decisions Log */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            Healthy Decisions Log
          </h3>
          {timeline.length > 0 && (
            <button
              onClick={clearTimeline}
              className="text-[10px] uppercase font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
            >
              Reset Log
            </button>
          )}
        </div>

        <div className="space-y-3 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
          {timeline.map((entry) => (
            <div 
              key={entry.id}
              className={`flex items-start p-4 rounded-3xl border relative z-10 bg-card ml-1.5 ${getEntryColor(entry.type)}`}
            >
              {/* Event Icon Bubble */}
              <div className="w-9 h-9 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-border/50 flex items-center justify-center flex-shrink-0 mr-4">
                {getEntryIcon(entry.type)}
              </div>

              {/* Event text details */}
              <div className="space-y-1 flex-1">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-bold text-sm text-foreground">{entry.title}</h4>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground font-medium">
                  {entry.description}
                </p>
              </div>
            </div>
          ))}

          {timeline.length === 0 && (
            <div className="p-8 border border-dashed border-border rounded-3xl text-center ml-1.5 bg-card">
              <Award className="w-8 h-8 text-muted-foreground/60 mx-auto mb-2" />
              <p className="text-xs font-semibold text-muted-foreground">Your timeline is ready.</p>
              <p className="text-[11px] text-muted-foreground/75 mt-0.5">Complete guided exercises or log cravings to see milestones celebrated here.</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
