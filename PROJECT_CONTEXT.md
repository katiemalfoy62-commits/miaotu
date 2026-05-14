# Project Context

## Project Path

Absolute path: `D:\claudecode\miaotu`

## What This Is

Miaotu is a gamified AI product manager learning companion. It is aimed at a student / early-career product manager who wants daily AI news reading, task practice, structured thinking drills, mock interviews, growth tracking, and a warm mentor-cat companion.

The product style is intentionally cute but functional: a clay-style cat learning dashboard, not a generic productivity app or landing page.

## Tech Stack

- Frontend: React 18 + Vite
- Language: JavaScript / JSX
- Routing: `react-router-dom`
- State: Zustand with `persist`, saved in browser `localStorage` under `miaotu_store`
- Animation/UI helpers: `framer-motion`, `lucide-react`, `clsx`
- Charts: `recharts`
- Styling: Tailwind CSS plus custom CSS in page/component files
- Package manager: npm
- AI API helper: browser-side OpenAI Chat Completions call in `src/utils/claude.js`; the exported name remains `callClaude` for compatibility with older code

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

There are also Windows helper scripts in the project root:

- `start-miaotu.ps1`
- `start-miaotu-hidden.vbs`
- `stop-miaotu.ps1`

In the Codex desktop environment, Node may not be on `PATH`. The build was verified with the bundled runtime:

```powershell
& 'C:\Users\11512\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' 'node_modules\vite\bin\vite.js' build
```

Tests: no automated test script is configured yet.

## Current Status

The app is a working local Vite React single-page app. It has these main routes:

- `/onboarding`: first-time cat setup
- `/`: home dashboard
- `/news`: AI news reading
- `/tasks`: daily commissioned tasks
- `/training`: structured thinking drills
- `/breakthrough`: targeted five-question drill, called "专项攻破"
- `/interview` and `/interview/session`: mock interview setup/session/report
- `/archive`, `/archive/wrongbook`, `/archive/diary`, `/archive/interviews`: growth archive, wrong book, diary, interview records
- `/shop` and `/wardrobe`: fish-dried reward shop and outfit/wardrobe flow
- `/settings`: API key, model mode, theme, old-cat personality, voice setting
- `/collection`: saved question collection
- `/trehole`: cat treehole chat

Implemented product areas:

- Clay-style home dashboard with daily cards, soft shadows, thick rounded panels, cat assets, and right-side progress widgets.
- Clay mascot assets for Kivi, Old Cat, interviewers, UI icons, learning records, breakthrough, and floating side tools.
- Old Cat mentor side panel with OpenAI-backed chat, fullscreen mode, GPT handoff buttons, conversation save, and saved conversation archive.
- Floating link vault for saving article URLs and copying GPT prompts without spending API tokens in the app.
- News page with PREP-style summaries, original-link actions, GPT prompt copy, and link vault saving.
- Tasks page with active/completed tasks, answer submission, scoring, and learning record writing.
- Training page with first/second answer flow, scoring, wrong book, lock state, and connection to targeted breakthrough drills.
- Breakthrough page where the user inputs a difficult prompt and practices five same-type questions.
- Mock interview setup/session/report with interviewer selection, timed questions, voice input support where browser speech recognition is available, GPT copy/open buttons, and interview record storage.
- Archive pages for learning records, wrong book, diary, and interview records.
- Fish shop/wardrobe with adjusted reward economy so progression is slower and shop cannot be cleared too quickly.

The local git repository is initialized and currently has the initial app committed. The current branch is `master`, and no GitHub remote is configured yet.

## Important Files

