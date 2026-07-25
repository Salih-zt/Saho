'use client';

import React, { useState, useEffect } from 'react';
import { useRecoveryStore } from '../../store/useRecoveryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { TimelineService } from '../../services/timelineService';
import { EducationService } from '../../services/educationService';
import { EducationCard } from '../../types';
import { 
  BookOpen, Heart, Flame, ShieldAlert, Award, 
  Volume2, VolumeX, ChevronRight, RefreshCw 
} from 'lucide-react';

const CARDS: EducationCard[] = [
  {
    id: 'e-1',
    category: 'cravings',
    title: 'Surfing the Urge',
    summary: 'Learn the "Urge Surfing" concept to ride out cravings.',
    content: 'Cravings are like ocean waves. They start small, build up to a peak, and eventually break and wash away. Instead of fighting the wave, imagine yourself riding on top of it. Observe the physical symptoms—tightness in the chest, restlessness—without reacting. Know that the peak lasts only 10 to 15 minutes, and will pass.',
    audioScript: 'Cravings are like ocean waves. They start small, build up to a peak, and eventually break and wash away. Instead of fighting the wave, imagine yourself riding on top of it. Observe physical symptoms without reacting, knowing they peak in 10 minutes.'
  },
  {
    id: 'e-2',
    category: 'withdrawal',
    title: 'Understanding Withdrawal',
    summary: 'What occurs inside your body during detoxification.',
    content: 'Withdrawal is your body re-adjusting to the absence of a chemical substance. Symptoms like anxiety, nausea, or sweating are indicators that your system is actively recalibrating and healing. This phase is intense but temporary. Keep yourself hydrated, rest in a cool room, and seek emergency help if symptoms become severe.',
    audioScript: 'Withdrawal is your body re-adjusting. Symptoms like sweating or nausea indicate active healing. The discomfort is intense but temporary. Stay hydrated, rest, and consult medical professionals if symptoms worsen.'
  },
  {
    id: 'e-3',
    category: 'medication',
    title: 'Safe Medication Rules',
    summary: 'Guidelines for managing prescribed recovery aids.',
    content: 'Prescribed medication support (like Suboxone or Methadone) is a valid, clinical recovery tool. Never adjust dosages without consulting your practitioner. Avoid double-dosing if you miss a slot. Ensure these medications are stored securely away from triggers, and never mix them with alcohol or other substances.',
    audioScript: 'Prescribed recovery aids are clinical tools. Never change your dose without consulting your physician. Store medication safely, and do not combine prescribed aids with alcohol or other substances.'
  },
  {
    id: 'e-4',
    category: 'overdose',
    title: 'Spotting Overdose Signs',
    summary: 'Crucial visual markers of a drug overdose.',
    content: 'An overdose is a life-threatening crisis. Key warning indicators include: Pinpoint or extremely small pupils, blue or pale lips/fingertips, gurgling or snoring sounds, shallow or stopped breathing, and complete unresponsiveness. If you notice any of these markers, call 911 immediately and administer Naloxone.',
    audioScript: 'Identify overdose warning signs: pinpoint pupils, blue or pale lips, snoring sounds, shallow breathing, or complete unresponsiveness. Call 911 immediately and administer naloxone.'
  },
  {
    id: 'e-5',
    category: 'harm-reduction',
    title: 'Harm Reduction Principles',
    summary: 'Practical strategies to minimize health risks.',
    content: 'Harm reduction is about preserving life and safety where you are. Ensure access to clean materials, use fentanyl testing strips if using unknown products, never consume substances alone, and keep Naloxone (Narcan) within easy reach. These practices do not encourage usage; they keep you and others alive for another day.',
    audioScript: 'Harm reduction focuses on safety. Carry naloxone, test materials for fentanyl, never use alone, and keep help lines close. These steps preserve life and safety.'
  }
];

