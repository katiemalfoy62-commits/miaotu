# Project Context

## Project Path

Absolute path: `D:\claudecode\miaotu`

GitHub repository: `https://github.com/katiemalfoy62-commits/miaotu.git`

Vercel production URL: `https://miaotu-pi.vercel.app`

Current branch: `master`

## What This Is

Miaotu is a gamified AI product manager learning companion for students or early-career PM learners. It helps users build AI PM habits through daily AI news, PM tasks, structured thinking drills, mock interviews, targeted breakthrough practice, growth records, and an Old Cat mentor.

The app is intended to be resume-demo-friendly: cute and clay-styled, but still understandable as a real learning product when a first-time visitor opens it from a portfolio or resume link.

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

The app is a working Vite React single-page app deployed on Vercel. Main routes include:

- `/onboarding`: first-time intro, module introduction, cat name setup, Old Cat companion-style choice
- `/`: clay-style home dashboard, growth route, daily module cards, right-side progress widgets, guided homepage tour
- `/news`: AI news reading and PREP-style summaries
- `/tasks`: daily commissioned tasks
- `/training`: structured thinking drills
- `/classroom`: 小猫课堂, lightweight AI/PM concept lessons for zero-basic learners
- `/workshop`: 造物工坊, product idea-to-flow practice with Old Cat feedback
- `/breakthrough`: targeted five-question drill
- `/interview` and `/interview/session`: mock interview setup/session/report
- `/archive`, `/archive/wrongbook`, `/archive/diary`, `/archive/interviews`: growth archive areas
- `/shop` and `/wardrobe`: fish reward shop and outfit flow
- `/settings`: API key, model mode, theme, cat name, Old Cat personality, voice setting
- `/collection`: saved question collection
- `/trehole`: cat treehole chat

Current product state:

- Homepage uses a stable clay Kivi cat for the main companion visuals.
- Growth route uses six fixed transparent stage-cat images for hover/focus/click previews.
- Onboarding no longer has fur color, eye color, pattern, breed, or gender customization.
- Onboarding flow is: Old Cat introduces the site, introduces core modules, explains rewards/growth stages, asks for cat name and Old Cat companion style, then enters homepage.
- Settings only allows editing the cat name for the cat section; visual appearance customization is intentionally hidden for now.
- Homepage guided tour has 9 steps: growth overview, news station, tasks, thinking drills, interview simulation, cat/fish/shop, Old Cat plus Kitten Corner, breakthrough/archive, and the two right-side floating folders.
- Guided tour auto-scrolls the current target into view, highlights the current target, keeps it clickable, and uses a CSS-drawn paw pointer. This paw pointer is currently disliked by the user and should be redesigned.
- The Old Cat panel, link vault panel, and saved Old Cat chat panel are lifted above the tour overlay while their steps are active so they can be operated.
- Mock interview now attempts adaptive follow-up questions based on the user's previous answer instead of only asking a fixed next question.
- Dark mode was revised toward a neutral, WeChat-like deep gray palette with better text contrast, but still needs visual QA across all pages.
- Large legacy mascot PNGs were partly optimized to WebP. Interviewer PNGs and six stage PNGs are still relatively large.

## Important Files

