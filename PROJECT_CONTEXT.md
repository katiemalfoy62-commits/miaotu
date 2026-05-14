# Project Context

## Project Path

Absolute path: `D:\claudecode\miaotu`

GitHub repository: `https://github.com/katiemalfoy62-commits/miaotu.git`

Vercel production URL: `https://miaotu-pi.vercel.app`

Current branch: `master`

## What This Is

Miaotu is a gamified AI product manager learning companion for a student or early-career PM. It helps users build AI PM habits through AI news reading, daily practice tasks, structured thinking drills, mock interviews, targeted breakthrough drills, growth records, and an Old Cat mentor.

The app is meant to be cute, warm, and resume-demo-friendly, while still feeling like a real learning product rather than a landing page.

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
- `/breakthrough`: targeted five-question drill
- `/interview` and `/interview/session`: mock interview setup/session/report
- `/archive`, `/archive/wrongbook`, `/archive/diary`, `/archive/interviews`: growth archive areas
- `/shop` and `/wardrobe`: fish reward shop and outfit flow
- `/settings`: API key, model mode, theme, cat name, Old Cat personality, voice setting
- `/collection`: saved question collection
- `/trehole`: cat treehole chat

Current product state:

- Homepage uses a stable clay Kivi cat for the main companion visuals.
- Growth route keeps six separate transparent stage-cat images for hover/focus/click previews.
- Onboarding no longer has fur color, eye color, pattern, breed, or gender customization.
- Onboarding flow is now: Old Cat introduces the site, introduces core modules, explains rewards/growth stages, asks for cat name and Old Cat companion style, then enters homepage.
- Settings only allows editing the cat name; visual appearance customization is intentionally hidden for now.
- Homepage guided tour dims the screen and highlights key areas with Old Cat guidance. It is a first pass and should still be visually QA-tested.
- Large legacy mascot PNGs were partly optimized to WebP. Interviewer PNGs and six stage PNGs are still relatively large.

## Important Files

- `PROJECT_CONTEXT.md`: this handoff file. Keep it as the single source of context for the next Codex conversation.
- `package.json`: scripts and dependencies.
- `vite.config.js`: Vite React config.
- `vercel.json`: SPA rewrite for direct route refresh on Vercel.
- `src/main.jsx`: React entry point.
- `src/App.jsx`: route wiring.
- `src/store/useStore.js`: central persisted Zustand state, rewards, records, Old Cat chats, shop/wardrobe state, onboarding flags.
- `src/utils/claude.js`: OpenAI API helper and prompt helpers.
- `src/utils/gptPrompt.js`: GPT handoff prompt utilities.
- `src/utils/levelCalc.js`: level/growth calculation utilities.
- `src/components/Layout/Layout.jsx`: app shell, navbar/back behavior, floating tools, Old Cat visibility.
- `src/components/OldCat/OldCat.jsx`: Old Cat mentor chat panel.
- `src/components/LinkVault/FloatingLinkVault.jsx`: floating URL/prompt vault.
- `src/components/Cat/BlinkingClayMascot.jsx`: blinking clay Kivi/Old Cat mascot.
- `src/components/Cat/LayeredCat.jsx`: currently a stable Kivi image wrapper. Do not reintroduce visible appearance customization unless the product decision changes.
- `src/components/Cat/CatStageImage.jsx`: existing stage helper.
- `src/pages/Onboarding/Onboarding.jsx`: current onboarding flow and Old Cat style selection.
- `src/pages/Home/Home.jsx`: home dashboard, growth map, and guided tour.
- `src/pages/Settings/Settings.jsx`: settings page; cat section is now name-only.
- `src/pages/Shop/Shop.jsx` and `src/pages/Wardrobe/Wardrobe.jsx`: fish shop and wardrobe handling.
- `src/data/shopItems.js`: shop item definitions; terminal may show Chinese/emoji as mojibake.
- `src/index.css`: custom visual styling, including clay dashboard, onboarding, guided tour, hover states, and growth map styles.
- `src/assets/mascots/`: clay mascot assets such as Kivi, Old Cat, breakthrough cat.
- `src/assets/ui-clay/`: clay UI icons.
- `src/assets/interviewers/`: clay interviewer cat PNGs.
- `src/assets/cat-stages/`: six growth-stage cat images and transparent versions used by the growth route.