- `package.json`: scripts and dependencies.
- `vite.config.js`: Vite React config.
- `tailwind.config.js`: Tailwind config and design tokens.
- `index.html`: Vite HTML entry.
- `src/main.jsx`: React entry point.
- `src/App.jsx`: all route wiring.
- `src/store/useStore.js`: central Zustand persisted app state, reward economy, learning records, link vault, breakthrough sessions, old-cat saved chats.
- `src/utils/claude.js`: OpenAI API helper. Despite the filename and exported `callClaude` name, it calls OpenAI Chat Completions.
- `src/components/Layout/Layout.jsx`: app shell, navbar, back button behavior, floating tools, Old Cat visibility.
- `src/components/OldCat/OldCat.jsx`: Old Cat mentor chat panel and GPT handoff/save/fullscreen actions.
- `src/components/OldCat/FloatingOldCatArchive.jsx`: saved Old Cat conversation library.
- `src/components/LinkVault/FloatingLinkVault.jsx`: floating URL/prompt vault.
- `src/pages/Home/Home.jsx`: main dashboard layout and entry cards.
- `src/pages/News/News.jsx`: news generation, PREP display, URL validation, source-link actions.
- `src/pages/Tasks/Tasks.jsx`: commissioned task flow and completed-task review.
- `src/pages/Training/Training.jsx`: thinking drill flow and training lock behavior.
- `src/pages/Breakthrough/Breakthrough.jsx`: targeted five-question breakthrough practice.
- `src/pages/Interview/Interview.jsx`: interview setup, session, timing, scoring, and report.
- `src/pages/Archive/Archive.jsx`: growth archive overview.
- `src/pages/Archive/InterviewRecords.jsx`: saved mock interview records.
- `src/pages/Shop/Shop.jsx` and `src/pages/Wardrobe/Wardrobe.jsx`: fish shop and outfit handling.
- `src/pages/Settings/Settings.jsx`: user settings.
- `src/assets/mascots/`: Kivi, Old Cat, breakthrough cat.
- `src/assets/ui-clay/`: clay UI icons, including news/task/training/interview, archive, diary, interview record, old-cat memory.
- `src/assets/interviewers/`: clay interviewer cats.
- `src/assets/cat-stages/`: staged cat artwork.
- Some `_incoming_*` image files still exist under `src/assets/mascots/` and `src/assets/ui-clay/`; these are temporary source copies and should be cleaned up later if no longer needed.

## Design And Product Decisions

- Keep the visual direction clay-style, soft, dimensional, warm, and cat-related.
- Do not revert to the earlier flat SVG cartoon cats.
- Character assets should be independent transparent PNG/WebP-style assets, not cropped from one poster-like image.
- Old Cat is a meaningful interaction entry, not decoration. On home and most pages it should remain clickable and open the mentor chat.
- On non-home pages, keep a clear back button; the user disliked relying on browser URL navigation.
- News summaries should be short, useful, and structured with PREP:
  - P: clear point
  - R: reason
  - E: concrete example/detail
  - P: conclusion or AI PM takeaway
- News should prioritize reliable original article links. Do not point users to a generic company homepage when claiming it is the source.
- The old news "style selector" UI was intentionally removed because all modes converged on the same useful PREP structure.
- API keys are user-provided in settings/localStorage. Do not commit or hardcode a private API key.
- GPT handoff is part of the intended product: several pages include "copy prompt" and "open GPT" actions so the user can continue deeper discussion outside the app.
- Growth archive should be useful for review: completed tasks, training, interviews, and breakthrough sessions should save question, user answer, score, feedback, and reference answer where possible.
- Interview feedback should emphasize expression ability and thinking structure because these directly affect interview performance.
- Reward economy should be slow enough to support months of use. Fish and EXP should not make the user reach high level or buy the whole shop too quickly.

## Known Issues

- No automated tests are configured.
- The app is frontend-only. All user progress and settings are stored in browser localStorage.
- OpenAI API calls are made directly from the browser. This is acceptable for a personal demo with user-entered keys, but it is not a production-secure architecture for shared secrets.
- Existing users may have old localStorage schemas. Some guards exist, but migrations are incomplete. If odd UI state appears, test after clearing `miaotu_store`.
- PowerShell may display Chinese source text as mojibake. Do not rely on terminal-rendered Chinese when editing copy; verify in a UTF-8 editor/browser.
- Some Chinese strings in source may already appear mojibake in terminal output and should be cleaned carefully if touched.
- News source reliability is improved by filtering generic URLs, but the app still depends on model output and does not perform robust server-side article crawling.
- News helpers still contain internal `NEWS_STYLES` / `getNewsStylePrompt` in `src/utils/claude.js`, even though the settings UI for news style has been removed.
- Large image assets increase build size. Recent build warned about large chunks/assets, especially clay PNGs and the JS bundle.
- Temporary incoming image copies are still present:
  - `src/assets/mascots/_incoming_breakthrough.png`
  - `src/assets/ui-clay/_incoming_interview_record.png`
  - `src/assets/ui-clay/_incoming_oldcat_memory.png`
