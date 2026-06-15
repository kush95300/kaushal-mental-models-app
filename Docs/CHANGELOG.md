# Changelog

All notable changes to this project will be documented in this file.

## [v2.4.8] - 2026-06-15

### Added & Fixed — Chat Daily Message Limit Hard Caps, Workspace Transfers, and Task Shifting

- **Fixed Task Workspace Transfer Bug**:
  - Resolved a runtime `PrismaClientValidationError` ("Unknown argument workspaceId. Did you mean workspace?") that occurred when trying to update a task's `workspaceId` directly as a scalar field.
  - Updated `updateTask` server action in `src/actions/task.ts` and the `PATCH` route in `src/app/api/tasks/route.ts` to update task workspaces using the proper Prisma nested relation connection syntax `workspace: { connect: { id: ... } }`, deleting the raw `workspaceId` scalar field from the data payload.
  - This ensures that transferring tasks between workspaces via the Assignment Modal and the chatbot moves approval card works flawlessly.
- **Improved Chatbot Move Intent Rules**:
  - Added strict `CRITICAL OPERATING MODE SELECTION RULES` to `src/lib/llm/systemPrompt.ts` that force the model to choose MODE C (`mode: "move"`) for any task movement request.
  - Instructed the model to never fallback to creating duplicate tasks (MODE A) and instead request clarification if the target task is ambiguous or missing.
- **Chatbot Header Speaker Button (Auto Text-to-Speech)**:
  - Added a speaker/volume toggle button (`Volume2` / `VolumeX`) in the chatbot window header that enables or disables automatic Text-to-Speech (Read Aloud) for all incoming chatbot replies.
  - Persists the toggle state in `localStorage` under `chatbot_tts_enabled` so it is retained across chat sessions.
  - Automatically speaks all streamed assistant replies using the user's selected accent when enabled.
  - Instantly cancels any active SpeechSynthesis playback if the user turns the speaker button OFF.
  - Added a `scoreVoice` prioritization system that rates available browser voices, automatically promoting natural premium voices (e.g. Google, Samantha, Rishi, Neerja) to the top of selection lists, and deprioritizes robotic built-in legacy voices.
  - Refined SpeechSynthesis text cleaning to keep single hyphens/dashes inside date strings (e.g. `2026-06-13`) and hyphenated words, preventing SpeechSynthesis from reading date hyphens as empty strings and pronouncing dates as large 8-digit numbers (e.g., "2 crore 2 lakh...").
- **Proposed Task Moves (Chatbot Task Shifting)**:
  - Added a new `MODE C: TASK MOVEMENT` to the system prompt generator, allowing the LLM to identify when a user intends to move or shift an existing task (e.g. "move this task to Personal workspace", "shift prepare grocery to Schedule quadrant").
  - Injected task `id`s into the LLM system prompt's list of active tasks so the LLM can output precise target `taskId`s for proposed moves.
  - Added `ProposedMove` interface to chat types and added `proposedMoves` to the parsed LLM structured response JSON.
  - Created a beautiful `ProposedMoveCard` UI component to render the proposed moves, displaying the task title, its target quadrant, and target workspace context with Approve and Cancel buttons.
  - Added `executeMoves` callback that triggers `PATCH /api/tasks` for each move, updating the database task records instantly.
  - Dispatched a custom `"refresh-matrix-tasks"` event on completion to instantly reload the Eisenhower matrix board.
- **Pending Tasks Q&A Routing**:
  - Injected user's active tasks (today's TODO & DONE tasks) into the chatbot's system prompt context.
  - Refined the chatbot's Mode B (Question & Answer) system instructions to recognize questions about pending, remaining, done, completed, or "rest" tasks in both English and Hinglish (e.g. "what is my rest task pending for the day", "mera kya task bacha hai today"), summarizing them conversationally.
- **Daily Hard limit of 100 Messages**:
  - Implemented strict backend constraints across all chat routes (`/api/chat`, `/api/chat/quota-status`, `/api/chat/quota-request`, and `/api/chat/quota-settings`) guaranteeing that no user can exceed a hard ceiling of 100 messages per day, even if requested or modified by admins.
