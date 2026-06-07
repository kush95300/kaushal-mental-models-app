# Changelog

All notable changes to this project will be documented in this file.

## [v2.0.9] - 2026-06-07

### Added & Fixed

- **Docker Hub Registry Deployment**: Configured `docker-compose.yml` to pull and run the remote image `kaushal95300/kaushal-mental-models:latest` from the Docker Hub registry instead of building locally from folder contexts.
- **Docker Image Tagging and Pushing**: Packaged, tagged (`latest` and version `v1.2` labels), and pushed the Next.js production standalone image to the user's remote Docker Hub directory `kaushal95300`.
- **Database Backup Before Upgrade**: Added an automated database backup task before hot-recreation. The script now copies the active SQLite database file from the running container onto the local host (`dev_db_backup_before_update.db`) before pulling any new images, preventing any potential data loss.
- **Automated Makefile Target `app-update`**: Added `make app-update` to back up, pull, and hot-reload container instances in-place.

## [v2.0.8] - 2026-06-07

### Added & Fixed

- **Restructured Onboarding Guides**:
  - **Add Task Walkthrough**: Refactored to feature 3 steps: (1) quick-add task creation with title and finish time, (2) highlighting the Draft Queue Inbox to see where new tasks appear, and (3) dragging tasks to prioritize in the matrix.
  - **Add Delegate Walkthrough**: Refactored to feature 4 steps: (1) header button click to trigger the dialog, (2) highlighting the teammate name input inside the dialog, (3) typing a name and clicking "Add Team Member", and (4) returning to the grid for assignment.
- **Programmatic Dialog Synchronization**: Integrated an `onStepChange` callback into `PageTutorial.tsx` to automatically trigger dialog state changes. The delegates dialog now opens automatically during steps 2 and 3 of the delegate walkthrough and closes automatically when advancing or skipping, keeping highlights perfectly synced with the modal lifecycle.
- **Walkthrough DOM IDs**: Added `matrix-inbox-container` (Draft Queue Inbox), `input-delegate-name` (teammate name input), and `btn-add-delegate` (add button) selector identifiers to support focused walkthrough targeting.

## [v2.0.7] - 2026-06-07

### Added & Fixed

- **Viewport-Relative Fixed Overlays**: Refactored `PageTutorial.tsx` to position the highlight overlay masks, focus ring, and popover tooltip using `fixed` viewport-relative positioning. This prevents tooltips from being rendered off-screen (e.g., above or below the viewport) when coordinates are constrained.
- **Scroll Hijacking Resolution**: Split coordinate updates from step-advance animations. The walkthrough now only triggers a smooth `scrollIntoView` when the step changes (`currentStepIdx` changes). Routine page scrolling and resizing now only recalculate coordinates without resetting/locking the user's scroll position, allowing users to scroll naturally.
- **Interactive Sandbox Resources**: Programmed the walkthrough sub-guides to automatically initialize dummy resources when launched:
  - Starting the **How to Add a Task** guide automatically pre-fills the quick-add input fields with a sample objective ("Learn Eisenhower Matrix") and estimate ("45 min").
  - Starting the **How to Add a Delegate** guide automatically adds a draft task ("Double-click to delegate") to the grid if the task list is empty, and seeds a helper delegate team member ("Alex (Product Designer)") if only "Self" is present.
- **Vertical Page Scrolling**: Changed the main layout class on the Eisenhower Matrix page from `overflow-hidden` to `overflow-x-hidden` so that vertical page scrollbars function correctly on smaller screens.

## [v2.0.6] - 2026-06-07

### Fixed & Enhanced

- **Native Page Scrolling During Walkthroughs**: Resolved a bug where the absolute dim/blur overlays in `PageTutorial.tsx` blocked page scrolling and touch gestures, causing the screen to halt and preventing tooltips from being visible on tall screens. Configured `pointer-events-none` on the four overlay masks, which allows native scrolling, swipe gestures, and wheel events to pass through, keeping the walkthrough fully responsive while keeping targeted sections highlighted and sharp.
- **Accidental Dismissal Prevention**: Removed the backdrop click trigger for skipping tutorials, preventing accidental onboarding cancellations when users interact with scroll gestures.

## [v2.0.5] - 2026-06-07

### Added & Fixed