- `PROJECT_CONTEXT.md`: this handoff file. Keep it as the single source of context for the next Codex conversation.
- `package.json`: scripts and dependencies.
- `vite.config.js`: Vite React config.
- `vercel.json`: SPA rewrite for direct route refresh on Vercel.
- `src/main.jsx`: React entry point.
- `src/App.jsx`: route wiring.
- `src/store/useStore.js`: central persisted Zustand state, rewards, records, Old Cat chats, shop/wardrobe state, onboarding flags, home tour state.
- `src/utils/claude.js`: OpenAI API helper and prompt helpers.
- `src/utils/gptPrompt.js`: GPT handoff prompt utilities.
- `src/utils/newsFeeds.js`: frontend RSS fetcher for the trusted AI news source whitelist.
- `src/utils/levelCalc.js`: level/growth calculation utilities.
- `src/config/growthRules.js`: single source of truth for XP rewards, fish rewards, streak rewards, level curve, and cat growth stages.
- `src/components/Layout/Layout.jsx`: app shell, navbar/back behavior, floating tools, Old Cat visibility.
- `src/components/OldCat/OldCat.jsx`: Old Cat mentor chat panel; listens for `miaotu:open-oldcat`.
- `src/components/VoiceInput/VoiceInputButton.jsx`: shared speech-to-text button. It supports browser Web Speech, backend recording transcription, and auto mode based on user settings.
- `api/transcribe.js`: Vercel serverless transcription proxy. It accepts user-provided speech API credentials and supports OpenAI-style audio transcription or a custom JSON endpoint.
- `src/components/OldCat/FloatingOldCatArchive.jsx`: right-side saved Old Cat chat folder.
- `src/components/LinkVault/FloatingLinkVault.jsx`: right-side URL/prompt vault.
- `src/components/Cat/BlinkingClayMascot.jsx`: blinking clay Kivi/Old Cat mascot.
- `src/components/Cat/LayeredCat.jsx`: currently a stable Kivi image wrapper. Do not reintroduce visible appearance customization unless the product decision changes.
- `src/pages/Onboarding/Onboarding.jsx`: current onboarding flow and Old Cat style selection.
- `src/pages/Home/Home.jsx`: home dashboard, growth map, 9-step guided tour, auto-scroll and paw-pointer logic.
- `src/pages/Interview/Interview.jsx`: mock interview flow, adaptive follow-up logic, interview records.
- `src/pages/Classroom/Classroom.jsx`: concept-learning page for AI basics, PM basics, and AI product basics.
- `src/pages/Workshop/Workshop.jsx`: product-development process training page from idea to MVP/metrics/risks.
- `src/pages/Settings/Settings.jsx`: settings page; Old Cat style options should match onboarding. AI chat API and speech transcription API are intentionally configured separately.
- `src/pages/Shop/Shop.jsx` and `src/pages/Wardrobe/Wardrobe.jsx`: fish shop and wardrobe handling.
- `src/data/shopItems.js`: shop item definitions; terminal may show Chinese/emoji as mojibake.
- `src/data/newsSources.js`: trusted AI news sources used by the news page and source-introduction card.
- `src/data/classroomLessons.js`: 小猫课堂 lesson paths and lesson copy. Current content has 5 learning paths and 25 lessons, each with professional definition, plain-language explanation, real scenario, common mistake, small exercise, mentor tip, key points, and takeaway.
- `src/data/workshopIdeas.js`: 造物工坊 fixed idea prompts and product-flow step definitions. Current content has 20 fixed product ideas across learning, job search, B-side efficiency, lifestyle, knowledge management, community, and product work.
- `src/index.css`: custom visual styling, including clay dashboard, onboarding, guided tour, paw pointer, dark mode, hover states, and growth map styles.
- `src/assets/mascots/`: clay mascot assets such as Kivi, Old Cat, breakthrough cat.
- `src/assets/ui-clay/`: clay UI icons.
- `src/assets/interviewers/`: clay interviewer cat PNGs.
- `src/assets/cat-stages/`: six transparent growth-stage cat images used by the growth route.
- `archive_cleanup/`: local-only temporary cleanup archive. It is ignored by Git and contains moved legacy/generated files until the user confirms permanent deletion.

## Design And Product Decisions