- **Default Message Limit Validation**:
  - Validated that the global `defaultLimit` set by administrators in `/api/chat/quota-settings` cannot exceed 100, displaying a descriptive error to administrators if violated. Added UI `max={100}` attributes and input clamping.
- **Ephemeral Extra Quota Reset**:
  - Made approved quota boosts single-day only by automatically resetting `extraQuota` back to `0` during the daily reset boundary check. On the next day, standard users are seamlessly returned to the default limit (20).
- **Quota Request and Approval Caps**:
  - Capped maximum user-requested boosts and admin-approved partial increases to prevent the computed target limit from exceeding the 100-message hard ceiling.
- **TTS Voice Accent Selection & Hinglish Voice Filtering**:
  - Added a "Voice Accent (Speaker)" select dropdown in the Chatbot settings panel. This dropdown dynamically queries available SpeechSynthesis voices on the client browser.
  - Persists the selected voice choice in `localStorage` under `chatbot_voice_name`, falling back automatically to the best accent match if none is explicitly selected.
- **Preset Cute Robot Avatars**:
  - Generated and bundled 5 high-quality cute 3D robot chatbot mascot images inside `public/assets/` to serve as preset chatbot avatars.
  - Added a grid selection panel "Choose Robot Avatar" in the chatbot settings panel overlay, allowing users to choose from any of the 5 cute mascots with instant preview highlights.
  - Retained the option to input and save a custom image URL link for maximum customization.
  - Set the first cute robot mascot (`/assets/cute_robot_one.png`) as the new system-wide default chatbot avatar.

## [v2.4.7] - 2026-06-15

### Fixed & Added — Chatbot Alternating Roles, Workspace Scoping, and Task Transfer Modals

- **Chat History Alternating Roles (Gemini Fix)**:
  - Implemented automatic chat history normalization in `/api/chat` that combines consecutive messages of the same role (e.g. consecutive assistant messages) and ensures the history starts with a `user` message. This prevents role-validation errors and ensures Gemini maintains proper context over multiple turns.
- **Persistent Audio Briefing Buttons**:
  - Moved the "Brief My Day" and "Describe Weekly Tasks" audio briefing buttons from the welcome screen to a persistent, compact action bar directly below the LLM provider switcher, keeping them always available.
- **Local Briefing API Interception**:
  - Intercepts briefing phrases (e.g. "brief my task/week") locally in the chatbot message handler to execute the briefing API directly, preventing them from falling back to Gemini.
- **Workspace Query Scoping**:
  - Automatically scans user task queries for workspace names first (case-insensitive word-boundary check) before falling back to the selected workspace, allowing explicit override of task target workspaces.
  - Added target workspace name context dynamically in the system prompt.
- **Task Workspace Transfer Modals**:
  - Added a "Target Workspace" select dropdown in the task **Edit Content Modal** when multiple workspaces are available, allowing users to transfer tasks between workspaces.
  - Added quick **"Transfer to Workspace"** buttons in the task **Assignment Modal** (MOVE view) to let users change a task's workspace in one click.
  - Automatically re-assigns the task's delegate to the target workspace's "Self" delegate during workspace transfers to prevent foreign key errors.

## [v2.4.6] - 2026-06-13

### Fixed — Gemini Multi-Model Fallback Chain

- **Gemini Multi-Model Fallback**:
  - Implemented an automatic model cascading chain in `src/lib/llm/providers/gemini.ts` to query alternative models if the primary model encounters rate limit exhaustion (HTTP 429), model unavailability/support issues (HTTP 404), or server-side failures (HTTP 5xx).
  - Chain checks candidate models: `process.env.GEMINI_MODEL`, `gemini-3.5-flash`, `gemini-3-flash`, `gemini-3.1-flash-lite`, `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-1.5-flash`, and `gemini-1.5-pro`.
  - Non-retriable exceptions (like authentication failures or malformed inputs) are bubbled up immediately to prevent unnecessary retries.

## [v2.4.5] - 2026-06-13

### Fixed & Added — Mobile Voice, FAQ Redirection, and Reset Request Deletion