export default function EducationContainer() {
  const { user } = useAuthStore();
  const { timeline } = useRecoveryStore();
  const [selectedCard, setSelectedCard] = useState<EducationCard | null>(null);
  const [playing, setPlaying] = useState(false);
  const [readCompleted, setReadCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      EducationService.fetchCompletedLessons(user.id).then((completedIds) => {
        const mapping: Record<string, boolean> = {};
        completedIds.forEach((id) => {
          mapping[id] = true;
        });
        setReadCompleted(mapping);
      });
    }
  }, [user]);

  const getCategoryColor = (category: EducationCard['category']) => {
    switch (category) {
      case 'cravings': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100';
      case 'withdrawal': return 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border-blue-100';
      case 'medication': return 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border-purple-100';
      case 'overdose': return 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border-rose-100';
      default: return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-100';
    }
  };

  const handleToggleAudio = (card: EducationCard) => {
    if (typeof window === 'undefined') return;

    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = card.audioScript || card.content;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.onend = () => setPlaying(false);
      utterance.onerror = () => setPlaying(false);
      window.speechSynthesis.speak(utterance);
      setPlaying(true);
    }
  };

  const markAsRead = async (card: EducationCard) => {
    if (readCompleted[card.id]) return;
    
    // Add to local state
    setReadCompleted((prev) => ({ ...prev, [card.id]: true }));
    
    const uid = user ? user.id : 'anonymous';

    // Log progress in Firestore
    if (user && !user.isGuest) {
      try {
        await EducationService.markLessonComplete(user.id, card.id);
      } catch (e) {
        console.error('Failed to log lesson progress:', e);
      }
    }
    
    // Log achievement to recovery timeline
    await TimelineService.addTimelineEntry(
      uid,
      `Completed: ${card.title}`,
      `Read the "${card.title}" card to reinforce healthy coping strategies.`,
      'education'
    );
  };

  // Stop reading on unmount or card changes
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedCard]);

  return (
    <div className="max-w-md mx-auto w-full px-4 py-6 space-y-6 pb-20">
      
      {/* Header */}
      {!selectedCard && (
        <header className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-primary dark:text-secondary flex items-center gap-2">
            <BookOpen className="w-6 h-6 stroke-[2px]" />
            <span>Education Hub</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Clear, de-escalating guides on cravings, safety, and health.
          </p>
        </header>
      )}

      {/* Cards list */}
      {!selectedCard && (
        <div className="space-y-3">
          {CARDS.map((card) => (
            <button
              key={card.id}
              onClick={() => setSelectedCard(card)}
              className="w-full text-left bg-card hover:bg-slate-50 dark:hover:bg-slate-800/40 p-4 border border-border rounded-3xl transition flex justify-between items-center cursor-pointer shadow-sm"
            >
              <div className="space-y-1.5 flex-1 pr-3">
                <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border ${getCategoryColor(card.category)}`}>
                  {card.category}
                </span>
                <h3 className="font-bold text-sm text-foreground pt-0.5">{card.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1 font-medium">{card.summary}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          ))}
        </div>
      )}

      {/* Detailed Card View */}
      {selectedCard && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded border ${getCategoryColor(selectedCard.category)}`}>
              {selectedCard.category}
            </span>
            <button
              onClick={() => {
                setSelectedCard(null);
                setPlaying(false);
              }}
              className="text-xs font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
            >
              Back to Hub
            </button>
          </div>

          <div className="bg-card rounded-3xl border border-border shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-border/50 pb-4">
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                {selectedCard.title}
              </h3>
              
              {/* Narration voice play/stop */}
              <button
                onClick={() => handleToggleAudio(selectedCard)}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  playing ? 'bg-secondary text-white' : 'bg-slate-100 dark:bg-slate-800 text-foreground'
                }`}
                aria-label="Narrate text"
              >
                {playing ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            {/* Core Text */}
            <p className="text-sm md:text-base leading-relaxed text-foreground/90 font-medium">
              {selectedCard.content}
            </p>

            {/* Complete action button */}
            <div className="pt-4 border-t border-border/50 flex justify-between items-center">
              <p className="text-[11px] text-muted-foreground">
                {readCompleted[selectedCard.id] ? '✓ Saved to your timeline' : 'Click check to log completion'}
              </p>
              
              <button
                onClick={() => markAsRead(selectedCard)}
                disabled={readCompleted[selectedCard.id]}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  readCompleted[selectedCard.id]
                    ? 'bg-secondary/15 text-secondary border border-secondary/20'
                    : 'bg-primary dark:bg-primary-light text-white hover:opacity-90'
                }`}
              >
                {readCompleted[selectedCard.id] ? (
                  <>
                    <Award className="w-4 h-4" /> Finished
                  </>
                ) : (
                  'Mark Read'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