- Keep the visual direction clay-style, soft, dimensional, warm, and cat-centered.
- Do not revert clay mascots to the old flat SVG cats.
- The product should feel like an actual learning app, not a marketing landing page.
- Because this may be linked from a resume, first-time user guidance matters.
- Current decision: temporarily do not support custom cat appearance.
- Kivi should be a stable clay cat across onboarding/home/shop/wardrobe for now.
- Remove/hide fur color, eye color, pattern, breed, and gender choices.
- Keep cat naming and Old Cat companion-style choice.
- Old Cat companion style is currently five options: strict mentor, interview coach, gentle encourager, senior PM, and tsundere/sharp critic.
- Growth route should still show six different growth-stage cats.
- Old Cat is a meaningful mentor interaction entry, not just decoration.
- Homepage guided tour should feel like an interactive product guide: highlight what matters, allow the highlighted area to be clicked, auto-scroll to the target, and avoid blocking the area being introduced.
- User dislikes the current text label on/near the cat and the current CSS paw pointer. The next design should use a cleaner clay-style pointer that glides like a mouse cursor from one target to the next.
- Dark mode should be a true night mode, not a weak dimmed light mode: neutral dark grays, readable text, low saturation, and only small warm accents.
- News summaries should stay short, useful, and PREP-structured.
- News content should come from the fixed AI source whitelist where possible: OpenAI, Anthropic, Google DeepMind, Meta AI, Microsoft AI, MIT Technology Review, The Verge, TechCrunch, VentureBeat, and Ars Technica. Do not return to old year-based mock news or `example.com` links.
- GPT handoff is intended behavior: copy prompt/open GPT actions should remain.
- API keys are user-provided in settings/localStorage. Do not commit or hardcode private keys.
- Reward economy should remain slow enough for long-term use.
- 小猫课堂 is for input/learning before practice; lessons should stay beginner-friendly but must feel useful enough to study, with definitions, plain explanations, scenarios, mistakes, exercises, and mentor guidance.
- 造物工坊 is for process practice from idea to product flow; it should complement daily tasks, not replace them. Daily tasks are small work simulations, while the workshop trains the full 0-to-1 product development order. Fixed random draw should skip completed fixed ideas, and AI impromptu ideas should be separate from the fixed 20题 pool.

## Known Issues

- No automated tests are configured.
- The app is frontend-only; all progress/settings live in browser `localStorage`.
- OpenAI API calls are made directly from the browser. This is acceptable for a personal demo with user-entered keys, but not secure for shared production secrets.
- Existing users may have old `miaotu_store` schemas with previous appearance fields. The current UI ignores them; clearing `miaotu_store` can help if state looks strange.
- PowerShell may display Chinese/emoji source text as mojibake. Use `Get-Content -Encoding UTF8` or verify in browser/editor.
- `src/data/shopItems.js` may display mojibake in terminal. Be careful when editing text there.
- A generated-image attempt for the paw pointer failed and produced an irrelevant tutorial screenshot. Do not use that generated output.
- Homepage guided tour still needs mobile QA for spotlight alignment and card placement.
- Mobile layout now has a more app-like pass: compact homepage hero/cat card, hidden side floating folder peeks, and a fixed bottom navigation. It still needs real-device QA after future content changes.
- Dark mode still needs browser QA across pages; some pages may still have low contrast or inconsistent card colors.
- Stage PNGs and interviewer PNGs still add build weight. Vite build warns that the main JS chunk is larger than 500 kB.
- Non-transparent legacy stage PNGs and paused cat-customizer assets were moved to `archive_cleanup/` during cleanup; restore from there if the paused customization direction is revived.
- Shop/wardrobe economy exists, but because appearance customization is paused, wearable overlay behavior should not be emphasized until a stable design is chosen.
- Previously attempted layered cat appearance caused severe alignment problems. Do not restart that path casually.
- Task page should still be QA-tested for the reported issue where the second task answer box can become unresponsive after submitting one task.
- Training lock/unlock behavior should be QA-tested against the intended rule: same question type low score three times locks it, lists the three causing questions, and unlocks only after a five-question breakthrough drill with each answer above 80.
- 小猫课堂 and 造物工坊 have expanded content, but still need browser visual QA and mobile adaptation.

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

1. Continue mobile browser QA for the 10-step homepage guided tour from a clean `localStorage` state.
2. QA the settings API Key step again after any future settings layout changes.
3. QA Old Cat, link vault, and saved Old Cat chat panels after any future overlay or z-index changes.
4. Browser QA the simplified onboarding flow from a clean `localStorage` state.
5. Continue dark-mode QA and adjust any remaining unreadable or inconsistent pages.
6. Continue asset optimization later: interviewer PNGs, stage PNGs, and route-level code splitting.
7. QA the task page second-input issue and training lock/unlock rules.

## Recent Changes