- **Manual Watch Tour Auto-Chain Bug Fix**: Resolved a bug where manually launching the Video Tour from the Eisenhower page header button would automatically trigger the Page Onboarding Tutorial focus walkthrough upon closing. Introduced an `isManualTour` state flag to bypass auto-chaining on manual requests.
- **Walkthrough Completion Dialog**: Programmed a beautiful, glassmorphic "Walkthrough Completed" dialog modal to appear when the Page Onboarding Tutorial is completed (by clicking "Finish" on the last step).
- **Interactive Onboarding Sub-Guides**: Integrated direct guides within the completion modal, allowing users to instantly select and play targeted mini-walkthroughs for:
  - **How to Add a Task**: starts a focused quick-add task walkthrough.
  - **How to Add a Delegate**: starts a focused delegate management walkthrough.
  - **How to Use Analytics**: starts a focused analytics dashboard walkthrough (conditionally rendered).
- **Page Tutorial Callback Enhancement**: Updated `PageTutorial.tsx`'s `onClose` callback to pass a boolean `completed` state, indicating whether the tutorial was completed or skipped.

## [v2.0.4] - 2026-06-07

### Added & Refined

- **Suggestive Walkthrough Steps**: Expanded the Eisenhower Matrix step-by-step onboarding tutorial to include interactive walkthrough steps for quick-adding tasks into the queue (`#matrix-task-form`), managing team delegates (`#btn-manage-delegates`), recovering completed and eliminated tasks from archives (`#btn-archives`), and reviewing analytics insights and performance distribution (`#btn-analytics`, conditionally rendered outside test mode).
- **First-Time Login Redirection**: Updated the login page redirection logic to automatically route first-time users (or those who haven't dismissed the tour) to `/eisenhower-matrix` instead of the home page models library.
- **Auto-Chaining Walkthrough Flow**: Programmed the Eisenhower page's Video Tour and Page Tutorial triggers to chain-execute seamlessly. Upon completing or skipping the Video Tour, the interactive focus highlight walkthrough launches automatically.

## [v2.0.3] - 2026-06-07

### Added & Fixed

- **Manual Watch Tour Integration**: Added a "Watch Tour" button with a pulsing Sparkles icon inside the Eisenhower Matrix page header to play the interactive video tour on-demand.
- **Contextual Video Tour Track Exclusions**: Configured the Matrix Watch Tour trigger to launch `VideoTourPlayer` excluding Track 1 (Mental Models introduction), starting directly from Track 2 (Eisenhower Matrix) with all sequential progress locks disabled.
- **Adaptive Tour Completion CTA**: Reworked the final video tour CTA button label to adapt dynamically to the context: displays "Back to App" when launched in-context from the Eisenhower Matrix page, and "Start with App" when playing from the initial onboarding screen.
- **Onboarding Tutorial Blur and Coordinates Optimization**: Fixed the first-time page onboarding tutorial so it only triggers once the workspace modal is closed and a workspace is active. Refined `PageTutorial.tsx` overlay masks to avoid full-screen blur flashes during mount coordinate calculations. Added a relative positioning container class to the Analytics Dashboard page to correctly align the walkthrough tooltip.

## [v2.0.2] - 2026-06-07

### Added & Refactored

- **Eisenhower Matrix Tour Structure Update (Track 2)**: Extended the Track 2 video duration to 90 seconds (7 chapters) to introduce the Eisenhower Matrix's purpose and its 4-quadrant layout structure first, before explaining the individual quadrants and the logic summary.
- **UI Card Visual Overhaul**: Redesigned the visual cards displayed in the tour canvas for Track 2. Added a glassmorphic prioritization introduction card (0s - 15s) and an interactive 2x2 grid representing the four quadrants structure overview (15s - 30s) before showing detailed quadrant cards.
- **Neural Voiceover Regeneration**: Regenerated Track 2 neural speech synthesis audio files for English, Hindi, and Hinglish using Microsoft Edge-TTS to include the new introductory chapters.
- **Dynamic Playback Speed Sync**: Fixed a bug where changing the video tour speed (e.g. 1.5x, 2x) did not speed up the audio narration. Implemented dynamic `playbackRate` updates on the active `HTMLAudioElement` so voice speed changes on the fly.
- **Precision Scrubbing Offset Sync**: Fixed a bug where scrubbing the timeline started the audio from the beginning of the subtitle segment rather than the matching position. Implemented relative offset calculation (`currentTime - subtitle.start`) to set `currentTime` on the audio element, keeping video and audio perfectly in sync.

## [v2.0.1] - 2026-06-07

### Added & Fixed

- **Conversational & Expressive Neural Voiceovers**: Replaced browser-native speech synthesis with high-quality, pre-recorded neural audio files generated via Edge-TTS. English uses the highly realistic `en-US-AvaNeural` voice, Hindi uses fluent `hi-IN-SwaraNeural`, and Hinglish uses the expressive `en-IN-NeerjaExpressiveNeural` (conversational Indian English accent).
- **Bilingual & Hinglish Language Support**: Integrated complete English, Hindi, and Hinglish translation sets for all 4 tracks of the platform tour. Added a language toggle UI widget in the player control bar to switch subtitles and audio narration instantly.
- **Audio Autoplay & Gesture Unlock**: Fixed browser restrictions by playing standard HTML5 `Audio` elements triggered directly from user interactions.
- **Timeline Scrubbing Voice Resync**: Fixed a bug where timeline scrubbing caused the audio engine to stay silent. The player now determines the subtitle at the new time and plays the corresponding neural MP3 segment immediately.
- **Codebase Cleanup & Dry Definition**: Refactored `VideoTourPlayer.tsx` to import the single source-of-truth `TRACKS` array from `src/lib/tracks.ts`, deleting redundant inline configuration.


## [v2.0.0] - 2026-06-07

### Added

- **Interactive 4-Track Video Tour**: Reworked simulated video tour player showing mental models, Eisenhower Matrix (20-minute masterclass simulation), task operations, and key platform features, complete with synchronized browser text-to-speech audio explanation. Enforces sequential progression (chapters unlock one-by-one, persisting in local storage) and utilizes a calmer, slowed-down voice engine (0.8x rate factor) for maximum clarity and understandability.
- **Contextual In-App Tutorials**: Focus highlight rings and tethered tooltips walking the user through elements on the Eisenhower Matrix page and the Analytics Dashboard page.
- **Preference Persistence**: Configured persistent local storage preferences ("Don't show again") scoped to individual users or guest profiles.
- **Zero-Asset Sound Synthesis Engine**: Implemented native browser Web Audio API oscillator synthesis for chimes, ticks, and swooshes, eliminating the need to load external audio assets.

## [v1.9.2] - 2026-05-23

### Added & Fixed

- **Persistent SQLite Volume & Runtime Migration**: Relocated `prisma db push` from build-time Dockerfile execution to runtime `npx prisma migrate deploy` at container startup. Removed the redundant Dockerfile `VOLUME /app/prisma` instruction to ensure persistent SQLite database volumes correctly apply migrations without data loss.
- **Workspace Modal Redirection Fix**: Resolved a bug where workspace selection, workspace switching, and task mutations (adding/deleting tasks) caused redirect loops that reopened the "Get Started" modal. Implemented state-preserving query parameters (`workspaceId` and `testMode`) to keep the selection stable.
- **Production Secret Hardening**: Added dynamic validation checks for the `JWT_SECRET` environment variable in production. The application now fails fast at startup if it is missing, preventing silent fallbacks to insecure development secrets. Enforced setting `JWT_SECRET` in `docker-compose.yml`.
- **Shared Workspace Access Control**: Extracted duplicate workspace access checking logic across Server Actions into a single shared helper utility in `src/lib/workspace-access.ts`.
- **Admin Seeding & Concurrency Guard**: Re-engineered database seeding using composite keys for default workspaces and delegates, and added an in-memory initialization check to prevent concurrent race conditions during static builds.
- **Guest / Test Mode Isolation**: Enhanced the Eisenhower matrix client hook `useTaskOperations.ts` to fully isolate tasks by workspace ID when running in guest/non-authenticated mode.

## [v1.9.1] - 2026-05-18

### Added & Fixed

- **Universal Password Management**: Added a global "Change Password" modal accessible from the start page for all authenticated users.
- **Admin Portal Hardening**: Relocated User Management strictly to the start page for administrators. Protected root `admin` account from deletion.
- **Dynamic Credential Banner**: Added programmatic check to automatically hide default credentials banner once the default password is changed.
- **Custom Confirmation Modal**: Replaced native `window.confirm` dialogs with a premium custom React confirmation modal in the Admin Portal to resolve webview popup dismissal bugs during user deletion and rejection.
- **CLI Admin Recovery Tool**: Dedicated Node.js command-line script (`npm run admin:recovery -- <new_password>`) for server administrators to securely recover or reset the root admin password directly in the SQLite database without web UI intervention.
- **Security Vulnerability Remediation**: Added in-memory rate limiting to auth actions against brute-force attacks, implemented `tokenVersion` session invalidation upon password changes to prevent replay attacks, enforced strict SameSite cookie attributes, and added session authorization checks across all custom API routes (`/api/tasks`, `/api/delegates`, `/api/config`).
- **IDOR & Security Header Hardening**: Configured comprehensive Next.js security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy) and implemented strict multi-tenant Insecure Direct Object Reference (IDOR) workspace ownership verification across all Server Actions (`task.ts`, `delegate.ts`, `analytics.ts`) and REST API routes (`/api/tasks`, `/api/delegates`).