- **Mobile Web Speech API Duplication & Overlap Fix**:
  - Resolved an issue where Chrome and Safari on mobile devices (Android/iOS) produced duplicate or stuttering text transcription (e.g., "addaddaddadad" or "add a task of add a task of washing clothes") due to native SpeechRecognition returning overlapping/cumulative results.
  - Implemented an overlap-aware word alignment algorithm inside `onresult` that dynamically computes prefix and suffix word overlaps across all event result segments. This deduplicates overlapping/cumulative speech data seamlessly, ensuring clean, continuous transcription on both mobile and desktop browsers.
- **FAQ Navigation Redirection & Seeding**:
  - Added a navigation link (Help icon) to the FAQ page on the main landing/home page header.
  - Added an FAQ button (MessageSquare icon) in the Eisenhower Matrix desktop header and a "FAQ & Help Center" list option in the mobile menu drawer to make FAQ accessibility universally available.
  - Expanded default FAQs to include questions on voice input, completed tasks, and Test Mode, seeding a total of 7 useful, pre-populated Q&As into the database.
- **Admin Password Reset Request Deletion**:
  - Added a delete button (trash icon) next to resolved/approved password reset request status badges in the Admin Portal.
  - Implemented the `deletePasswordResetRequest` Server Action to securely purge reset request records from the database.
- **Chatbot Floating Icon & Invitation Label**:
  - Restyled the floating chatbot trigger button to allow user-uploaded custom avatar images to fill the circle completely (0 padding/border), resolving the issue where custom images were rendered excessively small.
  - Added a glassmorphic invitation label ("Ask [botName]") directly below the floating chatbot button on all pages to entice users to interact with the assistant.
  - Configured the default agent avatar to use a custom image URL (the neural background image) and defaulted the initial avatar type to image.

## [v2.4.4] - 2026-06-13

### Added & Fixed — Priority Routing Logs, Log Mode Toggle, and Custom System Messages

- **Priority Routing Log System**:
  - Implemented priority-based query routing logs displaying `🔍 Routing Decision: ...` directly in the chat feed when enabled.
  - Centered system logs in a glassmorphic pill style so they do not resemble standard assistant messages.
- **Log Mode Toggle**:
  - Added a new configuration toggle "Enable Routing Logs" in the settings overlay.
  - Persistent state saved to and reloaded from `localStorage` under `chatbot_routing_logs`.
- **Refined Priority Engine Routing**:
  - Categorizes task queries, off-topic requests, and conceptual Q&As, accurately displaying routing decisions (`VIDEO_TUTORIAL`, `FAQ`, or `GEMINI`).
  - Added distinct button options for the **Video Onboarding Tour** (`🎥 Play Video Onboarding Tour`) and the **Interactive Matrix Walkthrough** (`🎯 Start Interactive Matrix Walkthrough`), ensuring users can select their preferred onboarding path directly.
- **Workspace Selection & Quota Limits Bug Fixes**:
  - Resolved a parser bug where the client threw a generic connection error on HTTP 429 status codes instead of streaming the `quota_exceeded` JSON chunk to display the quota exhaustion message and request modal.
  - Added case-insensitive text input matching for pending workspace choices, enabling users to type workspace names (e.g., "personal") to transition and submit tasks.
  - Strip client-side UI directive tags (`WORKSPACE_CHOOSER`, `TUTORIAL_LINKS`, `FAQ_LINK`) and workspace prompts from message histories before querying LLM endpoints, preventing Gemini from generating duplicate or echoing prompts.
  - Modified `fetchQuotaStatus` in the chatbot to automatically clear obsolete quota exceeded assistant message bubbles and routing logs from the chat feed and reset the exceeded state once the quota limit has been increased.
  - Added auto-detection of workspace names (case-insensitive with word boundary checks) directly inside the user's prompt text. If a workspace name is found (e.g. "personal workspace"), it is automatically selected, bypassing the interactive workspace chooser.
- **UI Contrast & Color Fixes (No more White Boxes)**:
  - Fixed invalid Tailwind CSS color classes across the application (specifically replacing custom classes like `slate-850`, `slate-550`, `slate-505`, `slate-50500`, `slate-9050`, `slate-8050`, and `rose-6050` with standard Tailwind slate/rose classes).
  - Resolved fallback background issues where cards rendered with white backgrounds and light-grey text in dark mode due to compilation failure of invalid dark mode utility classes.
