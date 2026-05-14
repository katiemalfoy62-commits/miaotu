# Project Context

## Project Path

Absolute path: `D:\claudecode\miaotu`

GitHub repository: `https://github.com/katiemalfoy62-commits/miaotu.git`

Vercel production URL: `https://miaotu-pi.vercel.app`

Current branch: `master`

## What This Is

Miaotu is a gamified AI product manager learning companion for a student or early-career product manager. It helps the user build AI PM habits through daily AI news reading, commissioned practice tasks, structured thinking drills, mock interviews, targeted breakthrough drills, growth records, and a mentor-cat companion.

The intended experience is cute, warm, and resume-demo-friendly, but still functional: a clay-style cat learning dashboard, not a generic productivity app or marketing landing page.

## Tech Stack

- Frontend: React 18 + Vite
- Language: JavaScript / JSX
- Package manager: npm
- Routing: `react-router-dom`
- State: Zustand with `persist`, stored in browser `localStorage` under `miaotu_store`
- UI/animation helpers: `framer-motion`, `lucide-react`, `clsx`
- Charts: `recharts`
- Styling: Tailwind CSS plus the large custom stylesheet in `src/index.css`
- AI helper: browser-side OpenAI Chat Completions helper in `src/utils/claude.js`; the exported name `callClaude` is kept for compatibility
- Deployment: GitHub repo imported into Vercel, with SPA fallback rewrite in `vercel.json`

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

There are Windows helper scripts in the project root:

- `start-miaotu.ps1`
- `start-miaotu-hidden.vbs`
- `stop-miaotu.ps1`

In the Codex desktop environment, Node may not be on `PATH`. The latest verified build command used the bundled runtime:

```powershell
& 'C:\Users\11512\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' 'node_modules\vite\bin\vite.js' build
```

Tests: no automated test script is configured yet.

## Current Status

The app is a working Vite React single-page app and is deployed on Vercel. Main routes include:

- `/onboarding`: first-time intro and cat setup
- `/`: clay-style home dashboard
- `/news`: AI news reading and PREP-style summaries
- `/tasks`: daily commissioned tasks
- `/training`: structured thinking drills
- `/breakthrough`: targeted five-question drill
- `/interview` and `/interview/session`: mock interview setup/session/report
- `/archive`, `/archive/wrongbook`, `/archive/diary`, `/archive/interviews`: growth archive areas
- `/shop` and `/wardrobe`: fish reward shop and outfit flow
- `/settings`: API key, model mode, theme, mentor-cat personality, voice setting
- `/collection`: saved question collection
- `/trehole`: cat treehole chat

Completed and currently visible product areas:

- Clay-style home dashboard with large hero card, daily learning entry cards, right-side task/progress widgets, floating tools, and cat visuals.
- Old Cat mentor panel with OpenAI-backed chat, fullscreen mode, GPT handoff buttons, conversation save, and saved conversation archive.
- Floating link vault for saving article URLs and copying GPT prompts.
- News page with PREP summaries, source-link actions, GPT prompt copy, and link vault saving.
- Tasks page with active/completed tasks, answer submission, scoring, and record writing.
- Training page with first/second answer flow, scoring, wrong book, lock state, and breakthrough connection.
- Breakthrough page where the user inputs a hard prompt and practices five same-type questions.
- Mock interview setup/session/report with interviewer selection, timed questions, voice input when browser speech recognition is available, GPT copy/open actions, and interview record storage.
- Archive pages for learning records, wrong book, diary, and interview records.
- Shop/wardrobe economy and item data exist, but visual equipment overlays are not fully wired yet.
- Homepage "爆破猫咪" card now has hover/focus lift, shadow, and mascot motion.
- Onboarding now uses clay-style mascot visuals instead of the old flat SVG cats.
- Onboarding copy was refreshed to describe the current modules: AI news, tasks, thinking training, breakthrough, interview simulation, growth archive, and mentor cat.
- Onboarding breed selection was removed because breed did not visually change the cat and was not meaningful.
- Growth map station cards now preview different transparent cat-stage images on hover/focus/click.
- A reusable layered cat renderer is implemented. It composes base, fur, eyes, pattern, gender bow, growth-stage overlay, and equipped wearables.
- Onboarding cat setup now has instant visual preview for fur color, eye color, pattern, and gender. Male cats do not show the fixed bow; female cats do.
- The homepage hero, cat card, growth map previews, shop preview, and wardrobe preview now use the saved layered cat appearance.
- A first-pass homepage guided tour is implemented: after onboarding, the homepage is dimmed and key areas are highlighted one by one with Old Cat guidance. It can be skipped and replayed from the home module area.
- Large legacy PNG assets were converted to WebP, old unused source sheets were removed, and the generated customizer layers were converted/kept as WebP where possible.

## Important Files

