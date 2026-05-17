# Project Context

## Project Path

Absolute path: `D:\claudecode\miaotu`

GitHub repository: `https://github.com/katiemalfoy62-commits/miaotu.git`

Vercel production URL: `https://miaotu-pi.vercel.app`

Current branch: `master`

## What This Is

喵途 Miaotu is a gamified AI product manager learning companion for beginners, students, and early-career PM learners. It helps users build AI PM ability through input, practice, feedback, mock interviews, and a cute clay-cat growth loop.

Core product promise: a user who is almost zero-basic can first learn concepts in 小猫课堂, then practice with news, tasks, thinking drills, mock interviews, product-flow exercises, and targeted breakthrough drills. Progress is stored in a cat growth archive with XP, levels, fish rewards, notes, saved links, and Old Cat mentor conversations.

This is also intended to be portfolio/resume-demo-friendly: warm, cute, and clay-styled, but still understandable as a real learning product.

## Tech Stack

- Frontend: React 18 + Vite
- Language: JavaScript / JSX
- Package manager: npm
- Routing: `react-router-dom`
- State: Zustand with `persist`, stored in browser `localStorage` under `miaotu_store`
- UI/animation: `framer-motion`, `lucide-react`, `clsx`
- Charts: `recharts`
- Styling: Tailwind CSS plus custom CSS in `src/index.css`
- AI helper: browser-side OpenAI Chat Completions helper in `src/utils/claude.js`; exported name `callClaude` is kept for compatibility
- Voice input: browser Web Speech API plus optional Vercel backend transcription endpoint
- Backend/serverless: `api/transcribe.js` for optional speech transcription proxy
- Deployment: GitHub imported into Vercel, with SPA fallback rewrite in `vercel.json`

## How To Run

Install dependencies:

```powershell
cd D:\claudecode\miaotu
npm install
```

Start development server:

```powershell
npm run dev
```

Build:

```powershell
npm run build
```

Preview production build:

```powershell
npm run preview
```

In Codex desktop, Node may not be on `PATH`. Verified build command:

```powershell
& 'C:\Users\11512\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' 'node_modules\vite\bin\vite.js' build
```

Tests: no automated test script is configured.

## Current Status

The app is a working Vite React single-page app deployed on Vercel. Current routes:

- `/onboarding`: first-time intro, module introduction, cat name setup, Old Cat companion-style choice
- `/`: clay-style home dashboard, growth map, daily module cards, right-side progress widgets, guided homepage tour
- `/news`: trusted AI news source guide and AI news reading/PREP summaries
- `/tasks`: daily commissioned tasks
- `/training`: structured thinking drills
- `/classroom`: 小猫课堂, beginner-friendly AI/PM lessons
- `/workshop`: 造物工坊, product idea-to-flow practice with Old Cat feedback
- `/breakthrough`: targeted five-question drill
- `/interview` and `/interview/session`: mock interview setup/session/report
- `/archive`, `/archive/wrongbook`, `/archive/diary`, `/archive/interviews`: growth archive areas
- `/shop` and `/wardrobe`: fish reward shop and outfit flow
- `/settings`: API key, model mode, theme, cat name, Old Cat personality, voice settings
- `/collection`: saved question collection
- `/trehole`: cat treehole chat

Completed product pieces:

- Stable clay Kivi cat for the main companion visuals.
- Six fixed transparent stage-cat images for the growth route.
- Onboarding is simplified; no fur/eye/pattern/breed/gender customization.
- Old Cat style selection exists in onboarding and settings.
- Home guided tour exists and stores progress in Zustand/localStorage.
- API Key setup is part of the tour, and settings highlights the OpenAI key card.
- 小猫课堂 has expanded lesson content with definitions, plain explanations, scenarios, mistakes, exercises, mentor tips, and takeaways.
- 造物工坊 has 20 fixed product ideas plus an AI impromptu-topic option.
- Random fixed workshop topics skip fixed ideas already completed.
- AI news no longer uses 2023 mock news or `example.com`; it uses a trusted source whitelist/fallback source guide.
- Link vault and Old Cat saved-chat archive exist and can save/copy/export useful material.
- Voice input button exists and can use browser speech or optional backend transcription depending on settings.
- Mobile has a first responsive pass: bottom nav, compact hero/card styles, tool entry in nav, and hidden side launchers on smaller screens.
- Reward economy is centralized in `src/config/growthRules.js`.

Current git status before this handoff update was clean after the latest reward-mechanism push.