## [v1.9.0] - 2026-05-18

### Added

- **User Authentication**: Secure login system with password hashing (bcryptjs) and JWT session management (jose).
- **Admin Portal**: Dedicated portal (`/admin`) for administrators to manage system access, create new users, and revoke access.
- **Multi-Tenant Scoping**: Workspaces are now scoped to individual users or globally accessible.

## [v1.8.0] - 2026-05-18

### Added

- **Notifications**: Integrated browser push notifications.
- **Daily Workspace Reminders**: Option to set daily notification times for specific workspaces.
- **Task Reminders**: Option to set reminder alerts before task due dates.

## [v1.5.0] - 2026-01-21

### Added

- **Analytics Dashboard**: New "Wisdom Lab" page providing deep insights into productivity.
- **Visual Charts**: Integrated Recharts to display Quadrant Distribution (Pie) and Completion Velocity (Bar).
- **KPI Metrics**: Cards for Completion Rate, Avg Velocity, and Active Tasks.
- **Delegation Reports**: Breakdown of tasks assigned to others.

## [v1.4.0] - 2026-01-21

### Added

- **Time Management Config**: Global "Max Daily Hours" setting to define workload capacity.
- **Overburden Alert**: Real-time visual indicator in the Header and Stats view when "Urgent & Important" tasks exceed daily capacity.
- **Calendar View**: Monthly grid view to visualize and manage scheduled tasks.
- **Settings Modal**: Dedicated UI for configuring global preferences.