- **Chat Error Retry Option**:
  - Added a "Retry" button on failed assistant messages (connection errors, LLM errors).
  - Clicking "Retry" automatically wipes the failed message and any preceding system routing logs, then resubmits the user's last message to continue the flow seamlessly.

## [v2.4.2] - 2026-06-13

### Added & Fixed — Refined Q&A Routing, Multi-Session Chats (Max 7), and Video Onboarding Tour Redirects

- **Hinglish Language Mode**:
  - Integrated complete support for Hinglish in the chatbot settings panel overlay.
  - When selected, conversational replies and spoken daily/weekly briefings are generated in Hinglish (Latin/Roman script) while leaving JSON schema keys and task titles in English for system compatibility.
- **Refined Q&A Conceptual Routing**:
  - Reworked local grilling logic to pass general concept and Q&A questions (like "what is the matrix") directly to Gemini rather than intercepting them locally.
  - Limits local blocks to explicit tutorial tour requests and completely off-topic questions.
- **Multi-Session Chat History (Max 7)**:
  - Replaced the simple chat clear feature with a "New Chat" (`Plus` icon) button in the chatbot header to create new conversational sessions.
  - Keeps up to 7 distinct historical sessions saved in `localStorage` per user.
  - Displays a "Chat History" selector in the settings panel to easily switch between or delete individual sessions. Automatically purges the oldest sessions when the count exceeds 7.
- **Forced Video Tour Redirection**:
  - Updated the matrix tutorial launch button to redirect to `/eisenhower-matrix?videoTour=true` and clear the dismissed flag, forcing the simulated video player tour to start overlaying the matrix.

## [v2.4.1] - 2026-06-13

### Added & Fixed — Security History, Chatbot controls & Heatmap Range Filters

- **Chatbot Clear Chat & Avatar Update**:
  - Added a "Clear Chat" (`Trash2`) button in the chatbot header to wipe active conversation state.
  - Replaced the robot icon with a friendly human/avatar smiling face icon (`Smile`) on the trigger button, header, and welcome screen.
- **Password History & Security Event Log**:
  - Added `PasswordHistory` database model to log manual password changes, reset request creations, approvals, and rejections.
  - Created a split-column panel in the Admin Dashboard showing active requests on the left and a scrollable "Security Event Log" timeline on the right.
- **Auto-Hide Approved Reset Dialogs**:
  - Configured `changeUserPassword` to automatically transition resolved requests to `"COMPLETED"` status and clear their `tempPassword` when a user updates their password.
  - Automatically hides the temporary password copy card from the Admin Dashboard.
- **Heatmap Date Range Toggle & Styled Tooltips**:
  - Added "Last 1 Year" vs "This Year" pill switcher in the Completed Tasks Heatmap header.
  - Configured the calendar days generation to dynamically scale between the last 375 days and a full calendar year (Jan 1 - Dec 31).
  - Replaced the basic browser tooltip with a custom-designed Tailwind CSS hover card detailing task count and medium-styled dates.
- **Configurable Gemini Model Override**:
  - Added support for configuring the Gemini model via `GEMINI_MODEL` environment variable, defaulting to `gemini-1.5-flash`. This allows users to easily swap model strings if a specific model identifier is not supported or returns a 404 error.

## [v2.4.0] - 2026-06-13

### Added & Fixed — Security, Chatbot & Analytics Enhancements

- **Password Reset Request Flow**:
  - Added a "Forgot Password" option to the login page allowing users to submit reset requests to the admin.
  - Added a "Password Reset Requests" management tab in the Admin Panel to view, approve, or reject requests.
  - Upon approval, a randomized one-time password is generated, and the user's `tokenVersion` is incremented to invalidate all active session tokens/cookies.
- **SQLite Database Relocation & Migration Safety**:
  - Relocated the SQLite database file from `/app/prisma/dev.db` to `/app/data/dev.db` in Dockerfile, docker-compose, Kubernetes config, Helm templates, and Makefiles.
  - Ensures the Prisma migrations directory `/app/prisma/migrations` is not masked by host-mounted database volumes, securing schema updates during container deployment.
- **Explicit LLM API Credentials Check**:
  - Updated the AI router to perform explicit API key configuration checks prior to querying model endpoints.
  - Bubbles up precise messages (e.g., "Gemini API key is not configured") directly to the chatbot UI instead of showing a generic "Something went wrong" message.
