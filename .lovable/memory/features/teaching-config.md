---
name: Teaching config 4-dimension system
description: AGNI v2 mega prompt — Identity, Mission, Vibe (+ Universe), Brain Level (Skill + Academic tracks) with custom options
type: feature
---
Teaching is organized into 4 dimensions in `src/lib/teachingConfig.ts`:
1. **🪪 Identity** — WHO (22 presets: Developer, Painter, Driver, Chef, Founder, etc.) — drives metaphors
2. **🎯 Mission Mode** — WHY (16 presets: My Job, Future-Proof, Skill Up, Money Moves, Build, Go Easier, Just Vibing, Impress, Interview, Career Switch, Curiosity Only, Academic, Startup, Hackathon, Teach Others, Audit) — drives priorities
3. **🎨 Teaching Vibe** — HOW (12 style presets + Universe Vibes for any movie/anime/game/character) — drives voice
4. **🧠 Brain Level** — DEPTH (Skill track: 11 levels Sprout→Demon Mode, Academic track: 8 levels Class 5→Professor) — drives depth

Stored in localStorage: `teaching_identity`, `teaching_mission`, `teaching_vibe`, `teaching_brain`, `teaching_universe_vibe`, `teaching_brain_track`
Synced across: HomePage, SettingsPage, OnboardingPage, LessonChat
AI tutor edge function: builds structured AGNI system prompt from all 4 dims + universe vibe
Rule: Identity→metaphors, Mission→priorities, Vibe→voice, Level→depth. Custom is first-class.
