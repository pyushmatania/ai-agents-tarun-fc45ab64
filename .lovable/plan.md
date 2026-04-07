
# Chat Pages Full Redesign Plan

## Phase 1: Curriculum Chat Redesign (ChatPage - Learn Tab)
**Goal:** Transform from condensed chat bubbles into a spacious, card-based learning experience

### 1.1 Rich Content Cards System
Create reusable card components that render AI responses as structured content:
- **TheoryCard** — Beautiful, spacious card with heading, body text, key highlights, and visual icons
- **CodeCard** — Syntax-highlighted code block with copy button and language tag
- **ExampleCard** — Real-world example with icon, title, description, and visual
- **ComparisonCard** — Side-by-side comparison table/grid
- **DiagramCard** — ASCII/text diagrams with styled container
- **KeyPointsCard** — Bulleted key takeaways with checkmark icons
- **DefinitionCard** — Term + definition in a highlighted box
- **TimelineCard** — Step-by-step process visualization

### 1.2 Interactive Quiz Types (15 types)
All quiz cards will be Duolingo-style — full-width, colorful, animated:
1. **MCQ** — Multiple choice with option highlighting (exists, enhance)
2. **True/False** — Large toggle buttons (exists, enhance)  
3. **Fill-in-the-Blank** — Type answer (exists, enhance)
4. **Slider Scale** — Drag slider to correct value/range
5. **Match Columns** — Connect items from two columns with drag lines
6. **Drag & Drop Order** — Arrange items in correct sequence
7. **Code Fill-in** — Complete missing code with syntax highlighting
8. **Hotspot/Image Tap** — Tap the correct area on a diagram
9. **Word Bank** — Select words from a bank to complete a sentence
10. **Rating Scale** — Rate statements on a scale (agree/disagree)
11. **Categorize** — Drag items into correct category buckets
12. **Flashcard Flip** — Flip card to reveal answer, self-grade
13. **Voice/Audio** — Listen and type (placeholder UI)
14. **Emoji React** — Quick reaction-based assessment
15. **Speed Round** — Timed series of quick questions

### 1.3 Layout Changes
- Full-page card flow — content scrolls as rich cards, not chat bubbles
- AI suggestions pinned at bottom as collapsible bar (default expanded)
- 4D mode selector subtle at top, collapsible
- Spacious typography — larger text, more padding, breathing room

## Phase 2: General Chat (AGNI Chat Tab) Redesign
**Goal:** Feature-rich assistant with clean, spacious design

### 2.1 UI Overhaul
- Clean ChatGPT-style spacious bubbles with proper markdown
- Side action buttons: Image gen, File upload, Voice, Web search, Save notes
- Collapsible tools panel
- Rich media rendering in responses (images, code blocks, tables)

### 2.2 Features
- Image attachment button (placeholder UI)
- File attachment button (placeholder UI)
- Voice input button (placeholder UI)
- Web search toggle (placeholder UI)
- Save to notes button on any message
- Response actions: Copy, Share, Bookmark

## Phase 3: Shared Infrastructure
- AI suggestion bar at bottom — collapsible, default ON
- Persistent chat history (already done via useChat hook)
- Smooth page transitions
- Bottom nav integration

## Files to Create/Modify:
- `src/components/chat/TheoryCard.tsx` (new)
- `src/components/chat/CodeCard.tsx` (new)
- `src/components/chat/ExampleCard.tsx` (new)
- `src/components/chat/ComparisonCard.tsx` (new)
- `src/components/chat/KeyPointsCard.tsx` (new)
- `src/components/chat/ContentRenderer.tsx` (new - parses AI markdown into cards)
- `src/components/chat/InteractiveQuiz.tsx` (new - all 15 quiz types)
- `src/components/chat/SuggestionBar.tsx` (new - collapsible bottom suggestions)
- `src/components/chat/ChatToolbar.tsx` (new - image/file/voice/search tools)
- `src/components/chat/MessageActions.tsx` (new - copy/share/bookmark)
- `src/pages/ChatPage.tsx` (major rewrite)

## Edge Function Updates:
- Update `ai-tutor` prompt to output structured content markers (theory blocks, code blocks, quiz triggers) that the frontend can parse into cards
- Update `ai-chat` prompt similarly for general tab