- **Voice Input Jitter & Continuous Speech Recognition Fix**:
  - Fixed a voice transcription bug where paused speech caused preceding words/phrases to be wiped or overwritten.
  - Uses ref-based initial values and segment index offset tracking to preserve accumulated text across pauses.
- **Yearly Completed Tasks Heatmap**:
  - Implemented a GitHub-style 375-day completed tasks activity calendar board on the Analytics page.
  - Visualizes task completion frequency using color-scaled grid tiles with custom hover tooltips showing task count and date.
  - Integrated into the analytics onboarding guide as an interactive tour step.
- **Daily Speech Briefing ("AlexaSpeak")**:
  - Introduced a "Brief My Day" option in the chatbot that summarizes the user's active/completed tasks, compares today's productivity to yesterday, and provides advice on quadrant balance.
  - Leverages Web Speech Synthesis API with active speech player states (Play, Pause, Resume, Stop) and a custom CSS audio wave visualizer.
- **Node.js Loader Deprecation Warning Fix**:
  - Prepend `NODE_OPTIONS='--no-deprecation'` in `package.json` dev, build, and start scripts to suppress `[DEP0205] DeprecationWarning: module.register() is deprecated` warnings originating from Node.js ESM loader internals.

## [v2.3.0] - 2026-06-08

### Added — AI Chatbot Tasker (Betu)

- **AI Chatbot Tasker — "Betu"**: Introduced a floating AI productivity assistant available on all pages (home + matrix). Supports natural language task creation, mental model Q&A, voice input, and streaming responses.
- **Customizable Persona**: Defaults to "Betu". Users can rename the chatbot inline from the chat window header, with their custom name persisting via `localStorage` and sent to the LLM system prompt.
- **Multi-LLM Provider Support**: Supports Gemini 1.5 Flash, GPT-4o-mini, and Claude Haiku simultaneously. Provider priority: Gemini → OpenAI → Claude. Auto-fallback on rate-limit (HTTP 429) — users can also manually switch via pill selector. API keys are server-side only and never exposed to the browser.
- **Streaming SSE Responses**: LLM replies stream token-by-token via Server-Sent Events — no frozen spinner. Words appear as they generate.
- **Auth Guard**: Chatbot shows a sign-in prompt for unauthenticated users. Full chat UI is only accessible after login.
- **Voice Input with Silence Detection**: Microphone button uses `webkitSpeechRecognition`. Silence countdown ring (SVG) appears after speech ends; mic auto-stops after 2.5 seconds of silence.
- **Dual-Mode LLM**: Mode A parses tasks into the Eisenhower Matrix (including quadrant assignment, task decomposition for >240 min, delegation + auto-follow-up). Mode B answers Q&A about mental models, the Eisenhower Matrix, productivity, and app features.
- **Task Confirmation Table**: Before inserting tasks, a rich `ProposedTaskCard` shows all proposed tasks (including auto-generated delegation follow-ups) with quadrant, assignee, due date, and time estimate. User confirms or cancels.
- **Admin-Controlled Message Quota**: Admins set a global default limit (messages per day or week) and period in the Admin Portal. Users who exhaust their quota see a quota request modal. Admin can approve full or partial quota increases — approved extra messages are tracked per-user.
- **Rate Limiting**: 10 requests per minute per user enforced server-side (in-memory Map). Friendly rate-limit message shown on breach.
- **Rolling Conversation History**: Last 10 message pairs (~4000 tokens) sent to LLM for multi-turn context ("the one I mentioned earlier" works).
- **8 Sample Prompts**: Task prompts (indigo) and Q&A prompts (violet) shown when chat is empty.
- **DB Schema**: Added `ChatQuotaSettings`, `UserChatUsage`, `ChatQuotaRequest` Prisma models with migration `add_ai_chat_quota`.
- **New API Routes**: `/api/chat`, `/api/chat/providers`, `/api/chat/quota-request`, `/api/chat/quota-settings`, `/api/auth/me`.

## [v2.2.0] - 2026-06-08


### Added & Fixed