- Shop/wardrobe still may not fully render equipped accessories as real overlays on the cat preview.
- Task page should be QA-tested for the reported issue where the second task answer box can become unresponsive after submitting one task.
- Training lock/unlock behavior should be QA-tested against the intended rule: same question type low score three times locks it, lists the three causing questions, and unlocks only after a five-question breakthrough drill with each answer above 80.
- Interview records created before the detailed record feature may only show summary data; old per-question answers cannot be reconstructed retroactively.
- Vercel deployment is not finished yet. The local repo is ready, but remote GitHub push and Vercel import still need to happen.
- SPA deployment may need a `vercel.json` rewrite for deep links if direct route refreshes 404 after deployment.

## Next Tasks

1. Finish GitHub/Vercel deployment:
   - Create GitHub repo.
   - Add remote.
   - Current local branch is `master`; either push `master` or rename it to `main` before pushing.
   - Import repo in Vercel.
   - Verify homepage and deep routes.
2. Verify interview records with a brand-new mock interview:
   - Each question should save interviewer, question, user answer, evaluation intent, per-question score, feedback, and reference answer.
   - The interview records page should show those details.
3. QA the task page second-input bug after completing one task.
4. QA the training lock and breakthrough unlock flow against the exact product rule.
5. Optimize large PNG assets or convert selected assets to WebP.
6. Consider adding `vercel.json` for SPA fallback routing.
7. Clean or remove unused news-style code if the style selector is permanently removed.
8. Add minimal automated checks or at least a smoke-test checklist for core routes.
9. Improve source-link reliability for news, ideally with a backend/search layer later.
10. Improve shop/wardrobe accessory preview so purchased/equipped items visibly appear on the clay cat.

## Recent Changes

Recent actual changes in this project include:

- Initialized local git repository.
- Added `.gitignore` to keep `node_modules`, `dist`, `output`, `.claude`, environment files, logs, and local server PID files out of git.
- Committed the initial app state.
- Fixed a blank-screen crash on the interview page by importing `Link` in `src/pages/Interview/Interview.jsx` and guarding old persisted interview/saved-question data.
- Tightened news URL handling in `src/pages/News/News.jsx` with source-link validation so generic homepages/news/category/tag/search URLs are not treated as original articles.
- Replaced/confirmed user-provided clay assets for:
  - breakthrough cat
  - interview record icon
  - old-cat memory/archive icon
- Verified `vite build` succeeds after the recent code changes.
- Prepared for GitHub/Vercel deployment discussion, but no GitHub remote is configured and the repository has not yet been pushed from this machine.
- Added this `PROJECT_CONTEXT.md` handoff file after checking the current project structure.

## Notes For Next Codex

- Start by reading:
  - `src/App.jsx`
  - `src/store/useStore.js`
  - `src/components/Layout/Layout.jsx`
  - `src/components/OldCat/OldCat.jsx`
  - the page file relevant to the user request
- Run `git status --short` before editing. The user may have made manual changes.
- Check `git branch --show-current` before deployment commands. At the time of this handoff the branch is `master`, not `main`.
- Use `apply_patch` for manual edits.
- Do not fetch images from WeChat or temporary chat folders. The user explicitly said to ask for missing images instead. The current user-provided image folder is `C:\Users\11512\Desktop\猫咪图案`.
- Do not hardcode the user's OpenAI API key. Keep API key input user-controlled.
- If testing with Codex desktop and Node is not on PATH, use the bundled Node command shown in "How To Run".
- If the browser shows strange old data, remember persisted state comes from localStorage key `miaotu_store`.
- Be careful with Chinese text encoding. Terminal output may look broken even when the app renders correctly.
- The user cares strongly about visual polish, clay consistency, mentor usefulness, reliable news links, structured thinking, and interview review value. Avoid superficial UI-only fixes when the product behavior is what matters.
