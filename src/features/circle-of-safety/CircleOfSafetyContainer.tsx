'use client';

import React, { useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { AuthService } from '../../services/authService';
import { CaregiverContact } from '../../types';
import { 
  User, Shield, Accessibility, LogOut, CheckCircle, 
  Trash2, Plus, Phone, HeartHandshake, Eye, Volume2, MoveHorizontal 
} from 'lucide-react';

export default function CircleOfSafetyContainer() {
  const { theme, toggleTheme, accessibility, updateAccessibility, contacts, addContact, removeContact } = useSettingsStore();
  const { user, isGuest, logout } = useAuthStore();
  
  // Local state for contact form
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyEnabled, setEmergencyEnabled] = useState(true);
  const [formError, setFormError] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name || !relationship || !phone) {
      setFormError('Please fill out all contact fields.');
      return;
    }

    if (contacts.length >= 5) {
      setFormError('You can configure up to 5 emergency contacts.');
      return;
    }

    const newContact: CaregiverContact = {
      contactId: `contact_${Date.now()}`,
      name,
      relationship,
      phone,
      emergencyEnabled,
    };

    addContact(newContact);
    setName('');
    setRelationship('');
    setPhone('');
  };

  const handleMockLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    await AuthService.loginWithEmail(loginEmail, loginName || 'Recovery Friend');
    setLoginSuccess(true);
    setTimeout(() => setLoginSuccess(false), 3000);
  };

  return (
    <div className="max-w-md mx-auto w-full px-4 py-6 space-y-8 pb-20">
      
      {/* Account Section */}
      <section className="bg-card rounded-3xl p-5 border border-border shadow-sm space-y-4">
        <div className="flex items-center space-x-3 text-primary dark:text-secondary">
          <User className="w-6 h-6 stroke-[2px]" />
          <h2 className="text-xl font-bold tracking-tight">Recovery Profile</h2>
        </div>
        
        {user ? (
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <p className="text-xs text-muted-foreground">Logged in as</p>
              <p className="font-semibold text-foreground">{user.displayName || 'Guest User'}</p>
              {user.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
              <div className="mt-2 flex items-center space-x-1">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${isGuest ? 'bg-amber-400' : 'bg-secondary'}`}></span>
                <span className="text-xs font-medium text-muted-foreground">
                  {isGuest ? 'Crisis Guest Mode (Local Sync)' : 'Cloud Synchronized Account'}
                </span>
              </div>
            </div>
            <button
              onClick={() => AuthService.logout()}
              className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl text-sm font-semibold transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Companion</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleMockLogin} className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Sign in to backup your recovery timeline, or continue as a guest in offline crisis mode.
            </p>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Your Name"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm focus:outline-none"
              />
              <input
                type="email"
                placeholder="email@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm focus:outline-none"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 bg-primary dark:bg-primary-light text-white rounded-xl text-sm font-semibold hover:opacity-90 transition cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => AuthService.signInAsGuest()}
                className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-foreground rounded-xl text-sm font-semibold hover:bg-slate-200 transition cursor-pointer"
              >
                Guest Access
              </button>
            </div>
            {loginSuccess && (
              <p className="text-xs text-secondary flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Successfully authenticated.
              </p>
            )}
          </form>
        )}
      </section>

      {/* Circle of Safety Contacts */}
      <section className="bg-card rounded-3xl p-5 border border-border shadow-sm space-y-4">
        <div className="flex items-center space-x-3 text-primary dark:text-secondary">
          <Shield className="w-6 h-6 stroke-[2px]" />
          <h2 className="text-xl font-bold tracking-tight">Circle of Safety</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Configure up to 5 trusted caregivers. If you trigger an emergency event, SAHO will immediately dispatch SMS guides to them.
        </p>

        {/* Contacts List */}
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div 
              key={contact.contactId}
              className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-border/60"
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm">{contact.name}</span>
                  <span className="text-[10px] uppercase font-bold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded">
                    {contact.relationship}
                  </span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground space-x-1">
                  <Phone className="w-3 h-3" />
                  <span>{contact.phone}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    const nextEnabled = !contact.emergencyEnabled;
                    useSettingsStore.getState().updateContact({ ...contact, emergencyEnabled: nextEnabled });
                  }}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    contact.emergencyEnabled 
                      ? 'bg-secondary/10 text-secondary' 
                      : 'bg-slate-200 dark:bg-slate-700 text-muted-foreground'
                  }`}
                >
                  {contact.emergencyEnabled ? 'SOS On' : 'SOS Off'}
                </button>
                <button 
                  onClick={() => removeContact(contact.contactId)}
                  className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                  aria-label={`Remove ${contact.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {contacts.length === 0 && (
            <div className="p-4 border border-dashed border-border rounded-2xl text-center">
              <HeartHandshake className="w-8 h-8 text-muted-foreground/60 mx-auto mb-1.5" />
              <p className="text-xs text-muted-foreground">No emergency contacts set. Add one below.</p>
            </div>
          )}
        </div>

        {/* Add Contact Form */}
        {contacts.length < 5 && (
          <form onSubmit={handleAddContact} className="pt-2 border-t border-border/65 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm focus:outline-none"
              />
              <input
                type="text"
                placeholder="Relation (e.g. Spouse)"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-border rounded-xl text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-secondary text-white rounded-xl text-sm font-semibold flex items-center gap-1 hover:opacity-90 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            {formError && <p className="text-xs text-rose-500 font-medium">{formError}</p>}
          </form>
        )}
      </section>

      {/* Accessibility Controls */}
      <section className="bg-card rounded-3xl p-5 border border-border shadow-sm space-y-4">
        <div className="flex items-center space-x-3 text-primary dark:text-secondary">
          <Accessibility className="w-6 h-6 stroke-[2px]" />
          <h2 className="text-xl font-bold tracking-tight">Accessibility Setup</h2>
        </div>

        <div className="space-y-3.5">
          {/* Theme selection */}
          <div className="flex justify-between items-center py-1">
            <div>
              <p className="font-semibold text-sm">Visual Theme</p>
              <p className="text-xs text-muted-foreground">Adjust contrast palette styling.</p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-border rounded-xl text-xs font-semibold cursor-pointer"
            >
              {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>

          <hr className="border-border/50" />

          {/* High Contrast */}
          <div className="flex justify-between items-center py-1">
            <div className="flex items-center gap-2.5">
              <Eye className="w-4.5 h-4.5 text-slate-500" />
              <div>
                <p className="font-semibold text-sm">High Contrast Mode</p>
                <p className="text-xs text-muted-foreground">Enhances visual readability.</p>
              </div>
            </div>
            <button
              onClick={() => updateAccessibility({ highContrast: !accessibility.highContrast })}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                accessibility.highContrast ? 'bg-secondary' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                accessibility.highContrast ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Large Text */}
          <div className="flex justify-between items-center py-1">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-slate-500 text-xs">AA</span>
              <div>
                <p className="font-semibold text-sm">Large Text Size</p>
                <p className="text-xs text-muted-foreground">Boost typography dimensions.</p>
              </div>
            </div>
            <button
              onClick={() => updateAccessibility({ largeText: !accessibility.largeText })}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                accessibility.largeText ? 'bg-secondary' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                accessibility.largeText ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Text to Speech */}
          <div className="flex justify-between items-center py-1">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4.5 h-4.5 text-slate-500" />
              <div>
                <p className="font-semibold text-sm">Auto Narration</p>
                <p className="text-xs text-muted-foreground">Read cards aloud automatically.</p>
              </div>
            </div>
            <button
              onClick={() => updateAccessibility({ textToSpeech: !accessibility.textToSpeech })}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                accessibility.textToSpeech ? 'bg-secondary' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                accessibility.textToSpeech ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="flex justify-between items-center py-1">
            <div className="flex items-center gap-2.5">
              <MoveHorizontal className="w-4.5 h-4.5 text-slate-500" />
              <div>
                <p className="font-semibold text-sm">Reduce Motion</p>
                <p className="text-xs text-muted-foreground">Disables flashing transitions.</p>
              </div>
            </div>
            <button
              onClick={() => updateAccessibility({ reducedMotion: !accessibility.reducedMotion })}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                accessibility.reducedMotion ? 'bg-secondary' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                accessibility.reducedMotion ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </section>
      
    </div>
  );
}