- Simplified onboarding to remove visual cat customization.
- Added Old Cat companion-style selection to onboarding and saved it to settings; settings now uses the same five options.
- Changed default `catConfig` to only keep `name` and `focus`.
- Simplified `LayeredCat.jsx` back to a stable Kivi clay image wrapper.
- Restored growth map previews to six fixed transparent stage-cat PNGs instead of the failed layered preview approach.
- Updated settings so the cat section only edits the cat name and no longer exposes appearance fields.
- Improved the homepage guided tour from 6 broad steps to 9 more specific steps, including separate introductions for the four learning entrances.
- Added guided-tour auto-scroll to the active target and kept highlighted targets clickable.
- Added a CSS-drawn paw pointer for the guided tour, but the current visual is not acceptable and should be replaced next.
- Removed the text cue near the homepage cat after the user found it visually awkward.
- Lifted Old Cat/link vault/saved-chat panels above the tutorial overlay when relevant.
- Revised dark mode toward neutral gray and improved text contrast across home, growth route, breakthrough, and interview-related views.
- Updated mock interview logic to generate adaptive follow-up questions based on transcript and answer quality.
- Verified production builds after recent code changes with the bundled Node/Vite command.
- Latest pushed commits include `fb3d145 Add guided tour paw pointer`, `bd75dda Improve home tour guidance`, `baf0f0e Refine neutral dark mode`, and `4ad05f5 Add adaptive interview followups`.
- Replaced the homepage guided-tour paw with a Framer Motion-driven clay cat-paw cursor that glides between target coordinates, added right-edge-aware positioning for the floating-folder step, and fixed the React warning caused by writing store state inside the local tour-index updater.
- Browser QA after the pointer update: clean onboarding-to-home path on desktop, homepage tour steps 1/5/9 captured, and console showed 0 errors after the updater fix. Existing React Router future-flag warnings remain.
- Updated the homepage tour interaction model so selected steps have two phases: first highlight the clickable entry, then after the user clicks it, highlight the opened detail area. Implemented this for the hero cat/growth map, Mentor Cat panel, and right-side link vault panel. The paw prompt is now a normal clay paw without a cursor tip.
- Added API Key setup as step 2 of the first-time guide: Home highlights the top-right settings gear, Settings highlights the OpenAI API Key field, and users can return home to continue the guide. News, tasks, training, and interview tour steps now support click-through page guides that highlight the core page area before returning home to continue.
- Removed the module-page tour overlays for News, Tasks, Training, and Interview so those pages open normally during the guide; clicking the highlighted home module now advances the guide state before navigation.
- Limited the "先跳过" action to the API Key setup step, retargeted tour paws to the kitten image, breakthrough card, and lower saved-chat folder, and made the Old Cat panel close on outside click, route changes, and tour-step changes.
- Browser QA after this refinement: build passed; Playwright verified module pages have no guide overlay/skip button, paw targets align on desktop, and Old Cat closes on outside click plus route change. Existing React Router future-flag warnings remain.

