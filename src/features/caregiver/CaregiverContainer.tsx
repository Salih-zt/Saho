'use client';

import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, AlertOctagon, BrainCircuit, Activity, 
  ChevronRight, ChevronLeft, Volume2, VolumeX, Eye, Info 
} from 'lucide-react';
import VisionContainer from '../trigger-vision/VisionContainer';

interface TeleprompterCard {
  step: number;
  text: string;
  subtext: string;
}

const EMERGENCY_SCRIPTS: Record<string, { title: string; desc: string; steps: TeleprompterCard[] }> = {
  overdose: {
    title: 'Overdose Crisis',
    desc: 'Critical lifesaving response protocol.',
    steps: [
      { step: 1, text: 'Check responsiveness immediately.', subtext: 'Shout their name loudly, rub their sternum (breastbone) firmly with your knuckles, and shake their shoulders.' },
      { step: 2, text: 'Call 911 or emergency services.', subtext: 'State clearly: "I have an unresponsive person who is not breathing normally." Give your exact address.' },
      { step: 3, text: 'Administer Naloxone (Narcan) if available.', subtext: 'Peel back package, place nozzle in nostril, and press plunger firmly. Do not hesitate—it is harmless if not needed.' },
      { step: 4, text: 'Start CPR / Rescue Breathing.', subtext: 'If not breathing, perform chest compressions (100-120 per min) or give rescue breaths if trained.' },
      { step: 5, text: 'Roll them into the Recovery Position.', subtext: 'Turn them onto their side, bend the top knee to support them, and tilt the chin up to keep the airway open. Stay until help arrives.' }
    ]
  },
  aggression: {
    title: 'Aggressive Behaviour',
    desc: 'De-escalating agitation and ensuring safety.',
    steps: [
      { step: 1, text: 'Ensure your own safety first.', subtext: 'Keep a safe physical distance (at least 6 feet). Position yourself near an exit. Do not corner the individual.' },
      { step: 2, text: 'Maintain a calm, low, neutral voice.', subtext: 'Speak slowly and softly. Do not match their volume, argue, or make sudden gestures.' },
      { step: 3, text: 'Reduce sensory overload.', subtext: 'Turn down bright overhead lights, turn off loud television or music, and ask others to leave the room.' },
      { step: 4, text: 'Acknowledge their distress without judgment.', subtext: 'Say: "I can see you are angry/upset, and I want to support you. Let\'s figure this out together."' },
      { step: 5, text: 'Call for backup if danger escalates.', subtext: 'If there is an immediate threat of physical harm, step out of the area immediately and call emergency services.' }
    ]
  },
  withdrawal: {
    title: 'Severe Withdrawal',
    desc: 'Monitoring and comforting physically.',
    steps: [
      { step: 1, text: 'Monitor vital indicators and hydration.', subtext: 'Check for high fever, rapid pulse, or heavy sweating. Offer small, frequent sips of water or electrolyte liquids.' },
      { step: 2, text: 'Provide calming verbal reassurance.', subtext: 'Remind them: "You are safe. Your body is healing. These physical symptoms are peak waves that will subside."' },
      { step: 3, text: 'Maintain a cool, clean environment.', subtext: 'Dampen a cloth with cool water for their forehead. Keep sheets clean and ensure the room is quiet.' },
      { step: 4, text: 'Do NOT administer unprescribed medication.', subtext: 'Giving other substances to relieve symptoms is highly dangerous. Use only professional guidelines.' },
      { step: 5, text: 'Identify emergency warning signs.', subtext: 'If they experience severe hallucinations, tremors, seizures, or loss of consciousness, seek urgent medical treatment.' }
    ]
  },
  panic: {
    title: 'Severe Panic / Anxiety',
    desc: 'Anchoring and grounding during panic.',
    steps: [
      { step: 1, text: 'Anchor them with your calm presence.', subtext: 'Stay with them. Remind them: "I am right here with you. You are not alone, and you are safe."' },
      { step: 2, text: 'Guide their breathing cycle.', subtext: 'Lead by example. Inhale together for 4 seconds, hold, and exhale slowly for 4 seconds. Repeat.' },
      { step: 3, text: 'Focus on physical grounding.', subtext: 'Have them place both feet flat on the floor. Ask them to name 3 objects they can see in the room.' },
      { step: 4, text: 'Validate their feelings.', subtext: 'Do not tell them to "calm down." Instead, say: "This panic is an intense feeling, but it is not dangerous, and it will pass."' },
      { step: 5, text: 'Give them physical breathing space.', subtext: 'Ensure they have air circulation and do not feel crowded. Keep your posture relaxed and open.' }
    ]
  },
  craving: {
    title: 'Intense Craving Support',
    desc: 'Coaching through peak urges.',
    steps: [
      { step: 1, text: 'Acknowledge the urge without lecturing.', subtext: 'Say: "I understand the urge feels incredibly strong right now. That is normal, and we can get through it."' },
      { step: 2, text: 'Implement the 15-minute delay rule.', subtext: 'Ask them to wait just 15 minutes before making a decision. Urges peak and begin to decline within this window.' },
      { step: 3, text: 'Introduce a complete distraction.', subtext: 'Immediately change your surroundings. Go for a brief walk, do a puzzle, or wash the dishes together.' },
      { step: 4, text: 'Review past milestones.', subtext: 'Open the SAHO Timeline and review their recent healthy decisions. Focus on their gains.' },
      { step: 5, text: 'Engage in a guided breathing exercise.', subtext: 'Prompt them to open the SAHO NOW deep breathing screen to calm their nervous system.' }
    ]
  }
};