- `PROJECT_CONTEXT.md`: this handoff file. Keep it as the single source of context for the next Codex conversation.
- `package.json`: scripts and dependencies.
- `vite.config.js`: Vite React config.
- `vercel.json`: SPA rewrite so direct route refreshes work on Vercel.
- `src/main.jsx`: React entry point.
- `src/App.jsx`: route wiring.
- `src/store/useStore.js`: central persisted Zustand state, reward economy, learning records, link vault, breakthrough sessions, old-cat chats, shop/wardrobe state.
- `src/utils/claude.js`: OpenAI API helper and prompt helpers.
- `src/utils/gptPrompt.js`: GPT handoff prompt utilities.
- `src/utils/levelCalc.js`: level/growth calculation utilities.
- `src/components/Layout/Layout.jsx`: app shell, navbar/back behavior, floating tools, Old Cat visibility.
- `src/components/OldCat/OldCat.jsx`: Old Cat mentor chat panel.
- `src/components/OldCat/FloatingOldCatArchive.jsx`: saved Old Cat conversation library.
- `src/components/LinkVault/FloatingLinkVault.jsx`: floating URL/prompt vault.
- `src/components/Cat/BlinkingClayMascot.jsx`: blinking clay Kivi/Old Cat mascot component currently used in several screens.
- `src/components/Cat/LayeredCat.jsx`: layered cat renderer for customizable cat appearance and wearable overlays.
- `src/components/Cat/ClayMascot.jsx`, `src/components/Cat/CatStageImage.jsx`: existing cat image helpers.
- `src/pages/Onboarding/Onboarding.jsx`: onboarding intro, module copy, and cat setup form.
- `src/pages/Home/Home.jsx`: home dashboard and growth map station preview behavior.
- `src/pages/News/News.jsx`: news generation, PREP display, URL validation, source-link actions.
- `src/pages/Tasks/Tasks.jsx`: commissioned task flow.
- `src/pages/Training/Training.jsx`: thinking drill flow and training lock behavior.
- `src/pages/Breakthrough/Breakthrough.jsx`: targeted five-question breakthrough practice.
- `src/pages/Interview/Interview.jsx`: interview setup, session, timing, scoring, and report.
- `src/pages/Archive/Archive.jsx`, `src/pages/Archive/WrongBook.jsx`, `src/pages/Archive/Diary.jsx`, `src/pages/Archive/InterviewRecords.jsx`: growth archive pages.
- `src/pages/Shop/Shop.jsx` and `src/pages/Wardrobe/Wardrobe.jsx`: fish shop and wardrobe handling.
- `src/data/shopItems.js`: shop item definitions; terminal may show Chinese/emoji as mojibake.
- `src/index.css`: most custom visual styling, including clay dashboard, onboarding, hover states, and growth map preview styles.
- `src/assets/mascots/`: deployed clay mascot PNGs such as Kivi, Old Cat, breakthrough cat.
- `src/assets/ui-clay/`: clay UI icons for modules and archive states.
- `src/assets/interviewers/`: clay interviewer cat assets.
- `src/assets/cat-stages/`: six growth-stage cat images plus transparent versions used for hover previews.
- `src/assets/cat-customizer/`: layered cat WebP assets used by `LayeredCat.jsx`, including fur, eyes, patterns, stage overlays, and aligned wearables.

## Design And Product Decisions

- Keep the visual direction clay-style, soft, dimensional, warm, and cat-centered.
- Do not revert clay mascots back to the earlier flat SVG cartoon cats.
- The product should feel like an actual learning app, not a landing page.
- The site may be linked on a resume, so first-time user guidance matters. A proper guided tour is desired because onboarding copy alone does not teach where everything is.
- Onboarding intro copy can mostly be kept, but it should eventually lead into a guided homepage tour.
- The homepage guided tour concept is: after onboarding, the homepage starts dimmed/gray, then one module at a time lights up with Old Cat explaining what it does and where to click.
- Old Cat is a meaningful mentor interaction entry, not just decoration.
- On non-home pages, keep clear back navigation.
- News summaries should stay short, useful, and PREP-structured.
- GPT handoff is an intended product behavior: copy prompt/open GPT actions should remain.
- API keys are user-provided in settings/localStorage. Do not commit or hardcode private keys.
- Growth archive should preserve enough detail for review: question, user answer, score, feedback, and reference answer where possible.
- Interview feedback should emphasize expression ability and thinking structure.
- Reward economy should remain slow enough for long-term use.
- Cat customization direction is layered assets, not generating a separate full cat image for every option combination.
- For future cat customization: male should have no bow; female should show the bow. Fur color, eye color, pattern, stage, and shop wearables should be layered.
- Future growth-stage cats should partially inherit the user's chosen base appearance.
- Different screen sizes should show cat layers and wardrobe overlays with stable sizing, not shifting/cropping unpredictably.

## Known Issues