- Refined the growth-map tour detail state so opening the map only keeps the map highlighted against the dimmed page, with no explanatory tour card or paw pointer; returning from the map advances the tour.
- Made the link vault and saved Old Cat chat archive close naturally like the Old Cat panel: outside click, route change, repeated launcher click, and tour-step close events all collapse them.
- Browser QA after the natural-close update: build passed; Playwright verified map-only highlight, map return advancing the tour, and both floating panels closing on outside click plus route changes. Existing React Router future-flag warnings remain.
- Increased guided-tour paw contrast with stronger outlines, darker pads, and layered shadow so it stays visible on warm light cards.
- Replaced the growth-map detail highlight with a softer spotlight-only class instead of the generic tutorial frame, added route-return tour-index syncing plus repeated delayed scrolling, and inserted a dedicated Kitten Corner/treehole step after Mentor Cat closes.
- Browser QA after this polish: build passed; Playwright verified map spotlight-only mode, route-return auto-scroll from News to Tasks, Old Cat closing before the treehole step, and the paw landing on the treehole heart. Existing React Router future-flag warnings remain.
- Simplified the growth-map detail highlight further: the map panel is only lifted above the dim layer with no extra frame, glow, or shadow. Homepage internal tour exits now advance immediately for wardrobe/shop/archive links in the cat card and the breakthrough card, and closing Mentor Cat advances to the treehole step.
- Browser QA after this step-advance fix: build passed; Playwright verified plain-lit map styling, cat-to-wardrobe advancing to Mentor Cat, breakthrough advancing to the next step, and Mentor Cat outside-close advancing to the treehole highlight. Existing React Router future-flag warnings remain.
- Project cleanup pass moved generated artifacts and unused legacy assets/components into ignored `archive_cleanup/`: historical `output/` screenshots, old `dist/` builds, `.miaotu-server.pid`, paused `src/assets/cat-customizer/`, non-transparent stage PNGs, and unused SVG/stage components (`CatSVG.jsx`, `OldCatSVG.jsx`, `CatStageImage.jsx`). Build still passes after cleanup; the verification build output was also archived as `archive_cleanup/dist_after_build_check/`.
- Replaced the news page's old fallback mock news with a trusted-source RSS flow and source guide fallback. The right-side news card now explains sources instead of reading method. Link vault saves are deduped, news save buttons show saved state, and the floating link vault panel is constrained to the viewport with safer text wrapping.
- Added 小猫课堂 and 造物工坊 as two new homepage learning entrances. 小猫课堂 introduces short AI/PM foundation lessons and records completed lessons into the growth archive. 造物工坊 gives product ideas, asks the user to write the full product development flow, provides AI or local fallback feedback, and saves sessions into the growth archive. Build passed after adding both routes.
- Fixed repeat onboarding: direct visits or reloads on `/onboarding` now redirect completed users back to `/`, and persisted store migration marks existing users with cat setup/progress/rewards as `onboardingDone` so old local data does not get forced through onboarding again.
- Expanded 造物工坊 from 4 to 20 fixed product ideas and added a random fixed-topic entry. Expanded 小猫课堂 from 3 paths/9 lessons to 5 paths/25 lessons, adding product development flow and AI PM work-method paths. Build passed after expansion.
- Refined 造物工坊 random logic: random fixed-topic draw now skips fixed ideas that already have saved sessions, completed fixed ideas show an "已练习" badge, and a separate "老猫即兴出题" option uses the user's API Key to generate a fresh non-fixed practice idea.
- Reworked 小猫课堂 lesson presentation into a deeper learning template: professional definition, plain-language explanation, key points, real scenario, common mistake, small exercise, mentor tip, and takeaway. Added matching data fields for all 25 lessons. Build passed after this update.
- Added a shared voice-to-text button powered first by browser Web Speech API, with a new optional backend transcription path. Settings now lets users choose auto/browser/backend voice mode, and stores a separate speech transcription API key, endpoint, provider, and model from the OpenAI key used for Old Cat, feedback, and generation.
- Added `api/transcribe.js` for Vercel backend transcription. Custom provider mode expects a JSON endpoint that accepts `{ audioBase64, mimeType, language, model }` and returns `text`/`transcript`; OpenAI provider mode posts multipart audio to the OpenAI transcription endpoint with default model `whisper-1`.
- Added a stronger mobile responsive pass for the main app shell: fixed bottom navigation, hidden right-side floating folder peeks on small screens, compact homepage hero and cat stage card, and safer mobile positioning for voice-input hints. Production build passed after the update; the known 500 kB chunk warning remains.
- Centralized the Cat Growth reward economy in `src/config/growthRules.js` and updated all reward entry points to use it: classroom, news, tasks, thinking training, mock interview, workshop, breakthrough, Old Cat, level calculation, and streak rewards.

## Notes For Next Codex

- Start by reading this file, then inspect `src/pages/Home/Home.jsx`, `src/index.css`, `src/components/OldCat/OldCat.jsx`, `src/components/LinkVault/FloatingLinkVault.jsx`, and `src/components/OldCat/FloatingOldCatArchive.jsx`.
- Use `Get-Content -Encoding UTF8` when reading Chinese text in PowerShell.
- Use `git grep` or `Select-String` to check for remaining user-facing appearance options before touching cat customization UI.
- Do not revive the layered cat customization work unless the user explicitly asks; it caused visible misalignment and the product decision is now to pause it.
- For the paw pointer, prefer a code-native CSS/SVG implementation over generated bitmap output. The user wants a polished clay-like pointer and smooth target-to-target motion.
- If testing locally in Codex desktop, Vite dev server may need the bundled Node command. If sandbox blocks esbuild child process spawning, request escalation rather than working around it.
- After code changes, run the bundled build command shown above.
