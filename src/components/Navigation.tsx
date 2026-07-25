'use client';

import React from 'react';
import { Heart, HeartHandshake, History, BookOpen, Settings } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const tabs = [
    { id: 'saho-now', label: 'SAHO NOW', icon: Heart },
    { id: 'caregiver', label: 'Caregiver', icon: HeartHandshake },
    { id: 'timeline', label: 'Timeline', icon: History },
    { id: 'education', label: 'Education', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav 
      aria-label="Primary Navigation"
      className="sticky bottom-0 left-0 right-0 border-t bg-card text-card-foreground border-border z-40 shadow-lg"
    >
      <div className="max-w-md mx-auto flex justify-between items-center px-2 py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-xl transition-all duration-200 min-h-[48px] min-w-[48px] cursor-pointer ${
                isActive
                  ? 'text-secondary font-semibold scale-105'
                  : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon 
                className={`w-6 h-6 mb-0.5 transition-transform duration-200 ${
                  isActive ? 'stroke-[2.5px] scale-110' : 'stroke-[1.75px]'
                }`} 
                aria-hidden="true"
              />
              <span className="text-[10px] tracking-wide uppercase select-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
