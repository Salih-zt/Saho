# SAHO - AI Recovery Companion
> *Your brother through recovery.*

SAHO is a production-quality, AI-powered recovery companion designed to reduce cognitive load and provide compassionate, context-aware support for individuals affected by Substance Use Disorders (SUD) and their caregivers. 

---

## 1. Problem Statement
Substance Use Disorders (SUDs) affect millions of individuals worldwide. During moments of crisis or intense cravings, individuals experience extreme cognitive overload. Traditional recovery applications fail because they rely heavily on typing, complex menu navigation, lack support for caregivers, and expect structured decision-making exactly when cognitive capacity is lowest.

SAHO is built to **do the thinking for the user when thinking becomes difficult**. It enables:
* **Zero-Typing Interactions** via high-contrast touch options and Web Speech recognition.
* **Empathetic AI Guidance** that validates emotions and offers strict, actionable steps.
* **Caregiver Teleprompters** during emergencies (overdose, panic attacks).
* **Vision AI Analysis** to identify triggers and unknown medications.
* **Anxiety-Free Progress Tracking** celebrating healthy choices instead of stress-inducing daily streaks.

---

## 2. Technology Stack
* **Framework**: Next.js (App Router) + React 19 + TypeScript
* **Styling**: Tailwind CSS v4 + Framer Motion (mindful, low-motion transitions)
* **State Management**: Zustand + LocalStorage Persistence
* **Backend**: Firebase Authentication + Cloud Firestore
* **AI Engine**: Google Gemini 1.5 Flash (Text & Vision APIs)
* **Testing**: Vitest + JSDOM + Testing Library

---

## 3. Project Architecture & Feature Structure
SAHO is designed using a modular, feature-first architecture:

```
src/
├── app/                      # Next.js App routing & API endpoints
│   ├── api/
│   │   ├── ai/pulse/         # De-escalation generator endpoint
│   │   ├── vision/analyze/   # Object/Substance detector endpoint
│   │   └── caregiver/notify/ # Caregiver SMS trigger gateway
│   ├── globals.css           # Styling theme overrides
│   └── page.tsx              # Main Unified SPA Shell
├── components/               # Core shared layout & wrappers
│   ├── ThemeWrapper.tsx      # Global accessibility styles inject
│   └── Navigation.tsx        # Bottom menu (touch targets >= 48px)
├── features/                 # Feature modules
│   ├── saho-now/             # Landing, Voice AI, Breathing Loop
│   ├── caregiver/            # High-contrast teleprompter, Voice Synthesis
│   ├── trigger-vision/       # Camera stream analyzer
│   ├── timeline/             # Decision logs, Daily reflection
│   └── circle-of-safety/     # SOS contact configure, Settings
├── services/                 # Firebase and Gemini client layers
├── store/                    # Zustand persistent states
└── types/                    # Core model type declarations
```

---

## 4. Key AI Workflows
### A. Crisis De-escalation (Pulse AI)
```
Voice Input -> Web Speech to Text -> Prompt Context -> Gemini 1.5 Flash -> Zod validation -> Empathetic UX Checklist
```
1. Captures speech using the browser's native microphone interface.
2. Posts text to `/api/ai/pulse` with the current emotional state.
3. Gemini processes the state and returns a structured JSON de-escalation checklist.

### B. Trigger & Substance Vision AI
```
Camera Snapshot -> Canvas JPEG -> Base64 payload -> Gemini Vision -> Verification Warnings -> Grounding Advice
```
1. Takes a video capture frame.
2. Packages the JPEG as a base64 payload to `/api/vision/analyze`.
3. Gemini identifies surrounding triggers/pills, evaluates risk, and provides disposal guides.

---

## 5. Setup Instructions

### Prerequisites
* Node.js v18.x or higher
* npm v9.x or higher

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   cd Saho
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Copy the environment template and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

---

## 6. Testing & Quality Gates
We enforce high quality standards with strict type checking and automated testing.
* **Run Linter**: `npm run lint`
* **Run Tests**: `npm run test`

---

## 7. Future Roadmap
* **Wearable Integration**: Capture biometric indicators (sudden heart rate increases) to auto-trigger breathing prompts.
* **Therapist Dashboard**: Secure, encrypted export of healthy decision logs to clinicians.
* **Offline Service Workers**: Complete Progressive Web App (PWA) cache activation for remote, offline crisis situations.
* **Multilingual Voice Support**: Custom dialect prompts for regional languages.

---

## 8. License
This project is licensed under the MIT License - see the LICENSE file for details.
