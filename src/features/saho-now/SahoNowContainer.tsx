'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecoveryStore } from '../../store/useRecoveryStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { RecoveryService } from '../../services/recoveryService';
import { PulseAIResponse } from '../../types';
import { 
  Mic, MicOff, AlertCircle, RefreshCw, CheckCircle2, 
  Wind, ShieldAlert, Heart, VolumeX, Volume2 
} from 'lucide-react';

const EMOTIONAL_STATES = [
  { id: 'craving', label: "I'm Craving", color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/60' },
  { id: 'panic', label: "I'm Panicking", color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-100 dark:border-rose-900/60' },
  { id: 'lonely', label: "I'm Lonely", color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-100 dark:border-blue-900/60' },
  { id: 'sick', label: "I Feel Sick", color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-100 dark:border-amber-900/60' },
  { id: 'givingup', label: "I Feel Like Giving Up", color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-100 dark:border-purple-900/60' }
];

export default function SahoNowContainer() {
  const { currentVoiceSession, setVoiceSession } = useRecoveryStore();
  const { accessibility } = useSettingsStore();

  const [emotion, setEmotion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<PulseAIResponse | null>(null);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingText, setBreathingText] = useState('Get Ready');
  const [checkedActions, setCheckedActions] = useState<boolean[]>([false, false, false]);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const recognitionRef = useRef<any>(null);

  // Check browser Web Speech API support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onstart = () => {
          setVoiceSession({ listening: true, transcript: '' });
          setErrorMsg('');
        };

        rec.onresult = (event: any) => {
          const resultText = event.results[0][0].transcript;
          setVoiceSession({ transcript: resultText });
        };

        rec.onerror = (err: any) => {
          console.error('Speech Recognition Error:', err);
          if (err.error === 'not-allowed') {
            setErrorMsg('Microphone permission blocked. Please use direct touch selection.');
          } else {
            setErrorMsg('Could not capture audio. Let\'s try direct selection.');
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

  // When speech recognition ends and a transcript exists, process it
  useEffect(() => {
    if (!currentVoiceSession.listening && currentVoiceSession.transcript && currentVoiceSession.active) {
      handleProcessInput(emotion || 'Just Speaking', currentVoiceSession.transcript);
    }
  }, [currentVoiceSession.listening, currentVoiceSession.transcript]);

  // Handle Speech synthesis (Text-to-Speech)
  const speakText = (text: string) => {
    if (!accessibility.textToSpeech || typeof window === 'undefined') return;
    window.speechSynthesis.cancel(); // Stop any active speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Calm, relaxed pace
    window.speechSynthesis.speak(utterance);
  };

  // Toggle voice recognition session
  const toggleListening = () => {
    if (!speechSupported) {
      setErrorMsg('Web Speech recognition not supported in this browser. Please use button selections.');
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
        console.warn('Recognition already started:', e);
      }
    }
  };

  // Trigger guidance analysis
  const handleProcessInput = async (selectedEmotion: string, spokeTranscript: string = '') => {
    setLoading(true);
    setErrorMsg('');
    setEmotion(selectedEmotion);
    setVoiceSession({ active: false });

    // Cancel active speech
    if (typeof window !== 'undefined') window.speechSynthesis.cancel();

    try {
      const response = await fetch('/api/ai/pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emotion: selectedEmotion,
          transcript: spokeTranscript,
        }),
      });

      if (!response.ok) {
        throw new Error('De-escalation endpoint returned an error');
      }

      const data: PulseAIResponse = await response.json();
      setAiResponse(data);
      setCheckedActions([false, false, false]);

      // Automatically announce the message if Text-To-Speech is toggled
      speakText(data.message);

      // Save session logs in state/db
      const savedSession = await RecoveryService.saveSession({
        emotion: selectedEmotion,
        riskLevel: data.risk,
        message: data.message,
        aiActions: data.actions,
        breathing: data.breathing,
        emergencyTriggered: data.emergency,
      });

      // Handle breathing loop trigger
      if (data.breathing) {
        setBreathingActive(true);
      }

      // Handle critical escalation alert
      if (data.emergency) {
        // Automatic alert to Circle of Safety
        await RecoveryService.notifyCaregivers(savedSession);
      }

    } catch (e) {
      setErrorMsg('Offline fallback triggered. We are here for you.');
      // Local fallback calculations
      const mockData = getLocalFallbackResponse(selectedEmotion);
      setAiResponse(mockData);
      setCheckedActions([false, false, false]);
      speakText(mockData.message);
      if (mockData.breathing) setBreathingActive(true);
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
        message: 'This craving is temporary. You are stronger than this urge. Take a moment to change your environment and breathe.',
        actions: ['Walk away from your current environment.', 'Drink a glass of cold water slowly.', 'Do 2 minutes of guided deep breathing.'],
        breathing: true,
        emergency: false
      };
    }
    if (key.includes('panic')) {
      return {
        risk: 'high',
        emotion: 'panic',
        message: 'You are safe right now in this moment. Focus on my voice and let your shoulders drop. Let\'s breathe together.',
        actions: ['Loosen any tight clothing and drop your shoulders.', 'Focus on a single object in the room.', 'Inhale deeply as the circle expands.'],
        breathing: true,
        emergency: false
      };
    }
    return {
      risk: 'low',
      emotion: 'support',
      message: 'Take things one day, one hour, or even one breath at a time. I am right beside you.',
      actions: ['Relax your body completely.', 'Text a trusted contact to say hello.', 'Take three deep, mindful breaths.'],
      breathing: true,
      emergency: false
    };
  };

  // Breathing loop timer states: 4s inhale, 4s hold, 4s exhale
  useEffect(() => {
    if (!breathingActive) return;

    let cycle = 0;
    const instructions = ['Inhale...', 'Hold...', 'Exhale...', 'Hold...'];
    setBreathingText(instructions[0]);

    const interval = setInterval(() => {
      cycle = (cycle + 1) % 4;
      setBreathingText(instructions[cycle]);
    }, 4000);

    return () => clearInterval(interval);
  }, [breathingActive]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="max-w-md mx-auto w-full px-4 py-6 space-y-6 flex-1 flex flex-col justify-between pb-20">
      
      {/* Header Calm Tagline */}
      <header className="text-center space-y-1 py-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-primary dark:text-secondary flex items-center justify-center gap-1.5">
          <Heart className="w-5 h-5 fill-current text-secondary stroke-none" />
          <span>SAHO Companion</span>
        </h1>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
          Your Brother Through Recovery
        </p>
      </header>

      {/* Main Crisis Action Section */}
      <div className="flex-1 flex flex-col justify-center items-center py-6">
        <AnimatePresence mode="wait">
          {!aiResponse && !loading && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col items-center space-y-8"
            >
              {/* Pulsing Core Action Button */}
              <button
                onClick={toggleListening}
                aria-label={currentVoiceSession.listening ? "Stop Listening" : "Tap to Speak"}
                className={`relative w-40 h-40 rounded-full flex flex-col justify-center items-center cursor-pointer transition-all duration-300 shadow-xl border-4 ${
                  currentVoiceSession.listening 
                    ? 'bg-rose-500 border-rose-400 text-white animate-pulse'
                    : 'bg-primary dark:bg-primary-light border-slate-200 dark:border-slate-800 text-white hover:scale-105'
                }`}
              >
                {currentVoiceSession.listening ? (
                  <>
                    <MicOff className="w-12 h-12 mb-2" />
                    <span className="text-xs uppercase font-bold tracking-wider">Listening</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-12 h-12 mb-2" />
                    <span className="text-xs uppercase font-bold tracking-wider">SAHO NOW</span>
                  </>
                )}
                
                {/* Secondary Visual Calming Wave */}
                {!currentVoiceSession.listening && (
                  <span className="absolute -inset-2 rounded-full border border-primary/20 dark:border-primary-light/20 animate-ping -z-10" />
                )}
              </button>

              <div className="text-center px-4">
                <p className="text-sm text-muted-foreground font-medium">
                  {currentVoiceSession.listening 
                    ? '"Tell me what is happening..."' 
                    : 'Tap the button to talk, or select how you feel below:'}
                </p>
              </div>

              {/* Direct Buttons Grid */}
              <div className="grid grid-cols-2 gap-2 w-full pt-2">
                {EMOTIONAL_STATES.map((state) => (
                  <button
                    key={state.id}
                    onClick={() => handleProcessInput(state.label)}
                    className={`py-3.5 px-3 rounded-2xl text-xs font-semibold border text-center transition active:scale-95 cursor-pointer shadow-sm ${state.color}`}
                  >
                    {state.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-4 py-16"
            >
              <RefreshCw className="w-10 h-10 text-secondary animate-spin" />
              <p className="text-sm font-medium text-muted-foreground">Formulating support...</p>
            </motion.div>
          )}

          {/* AI Response Display Card */}
          {aiResponse && !loading && (
            <motion.div
              key="response"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full space-y-6"
            >
              <div className="bg-card rounded-3xl p-5 border border-border shadow-sm space-y-4 relative overflow-hidden">
                {/* Emergency Banner */}
                {aiResponse.emergency && (
                  <div className="absolute top-0 left-0 right-0 bg-rose-600 text-white text-center py-1.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Emergency Contacts Notified
                  </div>
                )}

                {/* Emotion / Risk Header */}
                <div className={`flex justify-between items-center ${aiResponse.emergency ? 'pt-4' : ''}`}>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    State: {aiResponse.emotion}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                    aiResponse.risk === 'high' 
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' 
                      : aiResponse.risk === 'medium'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  }`}>
                    {aiResponse.risk} risk
                  </span>
                </div>

                {/* Empathetic Message */}
                <p className="text-base md:text-lg leading-relaxed text-foreground font-medium pt-1">
                  "{aiResponse.message}"
                </p>

                {/* Actions Checklist */}
                <div className="space-y-2.5 pt-2">
                  <p className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground">
                    Next Actions:
                  </p>
                  {aiResponse.actions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const next = [...checkedActions];
                        next[idx] = !next[idx];
                        setCheckedActions(next);
                      }}
                      className={`flex items-start text-left w-full p-3.5 rounded-2xl border transition active:scale-99 cursor-pointer ${
                        checkedActions[idx]
                          ? 'bg-secondary/5 border-secondary/30 text-muted-foreground line-through'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-border text-foreground hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <CheckCircle2 className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${
                        checkedActions[idx] ? 'text-secondary fill-secondary/10' : 'text-slate-300 dark:text-slate-600'
                      }`} />
                      <span className="text-sm font-medium leading-tight">{action}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Breathing Loop View */}
              {breathingActive && (
                <div className="bg-card rounded-3xl p-5 border border-border shadow-sm text-center space-y-4">
                  <div className="flex items-center justify-center space-x-1.5 text-secondary">
                    <Wind className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">Breathing Grounder</span>
                  </div>
                  
                  {/* Calming expanding breathing node */}
                  <div className="h-32 flex items-center justify-center relative">
                    <motion.div
                      animate={accessibility.reducedMotion ? {} : {
                        scale: breathingText === 'Inhale...' ? 1.4 : breathingText === 'Exhale...' ? 1.0 : 1.4
                      }}
                      transition={{ duration: 4, ease: "easeInOut" }}
                      className="w-24 h-24 rounded-full bg-secondary/15 dark:bg-secondary/10 border border-secondary/35 flex items-center justify-center"
                    >
                      <span className="text-sm font-bold text-secondary-dark dark:text-secondary-light">
                        {breathingText}
                      </span>
                    </motion.div>
                  </div>

                  <button
                    onClick={() => {
                      setBreathingActive(false);
                      if (typeof window !== 'undefined') window.speechSynthesis.cancel();
                    }}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-700 underline cursor-pointer"
                  >
                    Close Grounding Exercise
                  </button>
                </div>
              )}

              {/* Reset to talk again */}
              <button
                onClick={() => {
                  setAiResponse(null);
                  setBreathingActive(false);
                  if (typeof window !== 'undefined') window.speechSynthesis.cancel();
                }}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-foreground font-semibold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Return to Main Screen
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Voice Transcript Banner */}
      {currentVoiceSession.listening && currentVoiceSession.transcript && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-xs font-medium rounded-xl border border-rose-100 dark:border-rose-900/60 max-w-sm mx-auto w-full text-center">
          Spoke: "{currentVoiceSession.transcript}"
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-xl border border-amber-100 dark:border-amber-900/60 max-w-sm mx-auto w-full flex items-center justify-center gap-1.5">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

    </div>
  );
}