- No automated tests are configured.
- The app is frontend-only; all progress/settings live in browser `localStorage`.
- OpenAI API calls are made directly from the browser. This is acceptable for a personal demo with user-entered keys, but not secure for shared production secrets.
- Existing users may have old `miaotu_store` schemas. Some guards exist, but migrations are incomplete. If state looks strange, test after clearing `miaotu_store`.
- PowerShell may display Chinese and emoji source text as mojibake even when the app renders correctly. Verify copy in browser/editor instead of trusting terminal output.
- Some source files, especially `src/data/shopItems.js`, display mojibake in terminal. Be careful when editing text there.
- Large PNG assets still increase build size. Previously important large files included `icon-oldcat-memory.png`, `icon-interview-record.png`, `breakthrough-cat.png`, `kivi-clay.png`, and `oldcat-clay.png`.
- Generated layered assets are wired into code now, but some overlays still need visual tuning, especially patterns, hats, and a few props.
- The user also noticed that cat "breed" was meaningless; breed selection has been removed from onboarding.
- Shop/wardrobe now render equipped accessories as overlays, but overlay alignment is a first pass and should be visually QA-tested.
- Homepage growth-stage hover previews now use the layered cat, so they inherit user-selected fur/eyes/pattern. Stage overlays are still approximate.
- Homepage guided tour is implemented as a first pass, but it needs browser QA and copy/position tuning.
- Asset optimization is improved substantially by WebP conversion, but interviewers are still PNG and the JS bundle remains large. Future code splitting may be useful.
- Task page should still be QA-tested for the reported issue where the second task answer box can become unresponsive after submitting one task.
- Training lock/unlock behavior should be QA-tested against the intended rule: same question type low score three times locks it, lists the three causing questions, and unlocks only after a five-question breakthrough drill with each answer above 80.
- Interview records created before the detailed record feature may only show summary data; old per-question answers cannot be reconstructed.

## Next Tasks

1. Visually QA the layered cat flow in a browser.
   - Onboarding should update fur, eyes, pattern, and gender immediately.
   - Homepage, growth map, shop, and wardrobe should all use the saved appearance.
   - Wearable alignment should be checked item by item.
2. Tune the first-pass homepage guided tour.
   - Check mobile and desktop spotlight positions.
   - Improve copy if the flow feels too long or too terse.
   - Consider adding replay in settings as well as home.
3. Continue asset optimization.
   - Interviewer assets are still PNG.
   - Consider route-level code splitting because the built JS bundle still triggers Vite's 500 kB warning.
4. QA the task page second-input issue and training lock/unlock rules.
5. Add a small smoke-test checklist or minimal automated checks for core routes.

## Recent Changes

Recent committed changes:

- Added `vercel.json` SPA rewrite for Vercel deployment.
- Pushed the repo to GitHub at `https://github.com/katiemalfoy62-commits/miaotu.git`.
- Deployed the site to Vercel at `https://miaotu-pi.vercel.app`.
- Added hover/focus feedback to the homepage "爆破猫咪" card and its mascot image.
- Replaced onboarding flat SVG cat usage with blinking clay mascot visuals.
- Generated transparent versions of the six cat growth-stage images.
- Updated the growth map so station cards preview stage cats on hover/focus/click.
- Refreshed onboarding copy to match the current product modules.
- Removed the onboarding breed option because it had no meaningful visual effect.
- Cleaned several temporary incoming/source asset files that were no longer needed.
- Verified the Vite build after the recent committed changes.

Recent working-tree changes not yet committed at this handoff:

- Added `src/components/Cat/LayeredCat.jsx`.
- Added and wired WebP layered cat assets under `src/assets/cat-customizer/`.
- Updated onboarding, home, shop, wardrobe, store defaults, and CSS for layered cats.
- Added first-pass homepage guided tour state and UI.
- Converted large mascot/UI PNGs to WebP and updated imports.
- Removed unused large PNG sheets and replaced old mascot/UI PNG imports with WebP.
- Removed unused standalone `src/assets/wearables/` draft directory.
- Verified `vite build` succeeds after these changes.

## Notes For Next Codex

- Start by reading this file, then inspect `git status --short` before editing.
- Useful first files to read for the next implementation:
  - `src/pages/Onboarding/Onboarding.jsx`
  - `src/pages/Home/Home.jsx`
  - `src/pages/Shop/Shop.jsx`
  - `src/pages/Wardrobe/Wardrobe.jsx`
  - `src/store/useStore.js`
  - `src/data/shopItems.js`
  - `src/index.css`
- The next likely task is visual QA and alignment tuning for `LayeredCat.jsx`, not another asset generation pass.
- Preview-only cat customizer PNG files were removed; actual used layers are WebP.
- The standalone `src/assets/wearables/` draft directory was removed because aligned wearables are now under `src/assets/cat-customizer/wearables-aligned/`.
- Use `apply_patch` for manual edits.
- Do not revert user changes or delete generated assets without confirming.
- If building in Codex desktop and `npm run build` cannot find Node, use the bundled Node command listed above.
- If Chinese text looks broken in PowerShell, do not assume the browser output is broken. Check source in an editor or verify through the app.
- If Vercel needs an update after changes, commit and push to `master`; Vercel should redeploy from GitHub.
- `LayeredCat.jsx` has fallback defaults for old persisted users: color `gray`, eye color `yellow`, pattern `none`, gender `female`, and no equipped items.
- The old color/eye customization bug should now be fixed in the wired screens, but it still needs browser verification.
