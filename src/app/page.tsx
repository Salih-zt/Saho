'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { AuthService } from '../services/authService';
import ThemeWrapper from '../components/ThemeWrapper';
import Navigation from '../components/Navigation';

// Feature Container Imports
import SahoNowContainer from '../features/saho-now/SahoNowContainer';
import CaregiverContainer from '../features/caregiver/CaregiverContainer';
import TimelineContainer from '../features/timeline/TimelineContainer';
import EducationContainer from '../features/education/EducationContainer';
import CircleOfSafetyContainer from '../features/circle-of-safety/CircleOfSafetyContainer';

export default function Home() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('saho-now');
  const [mounted, setMounted] = useState(false);

  // Auto-authenticate as guest on first load for friction-free access
  useEffect(() => {
    setMounted(true);
    if (!user) {
      AuthService.signInAsGuest();
    }
  }, [user]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-secondary animate-spin" />
      </div>
    );
  }

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
      {/* Scrollable Main viewport */}
      <main className="flex-1 overflow-y-auto w-full flex flex-col justify-start bg-bg-light dark:bg-bg-dark transition-colors duration-250">
        {renderTabContent()}
      </main>

      {/* Persistent Accessibility Bottom Navigation */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </ThemeWrapper>
  );
}
