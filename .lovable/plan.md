
## Splash & Onboarding Redesign Plan

### 1. Fix Build Error
- Restore missing `toggleItem` function declaration on line 141

### 2. Splash Screen Redesign
- Full-screen colorful gradient background (Duolingo-style bright colors)
- Large AGNI mascot with bounce-in animation + particle effects
- Playful typewriter effect for "Neural-OS" with color highlights
- Sound: boot-up chime on splash load
- Fun tagline: "Your AI Sensei awaits! 🔥"
- Animated loading dots with color cycling

### 3. Onboarding Redesign — Colorful Pill/Card Style
- **Step headers**: Fun catchy names for 4D steps:
  - Identity → "Pick Your Avatar 🎭" (Like choosing a character in a game)
  - Mission → "Choose Your Quest 🎯" (Like Naruto picking a mission scroll)
  - Vibe → "Set Your Vibe 🎨" (How AGNI talks - like picking a DJ)
  - Brain → "Power Level 🧠" (Like Dragon Ball Z power levels)
- **Colorful pill-style option cards** (like reference image): Each option gets a unique bright color pill with emoji icon, rounded shapes, varied sizes
- **Mascot transition screens**: Between major steps, show AGNI in different states (thinking, setting up, celebrating) with fun loading messages
- **Pop culture examples**: Naruto shadow clones = multi-agent, Goku power levels = brain levels, etc.

### 4. Sound System Enhancement
- Add sounds to: button taps, step transitions, option selections, splash boot, completion celebration
- Wire SFX.tap() on all interactive elements throughout onboarding
- Add a "whoosh" transition sound between steps
- Victory sound on completion

### 5. Transition Animations
- Mascot "interlude" screens between major sections (thinking → loading → ready)
- Confetti/particles on step completion
- Smooth spring animations on pill selections
- Staggered entrance for option lists

### Files to modify:
- `src/pages/SplashScreen.tsx` — full redesign
- `src/pages/OnboardingPage.tsx` — full redesign of UI, fix build error
- `src/lib/sounds.ts` — add transition/whoosh/boot sounds
