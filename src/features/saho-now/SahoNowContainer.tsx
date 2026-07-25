'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecoveryStore } from '../../store/useRecoveryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { RecoveryService } from '../../services/recoveryService';
import { PulseAIResponse } from '../../types';
import { 
  Mic, AlertCircle, RefreshCw, CheckCircle2, 
  Wind, ShieldAlert, Heart, Volume2, VolumeX, Sparkles, X,
  Flame, AlertTriangle, Users, Phone
} from 'lucide-react';

export default function SahoNowContainer() {
  const { currentVoiceSession, setVoiceSession } = useRecoveryStore();
  const { user } = useAuthStore();
  const { accessibility } = useSettingsStore();

  const [emotion, setEmotion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<PulseAIResponse | null>(null);
  
  // Guided Breathing States
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState(0); // 0: In, 1: Hold, 2: Out, 3: Hold
  const [timerCount, setTimerCount] = useState(240); // 4 minutes
  const [waveformHeights, setWaveformHeights] = useState<number[]>([12, 24, 36, 48, 32, 18, 28, 40, 20, 12]);
  
  const [checkedActions, setCheckedActions] = useState<boolean[]>([false, false, false]);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showContactsModal, setShowContactsModal] = useState(false);
  const { contacts } = useSettingsStore();
  
  const recognitionRef = useRef<any>(null);

  // Initialize Speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onstart = () => {
          setVoiceSession({ listening: true, transcript: '' });
          setErrorMsg('');
        };

        rec.onresult = (event: any) => {
          let currentText = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentText += event.results[i][0].transcript;
          }
          if (currentText) {
            setVoiceSession({ transcript: currentText });
          }
        };

        rec.onerror = (err: any) => {
          console.error('Speech Recognition Error:', err);
          if (err.error === 'not-allowed') {
            setErrorMsg('Microphone permission blocked. Please use direct cards selection.');
          } else {
            setErrorMsg('Could not capture audio. Let\'s use cards selection.');
          }
          setVoiceSession({ listening: false });
        };

        rec.onend = () => {
          setVoiceSession({ listening: false });
        };

        recognitionRef.current = rec;
      }
    }
  }, [setVoiceSession]);

  // Handle Speech synthesis (Text-to-Speech)
  const speakText = (text: string) => {
    if (!accessibility.textToSpeech || typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  // Simulating sound waves during voice detection
  useEffect(() => {
    if (!currentVoiceSession.listening) return;

    const interval = setInterval(() => {
      setWaveformHeights(prev => 
        prev.map(() => Math.floor(Math.random() * 40) + 12)
      );
    }, 150);

    return () => clearInterval(interval);
  }, [currentVoiceSession.listening]);

  // When speech ends, run AI
  useEffect(() => {
    if (!currentVoiceSession.listening && currentVoiceSession.transcript && currentVoiceSession.active) {
      handleProcessInput('Voice input', currentVoiceSession.transcript);
    }
  }, [currentVoiceSession.listening, currentVoiceSession.transcript]);

  const toggleListening = () => {
    if (!speechSupported) {
      setErrorMsg('Speech recognition not supported in this browser. Please use cards.');
      return;
    }

    if (currentVoiceSession.listening) {
      recognitionRef.current?.stop();
    } else {
      setEmotion(null);
      setAiResponse(null);
      setBreathingActive(false);
      setVoiceSession({ active: true, transcript: '' });
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn('Recognition start exception:', e);
      }
    }
  };

  const handleProcessInput = async (selected: string, transcript: string = '') => {
    setLoading(true);
    setErrorMsg('');
    setEmotion(selected);
    setVoiceSession({ active: false });
    if (typeof window !== 'undefined') window.speechSynthesis.cancel();

    try {
      const response = await fetch('/api/ai/pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emotion: selected, transcript }),
      });

      if (!response.ok) throw new Error('Response failure');
      const data: PulseAIResponse = await response.json();
      setAiResponse(data);
      setCheckedActions([false, false, false]);

      if (data.risk === 'high') {
        speakText("It is necessary for you to breathe right now. " + data.message);
        setBreathingActive(true);
        setTimerCount(240);
      } else {
        speakText(data.message);
      }

      const saved = await RecoveryService.saveSession({
        emotion: selected,
        riskLevel: data.risk,
        message: data.message,
        aiActions: data.actions,
        breathing: data.breathing,
        emergencyTriggered: data.emergency,
      });

      if (data.emergency) {
        await RecoveryService.notifyCaregivers(saved);
      }

    } catch (e) {
      setErrorMsg('Offline fallback triggered. We are here beside you.');
      const fallback = getLocalFallbackResponse(selected);
      setAiResponse(fallback);
      setCheckedActions([false, false, false]);
      
      if (fallback.risk === 'high') {
        speakText("It is necessary for you to breathe right now. " + fallback.message);
        setBreathingActive(true);
        setTimerCount(240);
      } else {
        speakText(fallback.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const getLocalFallbackResponse = (selected: string): PulseAIResponse => {
    const key = selected.toLowerCase();
    if (key.includes('crav')) {
      return {
        risk: 'medium',
        emotion: 'craving',
        message: 'This craving is a temporary wave. You are the observer of it. Take a moment to change your scene and ground your body.',
        actions: ['Move to a different room or walk outside.', 'Drink a cold glass of water slowly.', 'Do 2 minutes of guided box breathing.'],
        breathing: true,
        emergency: false
      };
    }
    if (key.includes('panic')) {
      return {
        risk: 'high',
        emotion: 'panic',
        message: 'You are completely safe in this exact moment. Let your shoulders drop, relax your hands, and let\'s settle your breath.',
        actions: ['Drop your shoulders and place feet flat on the floor.', 'Identify three things you can see in the room.', 'Inhale deeply as the circle grows.'],
        breathing: true,
        emergency: false
      };
    }
    return {
      risk: 'low',
      emotion: 'support',
      message: 'I am right here with you. Together we can get through this, one slow breath at a time.',
      actions: ['Sip some warm water.', 'Acknowledge your thoughts without judging them.', 'Do a 4-minute box breathing session.'],
      breathing: true,
      emergency: false
    };
  };

  // Breathing Box Cycle Logic: 4s inhale, 4s hold, 4s exhale, 4s hold
  useEffect(() => {
    if (!breathingActive) return;

    const phases = [
      { text: 'Breathe in...', scale: 1.4, outerScale: 1.6 },
      { text: 'Hold...', scale: 1.4, outerScale: 1.7 },
      { text: 'Breathe out...', scale: 1.0, outerScale: 1.1 },
      { text: 'Hold...', scale: 1.0, outerScale: 1.0 }
    ];

    const cycleInterval = setInterval(() => {
      setBreathingPhase(prev => (prev + 1) % 4);
    }, 4000);

    const timerInterval = setInterval(() => {
      setTimerCount(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(cycleInterval);
      clearInterval(timerInterval);
    };
  }, [breathingActive]);

  const getPhaseConfig = () => {
    const phases = [
      { text: 'Breathe in...', scale: 1.4, outerScale: 1.6, color: 'from-secondary to-primary-container' },
      { text: 'Hold...', scale: 1.4, outerScale: 1.7, color: 'from-secondary/90 to-primary-container/90' },
      { text: 'Breathe out...', scale: 1.0, outerScale: 1.1, color: 'from-primary-container to-secondary' },
      { text: 'Hold...', scale: 1.0, outerScale: 1.0, color: 'from-primary-container/90 to-secondary/90' }
    ];
    return phases[breathingPhase];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentPhase = getPhaseConfig();

  return (
    <div className="max-w-[600px] mx-auto w-full px-container-padding py-6 flex-1 flex flex-col justify-between pb-32">
      
      {/* Dynamic Render: Standard Main Landing View */}
      <AnimatePresence mode="wait">
        {!currentVoiceSession.listening && !breathingActive && !aiResponse && !loading && (
          <motion.div
            key="main-landing"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-md text-center py-6 flex flex-col items-center w-full"
          >
            {/* Upper profile header */}
            <div className="flex justify-between items-center w-full mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant bg-surface-container-high shadow-sm">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="Companion guide" 
                    src="/profile_placeholder.png"
                  />
                </div>
                <h2 className="font-heading font-semibold text-lg text-primary dark:text-secondary-fixed">
                  Hello {user?.displayName || 'Friend'}, I'm here.
                </h2>
              </div>
              
              <button
                onClick={() => setShowContactsModal(true)}
                className="w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-primary dark:text-secondary border border-border rounded-full transition active:scale-90 cursor-pointer shadow-sm"
                aria-label="Call support contact"
              >
                <Phone className="w-4 h-4" />
              </button>
            </div>

            {/* Central pulsating core buttons */}
            <div className="relative flex items-center justify-center py-8">
              {/* Expanding blurred glow auras */}
              <div className="absolute w-72 h-72 bg-primary/20 dark:bg-primary-container/20 rounded-full blur-3xl aura-animation -z-10" />
              <div className="absolute w-64 h-64 bg-secondary/15 dark:bg-secondary-container/15 rounded-full blur-2xl aura-animation -z-10" style={{ animationDelay: '-2s' }} />

              <button
                onClick={toggleListening}
                className="relative z-10 w-60 h-60 rounded-full blue-emerald-gradient shadow-[0px_20px_40px_rgba(26,35,126,0.2)] flex flex-col items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform duration-300 ease-out cursor-pointer border border-white/20"
              >
                <Mic className="w-12 h-12 mb-2 stroke-[2px]" />
                <span className="font-heading text-xl font-extrabold tracking-tight">SAHO NOW</span>
                <span className="text-[11px] text-white/70 mt-1 uppercase tracking-wider font-semibold">Tap to Speak</span>
              </button>
            </div>

            {/* Touch Selection Cards (2x2 Grid) */}
            <div className="w-full grid grid-cols-2 gap-4 pt-4">
              {/* I'm Craving */}
              <button
                onClick={() => handleProcessInput("I'm Craving")}
                className="bg-card hover:bg-slate-50 dark:hover:bg-slate-800/40 p-5 rounded-[24px] border border-outline-variant/60 shadow-[0px_10px_30px_rgba(26,35,126,0.02)] flex flex-col justify-between h-32 hover:bg-white transition-all active:scale-95 cursor-pointer text-left"
              >
                <Flame className="w-8 h-8 text-[#e17e00] stroke-[1.75px]" />
                <span className="font-heading text-sm font-bold text-on-surface">I'm Craving</span>
              </button>

              {/* I'm Panicking */}
              <button
                onClick={() => handleProcessInput("I'm Panicking")}
                className="bg-card hover:bg-slate-50 dark:hover:bg-slate-800/40 p-5 rounded-[24px] border border-outline-variant/60 shadow-[0px_10px_30px_rgba(26,35,126,0.02)] flex flex-col justify-between h-32 hover:bg-white transition-all active:scale-95 cursor-pointer text-left"
              >
                <AlertTriangle className="w-8 h-8 text-error stroke-[1.75px]" />
                <span className="font-heading text-sm font-bold text-on-surface">I'm Panicking</span>
              </button>

              {/* I'm Lonely */}
              <button
                onClick={() => handleProcessInput("I'm Lonely")}
                className="bg-card hover:bg-slate-50 dark:hover:bg-slate-800/40 p-5 rounded-[24px] border border-outline-variant/60 shadow-[0px_10px_30px_rgba(26,35,126,0.02)] flex flex-col justify-between h-32 hover:bg-white transition-all active:scale-95 cursor-pointer text-left"
              >
                <Users className="w-8 h-8 text-primary dark:text-secondary-light stroke-[1.75px]" />
                <span className="font-heading text-sm font-bold text-on-surface">I'm Lonely</span>
              </button>

              {/* Just Speak (Mic button card) */}
              <button
                onClick={toggleListening}
                className="bg-card hover:bg-slate-50 dark:hover:bg-slate-800/40 p-5 rounded-[24px] border border-outline-variant/60 shadow-[0px_10px_30px_rgba(26,35,126,0.02)] flex items-center justify-center h-32 hover:bg-white transition-all active:scale-95 cursor-pointer"
                aria-label="Tap to speak"
              >
                <div className="w-14 h-14 rounded-full bg-surface-container-high dark:bg-slate-700 flex items-center justify-center shadow-inner hover:scale-105 active:scale-95 transition-transform duration-200">
                  <Mic className="w-6 h-6 text-on-surface stroke-[2.25px]" />
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {/* Dynamic Render: Active Voice Listening Layer */}
        {currentVoiceSession.listening && (
          <motion.div
            key="listening-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col justify-between items-center py-8 w-full"
          >
            <div className="opacity-45 font-heading font-extrabold tracking-wider text-primary dark:text-secondary-fixed">SAHO</div>

            <div className="flex flex-col items-center gap-8 w-full">
              {/* Mic Icon & Pulsing rings */}
              <div className="relative flex items-center justify-center">
                <div className="absolute w-44 h-44 rounded-full bg-primary/10 dark:bg-secondary/10 animate-ping" />
                <div className="relative w-28 h-28 flex items-center justify-center rounded-full bg-primary dark:bg-primary-light shadow-xl text-white">
                  <Mic className="w-10 h-10 stroke-[2px]" />
                </div>
              </div>

              {/* Listening Headlines */}
              <div className="text-center space-y-2 px-4">
                <h1 className="font-heading text-3xl font-extrabold text-primary dark:text-secondary animate-pulse tracking-tight">Listening...</h1>
                <p className="font-sans text-sm text-on-surface-variant font-medium max-w-[80%] mx-auto leading-relaxed">
                  Speak freely. I am listening to help guide you safely.
                </p>
              </div>

              {/* Waveform Equalizer */}
              <div className="flex items-end justify-center gap-1.5 h-16 w-full max-w-[280px]">
                {waveformHeights.map((h, i) => (
                  <div 
                    key={i}
                    className="w-1.5 bg-primary dark:bg-secondary rounded-full transition-all duration-150"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={toggleListening}
              className="font-heading text-xs font-bold text-primary dark:text-secondary bg-surface-container-high/40 hover:bg-surface-container-high/85 border border-border px-5 py-2.5 rounded-full transition active:scale-95 cursor-pointer"
            >
              Tap to stop
            </button>
          </motion.div>
        )}

        {/* Dynamic Render: Loading screen */}
        {loading && (
          <motion.div
            key="loading-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow flex flex-col items-center justify-center space-y-4 py-20"
          >
            <RefreshCw className="w-10 h-10 text-secondary animate-spin" />
            <p className="font-heading text-sm font-bold text-muted-foreground uppercase tracking-widest">Formulating de-escalation...</p>
          </motion.div>
        )}

        {/* Dynamic Render: Active Guided Breathing Screen */}
        {breathingActive && !loading && (
          <motion.div
            key="breathing-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow flex flex-col justify-between items-center py-6 w-full"
          >
            {/* Header Timer info */}
            <div className="text-center">
              <h2 className="font-heading text-3xl font-light tracking-tight text-foreground/80">{formatTime(timerCount)}</h2>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Time Remaining</p>
            </div>

            {/* The Breathing Core Orb */}
            <div className="relative flex items-center justify-center py-10">
              {/* Expanding outer ring */}
              <motion.div
                animate={accessibility.reducedMotion ? {} : {
                  scale: currentPhase.outerScale
                }}
                transition={{ duration: 4, ease: 'easeInOut' }}
                className="absolute w-[280px] h-[280px] rounded-full border border-secondary/20"
              />

              {/* Core gradient orb */}
              <motion.div
                animate={accessibility.reducedMotion ? {} : {
                  scale: currentPhase.scale
                }}
                transition={{ duration: 4, ease: 'easeInOut' }}
                className={`w-48 h-48 rounded-full bg-gradient-to-tr ${currentPhase.color} flex items-center justify-center shadow-2xl relative border border-white/20`}
              >
                <div className="absolute inset-0 rounded-full bg-white/10 blur-xl" />
                <span className="text-white font-heading text-lg font-bold tracking-tight drop-shadow-md z-10">
                  {currentPhase.text}
                </span>
              </motion.div>
            </div>

            {/* Bottom Actions */}
            <div className="text-center space-y-2.5">
              <button
                onClick={() => setBreathingActive(false)}
                className="glass px-6 py-3 rounded-full font-heading text-xs font-bold text-on-background/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
              >
                End Breathing Session
              </button>
              <p className="text-[10px] text-muted-foreground/60 uppercase font-semibold">Tap to exit safely</p>
            </div>
          </motion.div>
        )}

        {/* Dynamic Render: AI guidance response block */}
        {aiResponse && !loading && !breathingActive && (
          <motion.div
            key="ai-guidance"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full space-y-6 py-2"
          >
            {/* Header info */}
            <div className="flex justify-between items-center border-b border-border/40 pb-3">
              <h3 className="font-heading font-extrabold text-sm text-primary dark:text-secondary-fixed uppercase tracking-wider">
                Support Guidance
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                aiResponse.risk === 'high' 
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' 
                  : aiResponse.risk === 'medium'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
              }`}>
                {aiResponse.risk} risk
              </span>
            </div>

            {/* De-escalation Card */}
            <div className="bg-card border border-border rounded-[24px] shadow-[0px_10px_30px_rgba(26,35,126,0.03)] p-6 space-y-5 relative overflow-hidden">
              {aiResponse.emergency && (
                <div className="absolute top-0 left-0 right-0 bg-error text-white text-center py-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Emergency broadcast dispatch active
                </div>
              )}

              {/* Empathetic Prompt Message */}
              <p className="text-lg md:text-xl font-heading font-medium leading-relaxed text-foreground pt-2">
                "{aiResponse.message}"
              </p>

              {/* Checklist actions */}
              <div className="space-y-2.5 pt-3">
                <p className="text-[11px] uppercase font-extrabold tracking-widest text-muted-foreground/80">
                  Recommended Sequence:
                </p>
                
                {aiResponse.actions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const next = [...checkedActions];
                      next[idx] = !next[idx];
                      setCheckedActions(next);
                    }}
                    className={`flex items-start text-left w-full p-4 rounded-2xl border transition duration-200 active:scale-99 cursor-pointer ${
                      checkedActions[idx]
                        ? 'bg-secondary/5 border-secondary/30 text-muted-foreground line-through opacity-70'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-border text-foreground hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <CheckCircle2 className={`w-5 h-5 mr-3.5 flex-shrink-0 mt-0.5 ${
                      checkedActions[idx] ? 'text-secondary fill-secondary/10' : 'text-slate-300 dark:text-slate-600'
                    }`} />
                    <span className="text-sm font-semibold leading-normal font-sans">{action}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions & Resets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
              {aiResponse.breathing && (
                <button
                  onClick={() => {
                    setBreathingActive(true);
                    setTimerCount(240);
                  }}
                  className="py-3.5 px-4 bg-secondary text-white font-heading font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition active:scale-95 cursor-pointer shadow-sm shadow-secondary/20"
                >
                  <Wind className="w-4 h-4" /> Start Breathing
                </button>
              )}
              
              <button
                onClick={() => setShowContactsModal(true)}
                className="py-3.5 px-4 bg-primary text-white font-heading font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition active:scale-95 cursor-pointer shadow-sm shadow-primary/20"
              >
                <Phone className="w-4 h-4" /> Reach Out
              </button>
              
              <button
                onClick={() => {
                  setAiResponse(null);
                  setBreathingActive(false);
                  if (typeof window !== 'undefined') window.speechSynthesis.cancel();
                }}
                className="py-3.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-foreground font-heading font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                aria-label="Back to main page"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Return
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Spoken Words Banner */}
      {(currentVoiceSession.listening || loading) && currentVoiceSession.transcript && (
        <div className="fixed bottom-24 left-4 right-4 p-3.5 bg-rose-50/90 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-2xl border border-rose-100 dark:border-rose-900/60 max-w-sm mx-auto text-center shadow-md z-30">
          {currentVoiceSession.listening ? 'Hearing:' : 'Sending to SAHO:'} "{currentVoiceSession.transcript}"
        </div>
      )}

      {/* Direct Error details */}
      {errorMsg && (
        <div className="fixed bottom-24 left-4 right-4 p-3.5 bg-amber-50/90 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-2xl border border-amber-100/90 dark:border-amber-900/60 max-w-sm mx-auto text-center shadow-md z-30 flex items-center justify-center gap-1.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="p-0.5 hover:bg-amber-100/80 rounded-full ml-1">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Circle of Safety Reach Out Modal */}
      {showContactsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-[28px] max-w-sm w-full p-6 space-y-4 shadow-xl text-left"
          >
            <div className="flex justify-between items-center pb-2 border-b border-border/40">
              <h3 className="font-heading font-bold text-base text-primary dark:text-secondary flex items-center gap-1.5">
                <Phone className="w-4.5 h-4.5" /> Call Support Contact
              </h3>
              <button 
                onClick={() => setShowContactsModal(false)}
                className="text-xs font-heading font-bold text-rose-500 hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              Select a contact from your Circle of Safety support network to dial immediately.
            </p>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {contacts.map((contact) => (
                <button
                  key={contact.contactId}
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.location.href = `tel:${contact.phone}`;
                    }
                    setShowContactsModal(false);
                  }}
                  className="w-full text-left p-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-outline-variant/60 rounded-2xl flex justify-between items-center transition active:scale-[0.98] cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <p className="font-heading font-bold text-sm text-foreground">{contact.name}</p>
                    <p className="text-[10px] text-muted-foreground font-sans">{contact.relationship} • {contact.phone}</p>
                  </div>
                  <Phone className="w-4 h-4 text-secondary fill-secondary/5" />
                </button>
              ))}

              {contacts.length === 0 && (
                <div className="p-5 border border-dashed border-outline-variant rounded-2xl text-center space-y-1">
                  <p className="text-xs font-bold text-foreground">No contacts configured</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed font-sans">
                    Go to the Profile/Settings (Circle of Safety) tab to add trusted caregiver contacts.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