## [v1.3.0] - 2026-01-21

### Added

- **Workspaces**: Database schema, UI modal, and header switcher to manage distinct task contexts (e.g., Work, Personal).
- **Test Mode**: Explicit non-persistent sandbox mode accessible from the startup modal.
- **Task Metadata**: Added `description`, `workspaceId`, and `tags` to support broader contexts.
- **Manage Workspaces**: Create, update description, and delete workspaces directly from the UI.

## [v1.2.3] - 2026-01-21

### Changed

- **UI Modularization**: Refactored `page.tsx` from 1200+ lines into modular components (`MatrixHeader`, `StatsView`, `MainTaskForm`, `MatrixGrid`).
- **Hydration Fix**: Added `suppressHydrationWarning` to fix browser extension conflicts.
- **Git Strategy**: Enforced PR-only merges to the `main` branch.

## [v1.2.2] - 2026-01-21

### Changed

- **Hook Migration**: Refactored `useTaskOperations.ts` to fully utilize Server Actions.
- **Optimistic UI**: Implemented instant feedback for task creation, movement, and deletion.

## [v1.2.1] - 2026-01-20

### Added

- **Server Actions Foundation**: Implemented `task.ts` and `delegate.ts` actions.
- **Performance**: Added SQLite indexes for optimized task querying.
- **Types**: Standardized Eisenhower Matrix types for server-side processing.

## [v1.1.1] - 2026-01-20

### Added

- Documentation structure (`Docs/` folder).
- User Flow diagrams.
- Design System checklist.

## [v1.1.0] - 2025-01-19

### Added (v1.1.0)

- Eisenhower Matrix Page features (Drag & Drop, Quadrants).
- "Smart Scheduling" logic.

## [v1.0.0] - 2025-01-15

### Added (v1.0.0)

- Initial Release.
- Homepage with Mental Models list.
- Basic SQLite Database setup.
