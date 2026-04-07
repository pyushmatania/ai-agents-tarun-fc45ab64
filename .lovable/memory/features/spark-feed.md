---
name: Spark feed features
description: AI Learn modal (NotebookLM-style), feed filters, like/save, sharing, Saved tab, Popular Picks in onboarding & settings
type: feature
---
- Feed has content-type filters (All, Videos, Articles, News) with counts
- Each feed card has Like, Save, Share, and "AI Learn" (brain icon) buttons
- Share uses native Web Share API with clipboard fallback
- AI Learn opens a bottom sheet modal with Summary + Quiz tabs, powered by ai-learn edge function
- AI Learn modal has share button in header
- Explore tab items also have AI Learn brain button
- **Saved tab** between Feed and Explore shows all bookmarked items with unsave/share/AI Notes actions
- Popular Picks section at top of each onboarding category screen with trending badges (uses POPULAR_PICKS from neuralOS.ts)
- **Popular Picks also shown in Settings Neural OS** interest editor when no search/sub-filter active
- POPULAR_PICKS must stay synced in onboarding AND settings pages