export default function CaregiverContainer() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [narrationActive, setNarrationActive] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const script = activeCategory ? EMERGENCY_SCRIPTS[activeCategory] : null;
  const currentStep = script ? script.steps[currentStepIdx] : null;

  // Handles text to speech narration
  const handleNarrate = () => {
    if (!currentStep || typeof window === 'undefined') return;

    if (narrationActive) {
      window.speechSynthesis.cancel();
      setNarrationActive(false);
    } else {
      window.speechSynthesis.cancel();
      // Combine step text and subtext
      const utterance = new SpeechSynthesisUtterance(`${currentStep.text}. ${currentStep.subtext}`);
      utterance.rate = 0.9; // deliberate, easy to understand pace
      utterance.onend = () => setNarrationActive(false);
      utterance.onerror = () => setNarrationActive(false);
      window.speechSynthesis.speak(utterance);
      setNarrationActive(true);
    }
  };

  // Automatically narrate if steps change and narration is toggled
  useEffect(() => {
    if (narrationActive && currentStep) {
      handleNarrate(); // stop previous and narrate new
    }
  }, [currentStepIdx]);

  // Stop narration on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="max-w-md mx-auto w-full px-4 py-6 space-y-6 pb-20">
      
      {/* Category selector header */}
      <header className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-primary dark:text-secondary flex items-center gap-2">
          <HeartHandshake className="w-6 h-6 stroke-[2px]" />
          <span>Caregiver Crisis Mode</span>
        </h2>
        <p className="text-xs text-muted-foreground">
          Immediate, step-by-step guidance scripts and toolkits for caregivers.
        </p>
      </header>

      {/* Toolkit buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setActiveCategory(null);
            setShowScanner(!showScanner);
            if (typeof window !== 'undefined') window.speechSynthesis.cancel();
          }}
          className={`flex-1 py-2 px-3 rounded-2xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
            showScanner 
              ? 'bg-secondary/15 border-secondary/30 text-secondary'
              : 'bg-card border-border text-foreground hover:bg-slate-50'
          }`}
        >
          <Eye className="w-4.5 h-4.5" />
          <span>{showScanner ? 'Close Scanner' : 'Analyze Substance'}</span>
        </button>
      </div>

      {/* Render scanner if toggled */}
      {showScanner && !activeCategory && (
        <div className="space-y-2">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-400 text-xs font-semibold rounded-2xl flex gap-1.5 border border-blue-100 dark:border-blue-900/40">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>Photograph unknown substances, pills, or paraphernalia to identify triggers and risks.</span>
          </div>
          <VisionContainer />
        </div>
      )}

      {/* Scripts lists if scanner not open */}
      {!showScanner && !activeCategory && (
        <div className="space-y-2.5">
          <button
            onClick={() => { setActiveCategory('overdose'); setCurrentStepIdx(0); }}
            className="w-full text-left p-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-3xl flex justify-between items-center transition cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <AlertOctagon className="w-7 h-7 text-rose-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm text-rose-800 dark:text-rose-400">Overdose Emergency</p>
                <p className="text-[11px] text-rose-700/80 dark:text-rose-500/80">Unresponsive, slow breathing, pinpoint pupils.</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-rose-600" />
          </button>

          <button
            onClick={() => { setActiveCategory('aggression'); setCurrentStepIdx(0); }}
            className="w-full text-left p-4 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-3xl flex justify-between items-center transition cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <BrainCircuit className="w-7 h-7 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm text-amber-800 dark:text-amber-400">Aggressive Behaviour</p>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-500/80">Hostile, loud, or agitated response safety guide.</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-600" />
          </button>

          <button
            onClick={() => { setActiveCategory('withdrawal'); setCurrentStepIdx(0); }}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-3xl flex justify-between items-center transition cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <Activity className="w-7 h-7 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm text-blue-800 dark:text-blue-400">Severe Withdrawal</p>
                <p className="text-[11px] text-blue-700/80 dark:text-blue-500/80">Shakes, high sweating, confusion support guidelines.</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-600" />
          </button>

          <button
            onClick={() => { setActiveCategory('panic'); setCurrentStepIdx(0); }}
            className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 border border-border rounded-3xl flex justify-between items-center transition cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <Activity className="w-7 h-7 text-slate-600 dark:text-slate-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm text-foreground">Panic & Anxiety</p>
                <p className="text-[11px] text-muted-foreground">Rapid hyperventilating, intense fear anchor guide.</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>

          <button
            onClick={() => { setActiveCategory('craving'); setCurrentStepIdx(0); }}
            className="w-full text-left p-4 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-3xl flex justify-between items-center transition cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <HeartHandshake className="w-7 h-7 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm text-emerald-800 dark:text-emerald-400">Urge Coaching</p>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-500/80">Intense physical cravings management coach.</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-emerald-600" />
          </button>
        </div>
      )}

      {/* Active Script Teleprompter Card */}
      {activeCategory && script && currentStep && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground">
              {script.title}
            </span>
            <button
              onClick={() => {
                setActiveCategory(null);
                if (typeof window !== 'undefined') window.speechSynthesis.cancel();
                setNarrationActive(false);
              }}
              className="text-xs font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
            >
              Exit Teleprompter
            </button>
          </div>

          {/* Teleprompter Card Container */}
          <div className="bg-card rounded-3xl border border-border shadow-sm p-6 space-y-6 min-h-[250px] flex flex-col justify-between">
            {/* Steps tracker bubble */}
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-secondary bg-secondary/10 px-2.5 py-1 rounded-full">
                Step {currentStep.step} of {script.steps.length}
              </span>
              
              {/* Narration Voice Toggles */}
              <button
                onClick={handleNarrate}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  narrationActive ? 'bg-secondary text-white' : 'bg-slate-100 dark:bg-slate-800 text-foreground'
                }`}
                aria-label="Narrate card text"
              >
                {narrationActive ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            {/* Core Instruction (Large Typography) */}
            <div className="space-y-3.5 flex-1 flex flex-col justify-center">
              <h3 className="text-2xl md:text-3xl font-extrabold leading-tight tracking-tight text-foreground">
                {currentStep.text}
              </h3>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {currentStep.subtext}
              </p>
            </div>

            {/* Navigation Buttons (Swipe simulation) */}
            <div className="flex justify-between items-center gap-3 pt-4 border-t border-border/50">
              <button
                disabled={currentStepIdx === 0}
                onClick={() => setCurrentStepIdx(currentStepIdx - 1)}
                className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 text-foreground font-bold rounded-2xl text-sm flex items-center justify-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              
              <button
                onClick={() => {
                  if (currentStepIdx < script.steps.length - 1) {
                    setCurrentStepIdx(currentStepIdx + 1);
                  } else {
                    // Done with script, return
                    setActiveCategory(null);
                    if (typeof window !== 'undefined') window.speechSynthesis.cancel();
                    setNarrationActive(false);
                  }
                }}
                className="flex-1 py-3 px-4 bg-primary dark:bg-primary-light text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-1 hover:opacity-90 cursor-pointer"
              >
                {currentStepIdx === script.steps.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