## Important Files

- `PROJECT_CONTEXT.md`: this handoff file. Keep it as the single source of context for the next Codex conversation.
- `package.json`: scripts and dependencies.
- `vite.config.js`: Vite React config.
- `vercel.json`: SPA rewrite for direct route refresh on Vercel.
- `api/transcribe.js`: Vercel serverless transcription proxy for optional backend speech-to-text.
- `src/main.jsx`: React entry point.
- `src/App.jsx`: route wiring and onboarding guard.
- `src/store/useStore.js`: central persisted Zustand state, rewards, records, Old Cat chats, shop/wardrobe state, onboarding flags, home tour state.
- `src/config/growthRules.js`: single source of truth for XP rewards, fish rewards, streak rewards, level curve, and cat stages.
- `src/utils/levelCalc.js`: level/growth utilities using the centralized growth rules.
- `src/utils/claude.js`: OpenAI API helper and prompt helpers.
- `src/utils/newsFeeds.js`: frontend RSS fetcher for trusted AI news sources.
- `src/utils/gptPrompt.js`: GPT handoff prompt utilities.
- `src/components/Layout/Layout.jsx`: app shell, navbar/back behavior, bottom nav, floating tools, Old Cat visibility.
- `src/components/Tools/ToolDrawer.jsx`: shared tool drawer entry for link vault, Old Cat, and saved chats.
- `src/components/OldCat/OldCat.jsx`: Old Cat mentor chat panel; listens for `miaotu:open-oldcat`.
- `src/components/OldCat/FloatingOldCatArchive.jsx`: saved Old Cat chat archive panel.
- `src/components/LinkVault/FloatingLinkVault.jsx`: URL/prompt vault panel.
- `src/components/VoiceInput/VoiceInputButton.jsx`: shared speech-to-text button.
- `src/components/Cat/BlinkingClayMascot.jsx`: blinking clay mascot component.
- `src/components/Cat/LayeredCat.jsx`: stable Kivi image wrapper; do not revive layered appearance customization casually.
- `src/pages/Home/Home.jsx`: home dashboard, growth map, module cards, guided tour, scroll/highlight logic.
- `src/pages/Onboarding/Onboarding.jsx`: onboarding flow and Old Cat style selection.
- `src/pages/Settings/Settings.jsx`: API, model, cat, Old Cat, and voice settings.
- `src/pages/Classroom/Classroom.jsx`: 小猫课堂 lesson UI and completion rewards.
- `src/pages/Workshop/Workshop.jsx`: 造物工坊 topic selection, answer flow, feedback, rewards.
- `src/pages/News/News.jsx`: news source guide and article reading/saving.
- `src/pages/Tasks/Tasks.jsx`: daily task answering and reward logic.
- `src/pages/Training/Training.jsx`: thinking drills and reward logic.
- `src/pages/Interview/Interview.jsx`: mock interview flow, adaptive follow-ups, records.
- `src/pages/Breakthrough/Breakthrough.jsx`: targeted drill and reward logic.
- `src/data/classroomLessons.js`: 小猫课堂 lesson data.
- `src/data/workshopIdeas.js`: 造物工坊 fixed ideas and product-flow steps.
- `src/data/newsSources.js`: trusted AI news sources.
- `src/data/shopItems.js`: shop item definitions; terminal may display Chinese/emoji as mojibake.
- `src/index.css`: custom visual styling, responsive layout, dark mode, tour, clay UI.
- `src/assets/mascots/`: clay mascot assets.
- `src/assets/ui-clay/`: clay UI icons.
- `src/assets/interviewers/`: clay interviewer cat PNGs.
- `src/assets/cat-stages/`: six transparent growth-stage cat images.
- `archive_cleanup/`: local-only temporary cleanup archive, ignored by Git.

## Design And Product Decisions