- **Video Tour Controls Auto-Hide**: Video tour player controls (header, tab bar, footer controls) now automatically fade out after 2.5 seconds of inactivity while the tour is playing — identical to YouTube/video player behaviour. Any mouse movement, click, or touch instantly restores them with a smooth transition. Controls always remain visible while paused.
- **Show/Hide Captions Toggle**: Added a CC button to the video player controls footer, allowing users to toggle closed captions on or off dynamically during the tour.
- **Mobile/Tablet Chapter Selector Dropdown**: Replaced the cramped horizontally scrolling "Video 1", "Video 2" buttons on mobile/tablet viewports with a beautifully styled select dropdown showing proper video chapter titles (e.g. "What is Mental Models?", "What is the Eisenhower Matrix?"), allowing users to select and watch any chapter in any order without sequential restrictions.
- **Tour Skip/Close Redirect**: When a user dismisses or skips the intro tour before selecting a workspace or entering Test Mode, they are now redirected back to the landing page (`/`) instead of being dropped into the workspace selection modal with no context.
- **Responsive Homepage Header**: Condensed top navigation bar on small screens — the logo text "The Wisdom Lab" is hidden (icon only), action button labels ("User Management", "Change Password") collapse to icon-only, and paddings/gaps scale down on `< sm` viewports, preventing icon overflow and clipping.
- **Calendar Week View on Mobile**: Calendar now defaults to a 7-day week view on screens narrower than 768 px, with a Month/Week toggle in the header. Prev/Next navigation steps by 7 days in week mode and by 1 month in month mode.
- **Drag-to-Switch Quadrant Tabs**: Dragging a task card and hovering over any mobile tab switcher button now immediately switches to that quadrant, and tabs also act as drop zones — tasks dropped directly onto a tab are moved to that quadrant.
- **Fluid Modal Sizing**: All modals (Edit Content, Settings, Date Picker, Reset Confirm, Completion, Done List, Deleted List, Help, Onboarding, Workspace Selection) now use fluid widths (`w-[calc(100%-2rem)]`), responsive paddings, and corner radii that scale between mobile and desktop breakpoints.
- **Absolute Page Navigation Header**: Switched the homepage header from fixed to absolute on mobile screens to prevent scrolling jitter and layout clashing.
- **True Fullscreen Video Tour Player**: Integrated HTML5 Fullscreen API capability to allow users to toggle the simulated video tour to full screen, and refactored controls using a responsive layout with abbreviated language selector tags (EN/HI/HING) on narrow viewports to prevent controls from disappearing.
- **Compact Mobile Stats Grid**: Restructured stats display cards to render in a 3-column layout on mobile viewports rather than a 2-column configuration, using tighter padding and smaller text to save vertical space.
- **Topmost Modal Layering**: Standardized modal overlays and the page tutorial completion panel to use elevated z-index values (starting at `z-[50000]`), preventing z-index layering bugs from rendering modals behind hover-highlighted elements (`hover:z-[9999]`).
- **Centered Notifications Panel**: Replaced relative positioning on the notifications popover with a viewport-relative `fixed` layout on mobile, keeping notifications centered and readable without flowing off-screen.
- **Stackable Delegate Modal Form**: Configured the add teammate form container to stack inputs vertically on mobile screen widths, resolving horizontal button clipping.
- **Interactive Move Handle UI & Helper Tip**: Styled the task cards' touch-reassignment `🎯` button with a clear background/border and added a mobile-only tip banner in the matrix grid to guide touch screen users.

## [v2.1.0] - 2026-06-07

### Added & Fixed

- **Mobile Tabbed Grid Navigation**: Integrated a horizontally scrollable mobile switcher (Inbox, Do First, Schedule, Delegate, Eliminate tabs) to show one quadrant at a time, avoiding long vertical stacks on small viewports.
- **Collapsible More Settings Menu**: Compressed secondary settings and action items in `MatrixHeader` into a slide-up "More Settings" drawer sheet on mobile, preserving header whitespace.
- **Stacked Quick-Add Task Form**: Form inputs and buttons stack cleanly in column orientation on smaller screen widths, preventing layout overflow.
- **Touch-Friendly "Move/Prioritize" Option**: Added a visible target action trigger on task cards for mobile touch devices, integrating with `AssignmentModal` for quick quadrant relocations without drag-and-drop.

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
