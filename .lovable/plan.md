
# AgentDojo Redesign — Phase Plan

Based on the 50+ page mega prompt spec. Each phase builds on the previous.

---

## **Phase 1: Design System + AGNI Mascot** 🎨
- Implement the full color palette (dark mode: #131F24 bg, #58CC02 green primary, gold, red, blue, purple accents)
- Add Nunito font (ExtraBold for headlines, Regular for body, JetBrains Mono for code)
- Set up spacing system, border radius tokens, 3D button shadow system
- **Rebuild AGNI mascot** with all 8 expression states (default, happy, excited, thinking, sad, teaching, sleeping, celebrating)
- Add blinking eyes, breathing animation, squash & stretch

## **Phase 2: Splash + Onboarding + Home** 🏠
- **Splash screen**: AGNI center, wordmark typewriter effect, animated loading dots, auto-transition
- **Onboarding**: 3 swipeable slides with AGNI in different poses, progress dots, "Get Started" button
- **Home page**: Full Duolingo-style with streak flame, XP display, hearts, daily goal ring, continue learning card, AGNI greeting

## **Phase 3: Learning Path (Courses Page)** 🛤️
- Winding bubble trail (Duolingo unit path) with proper S-curve layout
- Lesson nodes: locked (gray), current (glowing green pulse), completed (green + crown), perfect (gold)
- Treasure chest nodes between sections
- AGNI peeking from behind nodes
- Module banners with progress bars
- Proper 3D button feel on nodes

## **Phase 4: Lesson & Quiz Experience** 📚
- **Full-screen lesson cards** — swipeable concept cards (not chat/scroll)
- Progress bar at top, heart counter
- Concept explanation → diagram → quiz flow
- **Quiz types**: Multiple choice, drag-and-drop, fill-in-blank, true/false
- Correct/wrong animations with AGNI reactions
- XP earned popup, lesson complete celebration with confetti

## **Phase 5: Gamification Systems** 🎮
- XP tracking + level system (Level = XP / 500, titles: Novice → Legend)
- Streak system with flame animation
- Hearts (5 max, lose on wrong, regenerate over time)
- Gems currency (earn/spend)
- Daily quests (3 random challenges)
- Achievement badges (30+ unlockable)
- League system (Bronze → Legendary)

## **Phase 6: Polish & Remaining Pages** ✨
- Progress/stats page with charts and AGNI
- Curiosity page refinements
- Roadmap page
- Settings with sound toggle, daily goal picker
- Micro-interactions library (button press squash, celebrations)
- Loading/empty/error states with AGNI expressions
- Page transition animations (swoosh)

---

**Shall I start with Phase 1?** Each phase is a focused chunk that I'll implement in one go.