## Design And Product Decisions

- Keep the visual direction clay-style, soft, dimensional, warm, and cat-centered.
- Do not revert clay mascots to the old flat SVG cats.
- The product should feel like an actual learning app, not a marketing landing page.
- Because this may be linked from a resume, first-time user guidance matters.
- Current decision: temporarily do not support custom cat appearance.
- Kivi should be a stable clay cat across onboarding/home/shop/wardrobe for now.
- Remove/hide fur color, eye color, pattern, breed, and gender choices.
- Keep cat naming and Old Cat companion-style choice.
- Growth route should still show six different growth-stage cats.
- Old Cat is a meaningful mentor interaction entry, not just decoration.
- News summaries should stay short, useful, and PREP-structured.
- GPT handoff is intended behavior: copy prompt/open GPT actions should remain.
- API keys are user-provided in settings/localStorage. Do not commit or hardcode private keys.
- Reward economy should remain slow enough for long-term use.

## Known Issues

- No automated tests are configured.
- The app is frontend-only; all progress/settings live in browser `localStorage`.
- OpenAI API calls are made directly from the browser. This is acceptable for a personal demo with user-entered keys, but not secure for shared production secrets.
- Existing users may have old `miaotu_store` schemas with previous appearance fields. The current UI ignores them; clearing `miaotu_store` can help if state looks strange.
- PowerShell may display Chinese/emoji source text as mojibake. Use `Get-Content -Encoding UTF8` or verify in browser/editor.
- `src/data/shopItems.js` may display mojibake in terminal. Be careful when editing text there.
- Homepage guided tour is implemented but still needs browser QA for spotlight alignment and copy pacing.
- Stage PNGs and interviewer PNGs still add build weight. Vite build warns that the main JS chunk is larger than 500 kB.
- Shop/wardrobe economy exists, but because appearance customization is paused, wearable overlay behavior should not be emphasized until a stable design is chosen.
- Previously attempted layered cat appearance caused severe alignment problems. Do not restart that path casually.
- Task page should still be QA-tested for the reported issue where the second task answer box can become unresponsive after submitting one task.
- Training lock/unlock behavior should be QA-tested against the intended rule: same question type low score three times locks it, lists the three causing questions, and unlocks only after a five-question breakthrough drill with each answer above 80.

## Next Tasks

1. Browser QA the simplified onboarding flow from a clean `localStorage` state.
2. Browser QA homepage guided tour alignment on desktop and mobile.
3. Confirm growth route hover/focus/click previews show the six stage cats cleanly.
4. Push current changes and let Vercel redeploy.
5. Continue asset optimization later: interviewer PNGs, stage PNGs, and route-level code splitting.
6. QA the task page second-input issue and training lock/unlock rules.

## Recent Changes

- Simplified onboarding to remove visual cat customization.
- Added Old Cat companion-style selection to onboarding and saved it to settings.
- Changed default `catConfig` to only keep `name` and `focus`.
- Simplified `LayeredCat.jsx` back to a stable Kivi clay image wrapper.
- Restored growth map previews to six fixed transparent stage-cat PNGs instead of the failed layered preview approach.
- Updated settings so the cat section only edits the cat name and no longer exposes appearance fields.
- Verified production build with the bundled Node/Vite command.

## Notes For Next Codex

- Start by reading this file, then inspect `src/pages/Onboarding/Onboarding.jsx`, `src/pages/Home/Home.jsx`, `src/components/Cat/LayeredCat.jsx`, `src/pages/Settings/Settings.jsx`, and `src/store/useStore.js`.
- Use `Get-Content -Encoding UTF8` when reading Chinese text in PowerShell.
- Use `git grep` to check for remaining user-facing appearance options before touching UI.
- Do not revive the layered cat customization work unless the user explicitly asks; it caused visible misalignment and the product decision is now to pause it.
- After code changes, run the bundled build command shown above.
