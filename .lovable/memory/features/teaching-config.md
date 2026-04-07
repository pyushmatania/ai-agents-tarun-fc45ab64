---
name: Teaching Config — 3 Categories
description: Teaching modes split into Mission Mode, Teaching Vibe, Brain Level with shared config
type: feature
---
Teaching is organized into 3 fun-named categories in `src/lib/teachingConfig.ts`:
1. **🎯 Mission Mode** — WHY (job, future-proof, skill up, earn, build, struggling, explore, impress, interview, career switch)
2. **🎨 Teaching Vibe** — HOW (fun, story, serious, fast, visual, socratic, gamified, handson, eli5, academic, debate, podcast)
3. **🧠 Brain Level** — DEPTH (chill, explorer, pro, hacker, scientist, professor)

Stored in localStorage: `teaching_mission`, `teaching_vibe`, `teaching_brain`
Synced across: HomePage, SettingsPage (Neural OS), OnboardingPage, LessonChat
Backward compat: persona.vibe and persona.preferredDepth still synced
