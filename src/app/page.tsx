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
import { ArrowRight, Users, Mail, User, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const { user, isGuest } = useAuthStore();
  const { onboardingCompleted, completeOnboarding } = useSettingsStore();
  
  const [appState, setAppState] = useState<'onboarding' | 'welcome' | 'splash' | 'app'>('onboarding');
  const [activeTab, setActiveTab] = useState('saho-now');
  const [mounted, setMounted] = useState(false);

  // Email form local states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [formError, setFormError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Sync mount status
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle routing flow based on onboarding and auth status
  useEffect(() => {
    if (!mounted) return;

    if (user) {
      setAppState('splash');
    } else if (onboardingCompleted) {
      setAppState('welcome');
    } else {
      setAppState('onboarding');
    }
  }, [user, onboardingCompleted, mounted]);

  // Handle Splash Screen automatic timer transition to app dashboard
  useEffect(() => {
    if (appState === 'splash' && user) {
      const timer = setTimeout(() => {
        setAppState('app');
      }, 2000); // 2 seconds loading sync
      return () => clearTimeout(timer);
    }
  }, [appState, user]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
      </div>
    );
  }

  // Handle email signup or login form submit
  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setLoginSuccess(false);

    try {
      if (isSignUpMode) {
        if (!loginName || !loginEmail || !loginPassword) {
          setFormError('Please fill in all fields.');
          return;
        }
        await AuthService.signUpWithEmailAndPassword(loginEmail, loginPassword, loginName);
      } else {
        if (!loginEmail || !loginPassword) {
          setFormError('Please enter your email and password.');
          return;
        }
        await AuthService.signInWithEmailAndPassword(loginEmail, loginPassword);
      }
      setLoginSuccess(true);
      setTimeout(() => setLoginSuccess(false), 2000);
    } catch (err: any) {
      setFormError(err.message || 'Authentication failed.');
    }
  };

  const handleGoogleLogin = async () => {
    setFormError('');
    try {
      await AuthService.signInWithGoogle();
    } catch (e: any) {
      setFormError('Google Sign-in failed. Please try again.');
    }
  };

  const handleGuestLogin = async () => {
    setFormError('');
    try {
      await AuthService.signInAsGuest();
    } catch (e: any) {
      setFormError('Guest Access failed.');
    }
  };

  const handleOnboardingNext = () => {
    completeOnboarding();
    setAppState('welcome');
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
              onClick={handleOnboardingNext}
              className="text-xs font-heading font-bold text-outline hover:text-primary transition cursor-pointer"
            >
              Skip
            </button>
          </header>

          {/* Central Card */}
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
              onClick={handleOnboardingNext}
              className="w-full h-14 bg-primary text-white font-heading font-bold text-base rounded-full flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 transition shadow-[0px_10px_20px_rgba(26,35,126,0.15)] cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5px]" />
            </button>
          </footer>
        </div>
      )}

      {/* 2. AUTHENTICATION / WELCOME ENTRY GATE */}
      {appState === 'welcome' && (
        <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] flex flex-col justify-between p-6 max-w-[600px] mx-auto w-full font-sans relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f8f9fa] via-white to-primary-container/10 -z-10" />

          {/* Header */}
          <header className="flex justify-center items-center py-4">
            <div className="flex flex-col items-center space-y-1">
              <div className="w-12 h-12 bg-primary rounded-[16px] flex items-center justify-center shadow-md transform rotate-45">
                <Users className="-rotate-45 w-6 h-6 text-white stroke-[2.5px]" />
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-primary mt-2">SAHO</span>
            </div>
          </header>

          {/* Main Auth Actions */}
          <main className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full space-y-5 py-4">
            <div className="text-center space-y-1.5 pb-2">
              <h2 className="font-heading font-extrabold text-2xl text-[#191c1d]">Welcome to Recovery</h2>
              <p className="text-xs font-sans text-on-surface-variant font-medium leading-relaxed">
                Connect your Google account to secure your timeline progress, or use offline guest mode.
              </p>
            </div>

            <div className="space-y-3">
              {/* Google Sign In */}
              <button
                onClick={handleGoogleLogin}
                className="w-full h-13 bg-white text-slate-800 border border-outline-variant rounded-2xl text-xs font-heading font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition active:scale-98 cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>CONTINUE WITH GOOGLE</span>
              </button>

              {/* Guest Mode */}
              <button
                onClick={handleGuestLogin}
                className="w-full h-13 bg-slate-100 dark:bg-slate-800 text-foreground border border-outline-variant/60 rounded-2xl text-xs font-heading font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition active:scale-98 cursor-pointer"
              >
                <User className="w-4 h-4 text-muted-foreground" />
                <span>CONTINUE AS GUEST</span>
              </button>

              {/* Email Toggle */}
              <button
                onClick={() => setShowEmailLogin(!showEmailLogin)}
                className="w-full h-13 bg-slate-50 dark:bg-slate-900 text-foreground/80 border border-outline-variant/40 rounded-2xl text-xs font-heading font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition active:scale-98 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{showEmailLogin ? 'HIDE EMAIL OPTION' : 'CONTINUE WITH EMAIL'}</span>
              </button>
            </div>

            {/* Email form container */}
            {showEmailLogin && (
              <form onSubmit={handleEmailAuthSubmit} className="space-y-2.5 pt-3 border-t border-outline-variant/30 text-left">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
                    {isSignUpMode ? 'Create Account' : 'Sign In'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUpMode(!isSignUpMode);
                      setFormError('');
                    }}
                    className="text-[9px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    {isSignUpMode ? 'SWITCH TO SIGN IN' : 'SWITCH TO SIGN UP'}
                  </button>
                </div>

                {isSignUpMode && (
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    className="w-full h-10 px-4 bg-white border border-outline-variant rounded-xl text-xs focus:border-primary focus:outline-none"
                    required
                  />
                )}

                <input
                  type="email"
                  placeholder="email@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full h-10 px-4 bg-white border border-outline-variant rounded-xl text-xs focus:border-primary focus:outline-none"
                  required
                />

                <input
                  type="password"
                  placeholder="Password (Min 6 characters)"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full h-10 px-4 bg-white border border-outline-variant rounded-xl text-xs focus:border-primary focus:outline-none"
                  required
                />

                <button
                  type="submit"
                  className="w-full h-10 bg-primary text-white rounded-xl text-xs font-heading font-bold hover:opacity-90 transition active:scale-95 cursor-pointer shadow-sm shadow-primary/10"
                >
                  {isSignUpMode ? 'CREATE ACCOUNT' : 'LOG IN'}
                </button>
              </form>
            )}

            {formError && <p className="text-xs text-rose-500 font-semibold text-center">{formError}</p>}
            {loginSuccess && (
              <p className="text-xs text-secondary flex items-center justify-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Successfully authenticated.
              </p>
            )}
          </main>

          {/* Footer branding */}
          <footer className="py-4 text-center">
            <span className="text-[10px] font-semibold text-outline tracking-widest uppercase opacity-75">
              Secure Cloud Grounding
            </span>
          </footer>
        </div>
      )}

      {/* 3. SPLASH SCREEN LOADING VIEW */}
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

      {/* 4. MAIN APPLICATION NAVIGATION VIEW */}
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
