---
name: Serene Recovery
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#454652'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#767683'
  outline-variant: '#c6c5d4'
  surface-tint: '#4c56af'
  primary: '#000666'
  on-primary: '#ffffff'
  primary-container: '#1a237e'
  on-primary-container: '#8690ee'
  inverse-primary: '#bdc2ff'
  secondary: '#1b6d24'
  on-secondary: '#ffffff'
  secondary-container: '#a0f399'
  on-secondary-container: '#217128'
  tertiary: '#2d1400'
  on-tertiary: '#ffffff'
  tertiary-container: '#4b2600'
  on-tertiary-container: '#e17e00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e0e0ff'
  primary-fixed-dim: '#bdc2ff'
  on-primary-fixed: '#000767'
  on-primary-fixed-variant: '#343d96'
  secondary-fixed: '#a3f69c'
  secondary-fixed-dim: '#88d982'
  on-secondary-fixed: '#002204'
  on-secondary-fixed-variant: '#005312'
  tertiary-fixed: '#ffdcc2'
  tertiary-fixed-dim: '#ffb77a'
  on-tertiary-fixed: '#2e1500'
  on-tertiary-fixed-variant: '#6d3a00'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  container-padding: 20px
  touch-target-min: 48px
---

## Brand & Style
The design system is engineered for cognitive ease and emotional safety. It targets individuals in recovery or high-stress states where executive function is limited. The brand personality is "The Steady Hand"—quietly supportive, infinitely patient, and hyper-reliable.

The aesthetic fuses **Apple’s Human Interface** (precision and depth) with **Material 3** (color logic and adaptive shapes) and the soft, organic qualities of **Calm**. We utilize a **Soft-Modernist** approach: high-end glassmorphism for depth, heavy whitespace for breathing room, and a tactile quality that makes the digital interface feel physically safe. The emotional response should be a sigh of relief; the UI never demands, it only guides.

## Colors
The palette is rooted in psychological grounding. 
- **Primary (Deep Blue):** Used for core navigation and stability. It anchors the user.
- **Secondary (Emerald Green):** Represents growth and positive progression. Used for success states and "completion" moments.
- **Accent (Warm Amber):** Provides soft highlights and energy without causing anxiety.
- **Crisis (Bright Red):** Reserved strictly for emergency actions to ensure immediate recognition.

In Dark Mode, the background shifts to **Rich Navy**, maintaining a high contrast ratio (minimum 7:1 for text) to ensure readability for tired or strained eyes.

## Typography
We prioritize **Plus Jakarta Sans** for headings to provide a friendly, contemporary, and soft geometric feel. **Inter** is used for body copy due to its exceptional legibility and systematic clarity.

To support the "thinking for the user" philosophy, we use a clear typographic hierarchy. Large headings clearly state the current context, while body text is kept to a comfortable 18px for primary reading tasks to reduce cognitive load. Line heights are generous (1.5x+) to prevent text from feeling cramped.

## Layout & Spacing
The layout follows a **Mobile-First, One-Action** model. Each screen should ideally present the user with a single primary choice to prevent decision paralysis.

- **8pt Grid:** All components and spacing increments are multiples of 8.
- **Whitespace:** We use aggressive padding (minimum 24px) around primary content cards to focus the eye.
- **Safe Areas:** High-priority buttons (like "Get Help") are placed in the "Thumb Zone" (bottom third of the screen).
- **Fixed Widths:** On desktop, content is constrained to a 600px central column to maintain the intimacy of a mobile experience and prevent long line lengths.

## Elevation & Depth
This design system uses **Ambient Depth** to categorize information importance:
- **Level 0 (Background):** Soft Off-White (#F8F9FA). Non-interactive.
- **Level 1 (Cards):** Pure White with a very soft, large-radius shadow (0px 10px 30px rgba(26, 35, 126, 0.05)).
- **Level 2 (Active Elements):** Glassmorphism. Semi-transparent layers with a 20px backdrop-blur. This is used for navigation bars and floating action buttons to maintain context of the content beneath.
- **Gradients:** Subtle, 15-degree linear gradients (Primary to Secondary) are used on primary buttons to provide a sense of "upward" energy.

## Shapes
Shapes are intentionally hyper-rounded to evoke a sense of safety and softness. 
- **Standard Cards:** 24px corner radius.
- **Inputs & Buttons:** 16px corner radius.
- **Small Elements (Chips):** Fully pill-shaped.
Avoid any sharp corners (0px) as they trigger a "hazard" response in the brain. Icons should use rounded caps and joins to match this visual language.

## Components
- **Primary Button:** High-contrast Deep Blue or Gradient. Height: 56px. Text: 18px Semi-bold.
- **Action Cards:** Large (24px radius) containers with a single clear icon and headline. The entire card is the hit target (minimum 80px height).
- **Input Fields:** Soft grey fill with a subtle 1px border. On focus, the border transitions to Primary Blue with a soft outer glow.
- **Progress Indicators:** Soft, thick (8px) lines with rounded ends. Emerald Green indicates completion; Amber indicates "in progress."
- **Crisis Button:** Floating Action Button (FAB) or prominent fixed-bottom button. Bright Red (#D32F2F) with white text. High contrast is mandatory.
- **Navigation:** Bottom-tab bar using glassmorphism. Icons are minimal, 2px stroke, with labels always visible.
- **Empty States:** Soft, premium illustrations with rounded, organic limbs and warm color palettes.