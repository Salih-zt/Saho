import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AccessibilityPreferences, CaregiverContact } from '../types';

interface SettingsState {
  theme: 'light' | 'dark';
  accessibility: AccessibilityPreferences;
  contacts: CaregiverContact[];
  onboardingCompleted: boolean;
  toggleTheme: () => void;
  updateAccessibility: (prefs: Partial<AccessibilityPreferences>) => void;
  setContacts: (contacts: CaregiverContact[]) => void;
  addContact: (contact: CaregiverContact) => void;
  removeContact: (contactId: string) => void;
  updateContact: (contact: CaregiverContact) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const defaultAccessibility: AccessibilityPreferences = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  textToSpeech: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      accessibility: defaultAccessibility,
      contacts: [],
      onboardingCompleted: false,
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      updateAccessibility: (prefs) =>
        set((state) => ({
          accessibility: { ...state.accessibility, ...prefs },
        })),
      setContacts: (contacts) => set({ contacts }),
      addContact: (contact) =>
        set((state) => ({
          contacts: state.contacts.length < 5 ? [...state.contacts, contact] : state.contacts,
        })),
      removeContact: (contactId) =>
        set((state) => ({
          contacts: state.contacts.filter((c) => c.contactId !== contactId),
        })),
      updateContact: (updated) =>
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.contactId === updated.contactId ? updated : c
          ),
        })),
      completeOnboarding: () => set({ onboardingCompleted: true }),
      resetOnboarding: () => set({ onboardingCompleted: false }),
    }),
    {
      name: 'saho-settings',
    }
  )
);
