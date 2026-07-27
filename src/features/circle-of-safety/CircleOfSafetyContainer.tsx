'use client';

import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { AuthService } from '../../services/authService';
import { CaregiverService } from '../../services/caregiverService';
import { CaregiverContact } from '../../types';
import { 
  User, Shield, Accessibility, LogOut, CheckCircle, 
  Trash2, Plus, Phone, HeartHandshake, Eye, Volume2, MoveHorizontal, Mail
} from 'lucide-react';

export default function CircleOfSafetyContainer() {
  const { 
    theme, toggleTheme, accessibility, updateAccessibility, 
    contacts, setContacts, addContact, removeContact, updateContact 
  } = useSettingsStore();
  const { user, isGuest } = useAuthStore();
  
  // Local state for contact form
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyEnabled, setEmergencyEnabled] = useState(true);
  const [formError, setFormError] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(false);

  useEffect(() => {
    if (user) {
      setLoadingContacts(true);
      CaregiverService.fetchContacts(user.id)
        .then((list) => {
          setContacts(list);
        })
        .finally(() => {
          setLoadingContacts(false);
        });
    }
  }, [user, setContacts]);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name || !relationship || !phone) {
      setFormError('Please fill out all contact fields.');
      return;
    }

    // Normalize to E.164: strip spaces, ensure leading +
    const rawDigits = phone.replace(/\s+/g, '').trim();
    const normalizedPhone = rawDigits.startsWith('+') ? rawDigits : `+${rawDigits}`;

    if (normalizedPhone.replace(/\D/g, '').length < 7) {
      setFormError('Please enter a valid phone number with country code (e.g. +918078782349).');
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
      phone: normalizedPhone,
      emergencyEnabled,
    };

    try {
      if (user) {
        await CaregiverService.saveContact(user.id, newContact);
      }
      addContact(newContact);
      setName('');
      setRelationship('');
      setPhone('');
    } catch (err: unknown) {
      setFormError('Failed to save contact to database.');
    }
  };

  const handleToggleEmergency = async (contact: CaregiverContact) => {
    const updated = { ...contact, emergencyEnabled: !contact.emergencyEnabled };
    try {
      if (user) {
        await CaregiverService.saveContact(user.id, updated);
      }
      updateContact(updated);
    } catch (err: any) {
      console.error('Failed to toggle emergency contact:', err);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await CaregiverService.deleteContact(contactId);
      removeContact(contactId);
    } catch (err: any) {
      console.error('Failed to delete emergency contact:', err);
    }
  };

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setLoginSuccess(false);

    try {
      if (isSignUpMode) {
        if (!loginName || !loginEmail || !loginPassword) {
          setFormError('Please fill in all signup fields.');
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
      setLoginEmail('');
      setLoginName('');
      setLoginPassword('');
      setTimeout(() => setLoginSuccess(false), 3000);
    } catch (err: any) {
      setFormError(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handlePasswordReset = async () => {
    if (!loginEmail) {
      setFormError('Please enter your email to request a reset link.');
      return;
    }
    setFormError('');
    try {
      await AuthService.sendPasswordReset(loginEmail);
      setResetEmailSent(true);
      setTimeout(() => setResetEmailSent(false), 4000);
    } catch (err: any) {
      setFormError('Reset request failed: ' + err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setFormError('');
    try {
      await AuthService.signInWithGoogle();
      setLoginSuccess(true);
      setTimeout(() => setLoginSuccess(false), 3000);
    } catch (e: any) {
      setFormError('Google Sign-in failed. Please try again.');
    }
  };

  return (
    <div className="max-w-[600px] mx-auto w-full px-container-padding py-6 space-y-6 pb-32">
      
      {/* Account Section */}
      <section className="bg-card rounded-[24px] p-6 border border-outline-variant/60 shadow-[0px_10px_30px_rgba(26,35,126,0.02)] space-y-4">
        <div className="flex items-center space-x-3 text-primary dark:text-secondary-fixed">
          <User className="w-5.5 h-5.5 stroke-[2.5px]" />
          <h2 className="text-lg font-heading font-extrabold tracking-tight">Recovery Profile</h2>
        </div>
        
        {user ? (
          <div className="space-y-4">
            <div className="p-4 bg-surface-container-low dark:bg-slate-800/50 rounded-2xl border border-outline-variant/30">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Logged in as</p>
              <p className="font-heading font-bold text-base text-foreground mt-0.5">{user.displayName || 'Guest User'}</p>
              {user.email && <p className="text-sm font-sans text-muted-foreground mt-0.5">{user.email}</p>}
              <div className="mt-2.5 flex items-center space-x-1.5">
                <span className={`inline-block w-2 h-2 rounded-full ${isGuest ? 'bg-amber-400' : 'bg-secondary'}`}></span>
                <span className="text-[11px] font-bold text-muted-foreground">
                  {isGuest ? 'Crisis Guest Mode' : 'Cloud Synchronized Account'}
                </span>
              </div>
            </div>
            <button
              onClick={() => AuthService.logout()}
              className="flex items-center justify-center space-x-2 w-full h-[50px] bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl text-xs font-heading font-bold tracking-wider transition active:scale-98 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>SIGN OUT COMPANION</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs font-sans text-muted-foreground leading-relaxed">
              Sign in to backup your recovery timeline, or continue as a guest in offline crisis mode.
            </p>
            
            {/* Core Google Sign In Action */}
            <button
              onClick={handleGoogleLogin}
              className="w-full h-12 bg-white text-slate-800 border border-outline-variant rounded-2xl text-xs font-heading font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition active:scale-98 cursor-pointer shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>CONTINUE WITH GOOGLE</span>
            </button>

            {/* Simulated Guest Access */}
            <button
              onClick={() => AuthService.signInAsGuest()}
              className="w-full h-12 bg-slate-100 dark:bg-slate-800 text-foreground border border-outline-variant/60 rounded-2xl text-xs font-heading font-bold hover:bg-slate-200 transition active:scale-98 cursor-pointer"
            >
              CONTINUE AS GUEST
            </button>

            {/* Email form toggle option */}
            <div className="text-center pt-2">
              <button 
                type="button"
                onClick={() => setShowEmailLogin(!showEmailLogin)}
                className="text-[11px] font-heading font-bold text-primary dark:text-secondary-fixed hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{showEmailLogin ? 'HIDE EMAIL OPTION' : 'OR USE EMAIL ADDRESS'}</span>
              </button>
            </div>

            {showEmailLogin && (
              <form onSubmit={handleEmailAuthSubmit} className="space-y-3 pt-2 border-t border-outline-variant/30 text-left">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-outline uppercase tracking-wider">
                    {isSignUpMode ? 'Create Account' : 'Sign In'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUpMode(!isSignUpMode);
                      setFormError('');
                    }}
                    className="text-[10px] font-bold text-primary dark:text-secondary-fixed hover:underline cursor-pointer"
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
                    className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 border border-outline-variant rounded-2xl text-sm focus:border-primary focus:outline-none"
                    required
                  />
                )}

                <input
                  type="email"
                  placeholder="email@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 border border-outline-variant rounded-2xl text-sm focus:border-primary focus:outline-none"
                  required
                />

                <input
                  type="password"
                  placeholder="Password (Min 6 characters)"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 border border-outline-variant rounded-2xl text-sm focus:border-primary focus:outline-none"
                  required
                />

                <div className="flex items-center justify-between gap-4 pt-1">
                  {!isSignUpMode && (
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      className="text-[10px] font-semibold text-outline hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                  <button
                    type="submit"
                    className="ml-auto h-11 px-6 bg-primary text-white rounded-2xl text-xs font-heading font-bold hover:opacity-90 transition active:scale-95 cursor-pointer shadow-sm shadow-primary/10"
                  >
                    {isSignUpMode ? 'SIGN UP' : 'SIGN IN'}
                  </button>
                </div>
              </form>
            )}

            {formError && <p className="text-xs text-rose-500 font-medium text-center">{formError}</p>}
            {resetEmailSent && (
              <p className="text-xs text-secondary font-medium text-center">
                Reset link dispatched to your email address.
              </p>
            )}
            {loginSuccess && (
              <p className="text-xs text-secondary flex items-center justify-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Successfully authenticated.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Circle of Safety Contacts */}
      <section className="bg-card rounded-[24px] p-6 border border-outline-variant/60 shadow-[0px_10px_30px_rgba(26,35,126,0.02)] space-y-4">
        <div className="flex items-center space-x-3 text-primary dark:text-secondary-fixed">
          <Shield className="w-5.5 h-5.5 stroke-[2.5px]" />
          <h2 className="text-lg font-heading font-extrabold tracking-tight">Circle of Safety</h2>
        </div>
        <p className="text-xs font-sans text-muted-foreground leading-relaxed">
          Configure up to 5 trusted caregivers. If you trigger an emergency event, SAHO will immediately dispatch SMS guides to them.
        </p>

        {/* Contacts List */}
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div 
              key={contact.contactId}
              className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-outline-variant/40"
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-heading font-bold text-sm text-foreground">{contact.name}</span>
                  <span className="text-[9px] uppercase font-extrabold text-secondary border border-secondary/20 bg-secondary/5 px-2 py-0.5 rounded-full">
                    {contact.relationship}
                  </span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground space-x-1 font-sans">
                  <Phone className="w-3 h-3 text-muted-foreground/60" />
                  <span>{contact.phone}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => handleToggleEmergency(contact)}
                  className={`px-3 py-1 text-[10px] font-heading font-extrabold rounded-lg transition-colors cursor-pointer border ${
                    contact.emergencyEnabled 
                      ? 'bg-secondary/15 border-secondary/35 text-secondary' 
                       : 'bg-slate-200 dark:bg-slate-700 border-outline-variant/30 text-muted-foreground'
                  }`}
                >
                  {contact.emergencyEnabled ? 'SOS ON' : 'SOS OFF'}
                </button>
                <button 
                  onClick={() => handleDeleteContact(contact.contactId)}
                  className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                  aria-label={`Remove ${contact.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {contacts.length === 0 && (
            <div className="p-5 border border-dashed border-outline-variant rounded-2xl text-center">
              <HeartHandshake className="w-8 h-8 text-muted-foreground/50 mx-auto mb-1.5" />
              <p className="text-xs text-muted-foreground font-semibold">No emergency contacts set. Add one below.</p>
            </div>
          )}
        </div>

        {/* Add Contact Form */}
        {contacts.length < 5 && (
          <form onSubmit={handleAddContact} className="glass p-4 rounded-[20px] space-y-3 mt-4 text-left">
            <p className="text-[10px] uppercase font-extrabold tracking-wider text-muted-foreground">Add New Contact</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 px-3.5 bg-transparent border border-outline-variant/65 rounded-xl text-xs focus:border-primary focus:outline-none text-foreground"
              />
              <input
                type="text"
                placeholder="Relation (e.g. Brother)"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="h-10 px-3.5 bg-transparent border border-outline-variant/65 rounded-xl text-xs focus:border-primary focus:outline-none text-foreground"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="Phone with country code (e.g. 918078782349)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 h-10 px-3.5 bg-transparent border border-outline-variant/65 rounded-xl text-xs focus:border-primary focus:outline-none text-foreground"
              />
              <button
                type="submit"
                className="h-10 px-4 bg-primary text-white rounded-xl text-xs font-heading font-bold flex items-center gap-1 hover:opacity-90 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            {formError && <p className="text-xs text-rose-500 font-semibold">{formError}</p>}
          </form>
        )}
      </section>

      {/* Accessibility Controls */}
      <section className="bg-card rounded-[24px] p-6 border border-outline-variant/60 shadow-[0px_10px_30px_rgba(26,35,126,0.02)] space-y-4">
        <div className="flex items-center space-x-3 text-primary dark:text-secondary-fixed">
          <Accessibility className="w-5.5 h-5.5 stroke-[2.5px]" />
          <h2 className="text-lg font-heading font-extrabold tracking-tight">Accessibility Setup</h2>
        </div>

        <div className="space-y-4">
          {/* Theme selection */}
          <div className="flex justify-between items-center py-0.5">
            <div>
              <p className="font-heading font-bold text-sm text-foreground">Visual Palette</p>
              <p className="text-xs text-muted-foreground font-sans">Adjust contrast styles.</p>
            </div>
            <button
              onClick={toggleTheme}
              className="h-10 px-4 bg-slate-100 dark:bg-slate-800 border border-outline-variant rounded-xl text-xs font-heading font-bold hover:bg-slate-200 transition cursor-pointer"
            >
              {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>

          <hr className="border-outline-variant/30" />

          {/* High Contrast */}
          <div className="flex justify-between items-center py-0.5">
            <div className="flex items-center gap-3">
              <Eye className="w-4.5 h-4.5 text-outline" />
              <div>
                <p className="font-heading font-bold text-sm text-foreground">High Contrast Mode</p>
                <p className="text-xs text-muted-foreground font-sans">Increases screen legibility.</p>
              </div>
            </div>
            <button
              onClick={() => updateAccessibility({ highContrast: !accessibility.highContrast })}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-250 ${
                accessibility.highContrast ? 'bg-secondary' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                accessibility.highContrast ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Large Text */}
          <div className="flex justify-between items-center py-0.5">
            <div className="flex items-center gap-3">
              <span className="font-heading font-extrabold text-outline text-xs">AA</span>
              <div>
                <p className="font-heading font-bold text-sm text-foreground">Large Text Size</p>
                <p className="text-xs text-muted-foreground font-sans">Magnifies app typography.</p>
              </div>
            </div>
            <button
              onClick={() => updateAccessibility({ largeText: !accessibility.largeText })}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-250 ${
                accessibility.largeText ? 'bg-secondary' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                accessibility.largeText ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Text to Speech */}
          <div className="flex justify-between items-center py-0.5">
            <div className="flex items-center gap-3">
              <Volume2 className="w-4.5 h-4.5 text-outline" />
              <div>
                <p className="font-heading font-bold text-sm text-foreground">Auto Narration</p>
                <p className="text-xs text-muted-foreground font-sans">Narrates text descriptions aloud.</p>
              </div>
            </div>
            <button
              onClick={() => updateAccessibility({ textToSpeech: !accessibility.textToSpeech })}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-250 ${
                accessibility.textToSpeech ? 'bg-secondary' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                accessibility.textToSpeech ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="flex justify-between items-center py-0.5">
            <div className="flex items-center gap-3">
              <MoveHorizontal className="w-4.5 h-4.5 text-outline" />
              <div>
                <p className="font-heading font-bold text-sm text-foreground">Reduce Motion</p>
                <p className="text-xs text-muted-foreground font-sans">Minimizes pulsing screen motions.</p>
              </div>
            </div>
            <button
              onClick={() => updateAccessibility({ reducedMotion: !accessibility.reducedMotion })}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-250 ${
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
