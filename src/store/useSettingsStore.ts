import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AccessibilityPreferences, CaregiverContact } from '../types';

interface SettingsState {
  theme: 'light' | 'dark';
  accessibility: AccessibilityPreferences;
  contacts: CaregiverContact[];
  toggleTheme: () => void;
  updateAccessibility: (prefs: Partial<AccessibilityPreferences>) => void;
  addContact: (contact: CaregiverContact) => void;
  removeContact: (contactId: string) => void;
  updateContact: (contact: CaregiverContact) => void;
}

const defaultAccessibility: AccessibilityPreferences = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  textToSpeech: false,
};

const defaultContacts: CaregiverContact[] = [
  {
    contactId: '1',
    name: 'Sarah (Caregiver)',
    relationship: 'Sister',
    phone: '555-0199',
    emergencyEnabled: true,
  },
  {
    contactId: '2',
    name: 'Dr. Robert Carter',
    relationship: 'Therapist',
    phone: '555-0144',
    emergencyEnabled: false,
  }
];

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      accessibility: defaultAccessibility,
      contacts: defaultContacts,
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      updateAccessibility: (prefs) =>
        set((state) => ({
          accessibility: { ...state.accessibility, ...prefs },
        })),
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
    }),
    {
      name: 'saho-settings',
    }
  )
);