- Keep the visual direction clay-style, soft, dimensional, warm, and cat-centered.
- Do not revert clay mascots to flat SVG cats.
- The product should feel like a real learning app, not a marketing landing page.
- Input before practice matters: 小猫课堂 should be the first learning entry because the user is nearly zero-basic.
- Recommended home module order: first row 小猫课堂 and 今日情报站; second row 委托任务 and 思维训练; third row 面试模拟 and 造物工坊.
- Current decision: temporarily do not support custom cat appearance. Keep cat naming and outfit/shop ideas, but do not reintroduce full appearance customization without discussion.
- Growth route should still show six different growth-stage cats.
- Old Cat is a useful mentor/tool entry, not decoration. Static Old Cat image is preferred where blinking creates artifacts.
- Tools should live in a tool drawer rather than multiple floating side buttons, especially on mobile. Opening tools should not destroy the current page state.
- Homepage guided tour should be interactive, but not annoying. It should run only for first-time users, continue across settings, and explain API/voice setup clearly.
- User dislikes clutter and oversized mobile cards. Mobile should feel like an app: fixed top/bottom shell, one focused content area, minimal sideways floating elements.
- News content should come from the trusted AI source whitelist where possible: OpenAI, Anthropic, Google DeepMind, Meta AI, Microsoft AI, MIT Technology Review, The Verge, TechCrunch, VentureBeat, and Ars Technica.
- GPT handoff actions are intended behavior and should remain.
- API keys are user-provided and stored locally. Do not commit or hardcode private keys.
- AI chat/API and speech transcription API are separate settings by design, so speech can use a cheaper/non-OpenAI provider.
- 小猫课堂 should be more than flashcards: include professional definition, plain explanation, example, mistake, exercise, and mentor guidance.
- 造物工坊 trains full 0-to-1 product-development order. Daily tasks are smaller work simulations; do not merge these two concepts.
- Reward economy should remain slow enough for long-term use.

## Known Issues

- No automated tests are configured.
- The app is frontend-first; most progress/settings live in browser `localStorage`.
- Browser-side OpenAI calls are acceptable for a personal demo with user-entered keys, but not for shared production secrets.
- Vite build warns that some chunks are larger than 500 kB.
- PowerShell may display Chinese/emoji source text as mojibake. Use `Get-Content -Encoding UTF8` or verify in browser/editor.
- Existing users may have old `miaotu_store` schemas. Clearing localStorage can help if state looks strange.
- Mobile layout still has serious UX issues reported by the user: pages can feel too tall, some cards are oversized, and fixed bottom nav can overlap content or tour cards.
- Mobile keyboard behavior is unresolved. On interview/treehole/text-answer pages, focusing an input can hide the question/context because the keyboard takes most of the viewport.
- 新手指导 currently needs another pass: mobile tour card can be blocked by the bottom nav, and the settings/API/voice guide can be interrupted when navigating away and back.
- Homepage module order is not yet changed to the newly agreed order.
- Tool drawer direction is agreed, but QA is still needed to ensure link vault, Old Cat, and saved chats keep their original functions inside the drawer and preserve the current page state.
- Old Cat blinking/static issue: user noticed two small black horizontal artifacts near Old Cat's face. Decision is to keep that mascot static to avoid blink artifacts.
- 造物工坊 answer area still has layout issues on desktop/mobile. The "让老猫看流程" button can float awkwardly and should be fixed at the end of the answer form.
- 造物工坊 should move from "topic list plus answer form below" toward a focused answer page/section after selecting a topic.
- 小猫课堂 mobile flow should click a lesson and focus the lesson view, not make the user scroll down through the whole page.
- News, Archive, Interview, Breakthrough, and task pages still need mobile layout QA.
- On mobile, the old side folder/tool launchers should be fully absorbed into bottom nav/tool drawer; no floating peeks should block content.
- Returning from a module to home currently may reset to the top. Desired behavior: return to the section/card the user entered from.
- PWA is not implemented yet. User likes the idea because mobile web browser chrome is inconvenient.
- Voice input may not work on all browsers. Chrome support is best for Web Speech; iOS/Safari behavior needs real-device testing.
- Non-transparent legacy stage PNGs and paused cat-customizer assets were moved to `archive_cleanup/`; restore only if needed.

## Cat Growth And Reward Rules

The single source of truth is `src/config/growthRules.js`. Do not hardcode XP, fish, streak, or level thresholds inside individual pages.

XP rewards:

- 小猫课堂：+5 XP
- 新闻：0 XP
- 委托任务：简单 +5 / 中等 +8 / 困难 +10 XP
- 思维训练：+10 XP
- 面试模拟：+15 XP
- 造物工坊：+18 XP
- 爆破猫咪：+12 XP
- 老猫普通聊天/洞察：0 XP

Fish rewards:

- 面试模拟：+5 小鱼干
- 造物工坊：+8 小鱼干
- 爆破猫咪：+3 小鱼干
- 连续学习：每连续 7 天 +3 小鱼干
- 新闻、小猫课堂、委托任务、思维训练、老猫普通聊天：0 小鱼干

Level curve:

