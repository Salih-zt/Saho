'use client';

import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme, accessibility } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for client mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Manage light/dark theme classes
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, mounted]);

  if (!mounted) {
    // Return empty shell during SSR to prevent visual flash
    return <div className="min-h-screen bg-slate-50 flex flex-col">{children}</div>;
  }

  // Build custom classes based on active accessibility preferences
  const classes = [
    'min-h-screen flex flex-col w-full',
    accessibility.highContrast ? 'high-contrast' : '',
    accessibility.largeText ? 'text-lg [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl [&_p]:text-lg [&_button]:text-lg' : 'text-sm [&_p]:text-base',
    accessibility.reducedMotion ? '[&_*]:transition-none! [&_*]:animation-none!' : '',
  ].filter(Boolean).join(' ');

  return (
    <div id="saho-app-root" className={classes}>
      {children}
    </div>
  );
}
