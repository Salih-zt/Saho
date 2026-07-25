'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { AuthService } from '../services/authService';
import ThemeWrapper from '../components/ThemeWrapper';
import Navigation from '../components/Navigation';

// Feature Container Imports
import SahoNowContainer from '../features/saho-now/SahoNowContainer';
import CaregiverContainer from '../features/caregiver/CaregiverContainer';
import TimelineContainer from '../features/timeline/TimelineContainer';
import EducationContainer from '../features/education/EducationContainer';
import CircleOfSafetyContainer from '../features/circle-of-safety/CircleOfSafetyContainer';

// Icons
import { ArrowRight, Users, Sparkles, Heart } from 'lucide-react';

export default function Home() {
  const { user } = useAuthStore();
  const { onboardingCompleted, completeOnboarding, resetOnboarding } = useSettingsStore();
  
  const [appState, setAppState] = useState<'onboarding' | 'splash' | 'app'>('onboarding');
  const [activeTab, setActiveTab] = useState('saho-now');
  const [mounted, setMounted] = useState(false);

  // Sync state on mount
  useEffect(() => {
    setMounted(true);
    
    if (!user) {
      AuthService.signInAsGuest();
    }
  }, [user]);

  // Handle routing flow based on onboarding completion status
  useEffect(() => {
    if (!mounted) return;

    if (onboardingCompleted) {
      setAppState('splash');
    } else {
      setAppState('onboarding');
    }
  }, [onboardingCompleted, mounted]);

  // Handle Splash Screen automatic timer transition
  useEffect(() => {
    if (appState === 'splash') {
      const timer = setTimeout(() => {
        setAppState('app');
      }, 2500); // 2.5 seconds loading experience
      return () => clearTimeout(timer);
    }
  }, [appState]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
      </div>
    );
  }

  // Action: Complete onboarding and proceed to splash
  const handleStartApp = () => {
    completeOnboarding();
    setAppState('splash');
  };

  // Swap container views based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'saho-now':
        return <SahoNowContainer />;
      case 'caregiver':
        return <CaregiverContainer />;
      case 'timeline':
        return <TimelineContainer />;
      case 'education':
        return <EducationContainer />;
      case 'settings':
        return <CircleOfSafetyContainer />;
      default:
        return <SahoNowContainer />;
    }
  };

  return (
    <ThemeWrapper>
      {/* 1. ONBOARDING SCREEN VIEW */}
      {appState === 'onboarding' && (
        <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] flex flex-col justify-between p-6 max-w-[600px] mx-auto w-full font-sans relative overflow-hidden">
          {/* Header */}
          <header className="flex justify-between items-center py-2 z-10">
            <span className="font-heading font-extrabold text-xl tracking-tight text-primary">SAHO</span>
            <button 
              onClick={handleStartApp}
              className="text-xs font-heading font-bold text-outline hover:text-primary transition cursor-pointer"
            >
              Skip
            </button>
          </header>

          {/* Central 3D support group graphic card */}
          <main className="flex-1 flex flex-col justify-center py-4 z-10 space-y-6">
            <div className="bg-card rounded-[32px] border border-outline-variant/60 shadow-[0px_20px_40px_rgba(26,35,126,0.04)] p-4 space-y-5">
              <div className="aspect-[4/3] w-full rounded-[24px] overflow-hidden bg-slate-100 relative">
                <img 
                  src="/support_group_illustration.png" 
                  alt="Support group circle sharing stories" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Onboarding text copy */}
              <div className="space-y-2 text-left px-2 pb-2">
                <h2 className="font-heading font-extrabold text-2xl text-primary leading-tight">
                  You are not alone.
                </h2>
                <p className="font-sans text-sm text-on-surface-variant font-medium leading-relaxed">
                  A community of care is waiting to walk alongside you, offering strength when yours feels low.
                </p>
              </div>
            </div>

            {/* Page indicator dot indicators */}
            <div className="flex justify-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="w-2.5 h-2.5 rounded-full bg-outline-variant/50" />
              <span className="w-2.5 h-2.5 rounded-full bg-outline-variant/50" />
            </div>
          </main>

          {/* Core Action Button */}
          <footer className="py-4 z-10">
            <button
              onClick={handleStartApp}
              className="w-full h-14 bg-primary text-white font-heading font-bold text-base rounded-full flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 transition shadow-[0px_10px_20px_rgba(26,35,126,0.15)] cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5px]" />
            </button>
          </footer>
        </div>
      )}

      {/* 2. SPLASH SCREEN LOADING VIEW */}
      {appState === 'splash' && (
        <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] flex flex-col justify-center items-center p-6 max-w-[600px] mx-auto w-full font-sans relative overflow-hidden">
          {/* Ambient Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#f8f9fa] via-white to-primary-container/20 -z-10" />

          <main className="flex flex-col items-center justify-center text-center space-y-8 max-w-sm w-full">
            {/* Sunrise illustration */}
            <div className="relative w-64 h-64 md:w-72 md:h-72 mx-auto rounded-full overflow-hidden shadow-[0px_20px_40px_rgba(26,35,126,0.06)] bg-white border border-outline-variant/40 flex items-center justify-center">
              <img 
                src="/splash_illustration.png" 
                alt="Sunrise over supportive hands illustration" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Logo Mark & Tagline */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="w-14 h-14 bg-primary rounded-[18px] flex items-center justify-center shadow-lg transform rotate-45">
                <Users className="-rotate-45 w-7 h-7 text-white stroke-[2.5px]" />
              </div>
              
              <div className="space-y-1">
                <h1 className="font-heading font-extrabold text-3xl text-primary tracking-tight">SAHO</h1>
                <p className="font-sans text-sm font-semibold text-on-surface-variant tracking-wider uppercase opacity-75">
                  Your brother through recovery.
                </p>
              </div>
            </div>

            {/* Subtle progress indicator */}
            <div className="space-y-3 pt-6 flex flex-col items-center w-full">
              <div className="w-16 h-1 bg-surface-container-highest rounded-full overflow-hidden relative">
                <div className="absolute inset-y-0 bg-primary w-8 rounded-full animate-[loading_1.5s_infinite_ease-in-out]" />
              </div>
              <p className="font-sans text-[11px] font-bold text-outline uppercase tracking-widest opacity-60">
                Finding your steady hand...
              </p>
            </div>
          </main>

          {/* Inject micro animation keyframe */}
          <style jsx global>{`
            @keyframes loading {
              0% { left: -50%; width: 30%; }
              50% { left: 30%; width: 60%; }
              100% { left: 100%; width: 30%; }
            }
          `}</style>
        </div>
      )}

      {/* 3. MAIN APPLICATION NAVIGATION VIEW */}
      {appState === 'app' && (
        <>
          {/* Scrollable Main Viewport */}
          <main className="flex-1 overflow-y-auto w-full flex flex-col justify-start bg-bg-light dark:bg-bg-dark transition-colors duration-250">
            {renderTabContent()}
          </main>

          {/* Persistent Bottom Navigation Menu */}
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </>
      )}
    </ThemeWrapper>
  );
}