- Lv 1-5：每级 50 XP
- Lv 6-10：每级 80 XP
- Lv 11-25：每级 120 XP
- Lv 26-45：每级 180 XP
- Lv 46-70：每级 260 XP
- Lv 71-90：每级 360 XP
- Lv 91-100：每级 500 XP

Growth stages:

- Lv 1-10：流浪小猫
- Lv 11-25：学生猫
- Lv 26-45：实习猫
- Lv 46-70：初级 PM 猫
- Lv 71-90：资深 PM 猫
- Lv 91-100：首席猫

## Next Tasks

1. Fix the home module order: 小猫课堂, 今日情报站, 委托任务, 思维训练, 面试模拟, 造物工坊.
2. Convert Old Cat mascot rendering to static where blinking artifacts appear.
3. Rework mobile layout into a more app-like shell: fixed top/bottom, only middle content scrolls where feasible, no floating side peeks covering content.
4. Finish the tool drawer consolidation on desktop and mobile: link vault, Old Cat, and saved-chat archive should live there and keep their existing functions.
5. Fix mobile keyboard UX on interview, treehole, training, tasks, and workshop answer inputs so the active question/context stays visible.
6. Repair guided tour persistence and settings flow: first-time tour should continue through API and voice setup, not disappear after entering settings.
7. Add explicit tour steps for OpenAI API Key, voice input mode, and optional backend speech API settings.
8. Move 造物工坊 toward a focused selected-topic answer view and keep "让老猫看流程" fixed at the end of the form.
9. Improve 小猫课堂 mobile flow so tapping a lesson focuses the lesson detail instead of requiring long scrolling.
10. Preserve home scroll position when returning from modules such as shop, classroom, workshop, news, or training.
11. Consider adding PWA support: manifest, icons, service worker strategy, and install guidance.
12. QA reward logic after any new completion flows to ensure every XP/fish reward still uses `src/config/growthRules.js`.
13. Continue dark-mode and mobile browser QA across all routes.
14. Optional later cleanup: route-level code splitting and image optimization to reduce the 500 kB chunk warning.

## Recent Changes

This round of development added or refined:

- 小猫课堂 as a dedicated learning/input module.
- 造物工坊 as a product-development flow practice module.
- Expanded 小猫课堂 content to 5 learning paths and 25 lessons.
- Expanded 造物工坊 to 20 fixed ideas plus a separate AI impromptu-topic option.
- Random fixed workshop topic selection now skips completed fixed ideas.
- News source logic moved away from stale mock 2023/example.com content toward trusted AI source entries.
- Link vault save state/deduping and viewport constraints were improved.
- Voice input system added: browser speech mode, backend transcription mode, auto mode, and settings for separate speech API credentials.
- `api/transcribe.js` added as the backend transcription proxy.
- Mobile responsive pass added: bottom nav, compacted key sections, tool entry, and hidden side peeks on small screens.
- Tool drawer component added for shared tools.
- Reward economy centralized in `src/config/growthRules.js`.
- Reward entry points updated to use centralized rules: classroom, news, tasks, training, interview, workshop, breakthrough, Old Cat, level calculation, and streak rewards.
- `PROJECT_CONTEXT.md` updated with the current reward rules and current handoff state.

Latest verified command before this handoff update:

```powershell
& 'C:\Users\11512\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' 'node_modules\vite\bin\vite.js' build
```

Build passed with the known 500 kB chunk warning.

## Notes For Next Codex

- Start by reading this file, then inspect `src/pages/Home/Home.jsx`, `src/index.css`, `src/components/Layout/Layout.jsx`, `src/components/Tools/ToolDrawer.jsx`, `src/pages/Settings/Settings.jsx`, and `src/config/growthRules.js`.
- Use `Get-Content -Encoding UTF8` when reading Chinese text in PowerShell.
- Do not create another handoff file. Keep updating `PROJECT_CONTEXT.md`.
- Do not revive full cat appearance customization unless the user explicitly asks.
- Be careful with mobile changes: the user wants app-like behavior, not just smaller desktop cards.
- When touching rewards, edit `src/config/growthRules.js` first and import from it.
- When touching voice input, remember there are two separate API concepts: OpenAI chat/generation API and speech transcription API.
- When touching the guided tour, test clean localStorage and a returning user state.
- If testing locally in Codex desktop, Vite dev server may need the bundled Node command. If sandbox blocks esbuild child process spawning, request escalation rather than working around it.
- After code changes, run the bundled Vite build command above.
