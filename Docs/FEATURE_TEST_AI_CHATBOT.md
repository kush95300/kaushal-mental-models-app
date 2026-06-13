# 🧪 Feature Test — AI Chatbot Tasker (Betu) v2.4.0

Manual step-by-step verification guide for the AI Chatbot Tasker feature.

> **Before you start**: Make sure `npm run dev` is running and at least one LLM API key is configured in `.env.local`.

---

## Pre-flight

- [ ] Open [http://localhost:3000](http://localhost:3000) in Chrome or Edge (required for voice input)
- [ ] Confirm you can see the **floating indigo bot button** in the bottom-right corner of any page

---

## Test 1 — Auth Guard (Unauthenticated)

**Steps:**
1. Make sure you are **NOT logged in** (or open in incognito)
2. Click the floating **bot icon** (bottom-right)

**Expected:** A "Sign in to use Betu" screen appears with a Sign In button — NOT the chat interface.

**Pass:** ✅ Sign-in prompt shown | **Fail:** ❌ Chat UI visible without login

---

## Test 2 — Chat Opens After Login

**Steps:**
1. Log in with your admin credentials
2. Navigate to the **home page** (`/`)
3. Click the floating **bot icon**

**Expected:**
- Chat panel slides up from bottom-right
- Header shows "Betu — AI Productivity Assistant" with gradient
- Provider pill(s) appear (e.g. "Gemini Flash") — only providers with configured API keys show
- 8 sample prompt chips visible in two colours (indigo = task, violet = Q&A)

**Pass:** ✅ | **Fail:** ❌

---

## Test 3 — Q&A Mode

**Steps:**
1. Type: `What is the Eisenhower Matrix?` → Send
2. Watch the response stream in real-time

**Expected:**
- Response streams word-by-word (typing cursor visible during streaming)
- Answer explains the 4 quadrants (Do First, Schedule, Delegate, Eliminate)
- **No task confirmation table** appears
- Mic button and send button remain visible throughout

**Pass:** ✅ | **Fail:** ❌

---

## Test 4 — Sample Prompt Auto-fill

**Steps:**
1. Open chat (messages cleared — click a chip before sending anything)
2. Click the chip: **"What mental model helps with time management?"**

**Expected:** Text fills the input field. Message does NOT auto-send.

**Pass:** ✅ | **Fail:** ❌

---

## Test 5 — Simple Task (INBOX)

**Steps:**
1. Send: `Add task: Read ML research paper someday`

**Expected:**
- Chatbot confirms task
- **ProposedTaskCard** appears showing:
- Content: "Read ML research paper someday" (or similar)
- Quadrant: 📥 Inbox
- Delegate: Self
2. Click **"Add 1 Task to Matrix"**

**Expected:** Task appears in your Eisenhower Matrix Inbox. Chat confirms addition.

**Pass:** ✅ | **Fail:** ❌

---

## Test 6 — Quadrant Inference (DO FIRST)

**Steps:**
1. Send: `Urgent: Fix the login bug right now, it's blocking all users`

**Expected ProposedTaskCard:**
- Quadrant: 🔴 Do First (isImportant=true, isUrgent=true)
- Delegate: Self
- Due date: today

**Pass:** ✅ | **Fail:** ❌

---

## Test 7 — Task Decomposition (>240 min)

**Steps:**
1. Send: `Schedule writing a 6-hour technical design document for the work workspace by Friday`

**Expected ProposedTaskCard:**
- **3 sub-tasks** appear (each ~120 min), with distinct names like "Technical Design Doc – Part 1 of 3", etc.
- All in SCHEDULE quadrant
- Due date: next Friday

**Pass:** ✅ | **Fail:** ❌

---

## Test 8 — Delegation + Follow-up

**Steps:**
1. Send: `Ask Riya to prepare the client presentation by tomorrow`

**Expected ProposedTaskCard:**
- **Main task**: "Prepare the client presentation" — Delegate: Riya — DELEGATE quadrant
- **Follow-up** (amber section): "Follow up with Riya on client presentation" — Self — 2–5 min — today/tomorrow
2. Click "Add X Tasks to Matrix"

**Expected:** Both tasks added. Check matrix for delegate task + follow-up in Self.

**Pass:** ✅ | **Fail:** ❌

---

## Test 9 — Matrix Page Context (Workspace Locked)

**Steps:**
1. Navigate to your Eisenhower Matrix page (`/eisenhower-matrix/<id>`)
2. Open the chatbot
3. Send: `Add task: Prepare weekly report`

**Expected:** Task is added to the **current workspace** without asking which workspace.

**Pass:** ✅ | **Fail:** ❌

---

## Test 10 — Clarification Loop

**Steps:**
1. Send: `Add a task` (intentionally vague)

**Expected:** Chatbot asks a clarifying question (e.g. "What task would you like to add?"). No `ProposedTaskCard` shown yet.

2. Reply with: `Review the Q3 analytics report`

**Expected:** Chatbot proposes the task with quadrant and details.

**Pass:** ✅ | **Fail:** ❌

---

## Test 11 — Voice Input + Silence Timeout

**Steps:**
1. Click the **mic button** (red animated state)
2. Say: "Add task review the weekly report"
3. Stop talking and wait
4. (Mobile Devices) Verify that saying single words (e.g., "add") does not cause duplicate text transcription (such as "addaddadd").

**Expected:**
- Transcript appears in the text input without duplication or stuttering.
- After ~2.5 seconds of silence: a **countdown ring** shrinks around the mic icon
- Mic **auto-stops** (icon returns to grey)
- Text field shows clean transcript (you can review/edit before sending)

**Pass:** ✅ | **Fail:** ❌

---

## Test 12 — LLM Provider Switching

**Steps** (only if 2+ API keys configured):
1. Open chatbot
2. Click a different provider pill (e.g. switch from Gemini to GPT-4o Mini)
3. Send a message

**Expected:** Response comes from the selected provider (provider pill pulses while streaming).

**Pass:** ✅ | **Fail:** ❌

---

## Test 13 — Admin Quota Settings

**Steps:**
1. Navigate to `/admin`
2. Scroll to **"AI Chat Quotas"** section
3. Change "Default Message Limit" to `5` → click **Save Settings**

**Expected:** Success message shown.

**Pass:** ✅ | **Fail:** ❌

---

## Test 14 — Quota Exceeded + Request Flow

**Steps:**
1. With limit set to 5, send 5 chat messages
2. Send a 6th message

**Expected:** 
- Chatbot message says quota is exhausted
- **QuotaRequestModal** appears with usage info (5/5)
3. Enter `10` extra messages, add a reason, click **Send Request to Admin**

**Expected:** Success confirmation shown.

4. Go to `/admin` → AI Chat Quotas → Pending Requests

**Expected:** Your request appears with username, amount, reason.

5. Click **Approve** → enter `8` → click **Confirm**

**Expected:** Request resolved. Go back to chatbot — you can send messages again.

**Pass:** ✅ | **Fail:** ❌

---

## Test 15 — Rate Limiting

**Steps:**
1. Rapidly send 11 messages within 60 seconds

**Expected:** The 11th message returns a friendly "You're sending messages too fast. Please wait a moment" message.

**Pass:** ✅ | **Fail:** ❌

---

## Test 16 — Chatbot Renaming

**Steps:**
1. Open the chatbot
2. Hover over the header text "Betu"
3. Click the pencil edit icon that appears next to it
4. Type a new name (e.g. `MyHelper`) and click the checkmark button or press Enter
5. Close the chatbot panel and re-open it
6. Ask the bot: `What is your name?`

**Expected:**
- Hovering shows the pencil edit icon next to the bot name
- Clicking the pencil opens an input field allowing up to 24 characters
- Saving updates the header to "MyHelper" and the input placeholder to "Ask MyHelper anything..."
- Re-opening preserves "MyHelper" (stored in `localStorage`)
- The streaming response references "MyHelper" because the name was passed to the system prompt

**Pass:** ✅ | **Fail:** ❌

---

## Test 17 — Forgot Password Flow & Admin Approval

**Steps:**
1. Log out of your active session.
2. At the `/login` screen, click **"Forgot Password?"**.
3. Type a registered username (e.g. `user1`) and click **"Request Password Reset"**.
4. Confirm success message is displayed.
5. Log in as **admin** (`admin`/`admin`).
6. Navigate to `/admin`. You should see a **Password Reset Requests** panel.
7. Locate the request for `user1` and click **"Approve"**.
8. Verify that a card showing a temporary password (e.g. `temp-XXXXXX`) appears with a **"Copy"** button.
9. Click **"Copy"** and confirm clipboard has the plaintext temporary password.
10. Log out, go to `/login`, and sign in using `user1` and the copied temporary password.

**Expected:**
- Password reset request submitted successfully.
- Request appears in the admin portal list.
- Approval generates a temporary alphanumeric password and invalidates active user sessions by incrementing the user's `tokenVersion`.
- User can successfully log in using the temporary credentials.

**Pass:** ✅ | **Fail:** ❌

---

## Test 18 — Missing API Key Validation

**Steps:**
1. Temporarily clear your `GEMINI_API_KEY` (or the key of whichever provider you want to test) in `.env` and restart the dev server.
2. Open the chatbot, select that provider (e.g. Gemini), and type a message.
3. Submit the message.

**Expected:**
- The chatbot response block displays the specific error: `Gemini API key is not configured. Please set GEMINI_API_KEY in your environment variables.` (or corresponding provider error).
- The bot does NOT fall back silently, and does NOT show a generic "Sorry, something went wrong" message.

**Pass:** ✅ | **Fail:** ❌

---

## Test 19 — Voice Input Speech Pausing (Jitter Test)

**Steps:**
1. Open the chatbot.
2. Click the microphone icon button.
3. Say: `"Add a task: Design homepage"`
4. Stop speaking for 1-2 seconds (do NOT click stop, let the mic stay active).
5. Say: `"by tomorrow"`
6. Let the silence timeout auto-stop the recording.

**Expected:**
- The textbox should accumulate the speech segments sequentially: `"Design homepage by tomorrow"`.
- The second phrase should NOT erase or overwrite the first phrase.

**Pass:** ✅ | **Fail:** ❌

---

## Test 20 — Daily Briefing Playback & Audio Controls

**Steps:**
1. Open the chatbot.
2. Click the **"Brief My Day (Audio)"** button in the welcome feed.
3. Observe the loading state, then watch the text output appear.
4. Listen to the bot synthesize and read the daily statistics aloud.
5. Verify that a card with a **sound wave animation** (bouncing lines) and controls (**Pause / Play / Stop**) appears at the bottom.
6. Click **"Pause"** and verify audio pauses and state switches to "Voice Briefing Paused".
7. Click **"Play"** (Resume) and verify speech resumes.
8. Click **"Stop"** and verify speech cancels completely and the wave card disappears.

**Expected:**
- Stats, daily productivity comparison, and weekly quadrant advice script generated.
- Web Speech synthesis plays clean speech (no asterisks or list tags read).
- Sound wave indicator animates during active speech and pauses when audio is paused.
- All controls function smoothly.

**Pass:** ✅ | **Fail:** ❌

---

## Test 21 — Analytics Contribution Calendar Heatmap

**Steps:**
1. Navigate to the **Analytics** page (`/analytics?workspaceId=1`).
2. Verify the **Completed Tasks Heatmap** card is rendered.
3. Confirm that it displays 53 columns representing the last 375 days.
4. Confirm month labels are aligned dynamically above their starting columns.
5. Hover over a cell representing a day where tasks were completed. Verify the custom tooltip displays the exact count and date.
6. Complete 3 tasks today in your matrix, then return to Analytics. Confirm today's cell turns medium indigo (3-4 tasks).

**Expected:**
- Calendar grid displayed with correct cells and legend.
- Color coding scales properly (0 = grey, 1-2 = light purple, 3-4 = medium, 5+ = dark).
- Tooltips display on hover.
- Today's completed tasks increment today's cell immediately.

**Pass:** ✅ | **Fail:** ❌

---

## Test 22 — Hinglish Chat Mode

**Steps:**
1. Open the chatbot settings panel (gear icon).
2. Locate the **Language (Bhasha)** setting and select **Hinglish**.
3. Close settings, and send a message: `Plan a task to fix login bugs tomorrow`
4. Verify the response.

**Expected:**
- The chatbot's conversational replies and questions are written in Hinglish (using Latin script, e.g. "Maine aapke login bug task ko matrix mein add kar diya hai").
- The proposed tasks list is STILL generated with task contents in English (e.g. "Fix login bugs") and correct dates/estimation details.

**Pass:** ✅ | **Fail:** ❌

---

## Test 23 — Hinglish Audio Briefings

**Steps:**
1. While in **Hinglish** mode, click **"Brief My Day (Audio)"** or **"Describe Weekly Tasks (Audio)"**.
2. Listen to the spoken voice.

**Expected:**
- The generated briefing text is in Hinglish (Roman script, e.g. "Namaste! Main hoon aapka assistant...").
- The text-to-speech engine speaks out the Hinglish sentences correctly.

**Pass:** ✅ | **Fail:** ❌

---

## Test 24 — Persistent Multi-Session Chat History

**Steps:**
1. Open the chatbot and send 3-4 messages.
2. Click the **New Chat** (`Plus` icon) button in the header. Verify the chat panel is cleared.
3. Send a message in the new session.
4. Click the gear icon to open settings. Verify you can see both sessions listed under **Chat History (Max 7)**.
5. Click the first session. Verify it restores the message history.
6. Create 6 more chat sessions (total of 8). Verify the oldest session is automatically deleted (retaining exactly 7).
7. In settings, click the trash icon next to a session. Verify it is deleted.

**Pass:** ✅ | **Fail:** ❌

---

## Test 25 — Forced Video Tour and Interactive Walkthrough Redirects

**Steps:**
1. Open the chatbot settings, and make sure **English** is selected.
2. Ask the bot: `show matrix tutorial`.
3. In the interactive buttons that appear, click **"🎥 Play Video Onboarding Tour"**.
4. Observe the page redirection and load state.
5. Go back to chatbot and click **"🎯 Start Interactive Matrix Walkthrough"**.
6. Observe the page redirection and load state.

**Expected:**
- Clicking "🎥 Play Video Onboarding Tour" redirects to `/eisenhower-matrix?videoTour=true` and launches the Video Tour Player overlaying the workspace.
- Clicking "🎯 Start Interactive Matrix Walkthrough" redirects to `/eisenhower-matrix?tutorial=true` and launches the step-by-step focus highlighting page walkthrough.

**Pass:** ✅ | **Fail:** ❌

---

## Test 26 — Refined Q&A Conceptual Routing

**Steps:**
1. Open the chatbot.
2. Type: `what is the heisenhower matrix` -> Send.
3. Observe the response.

**Expected:**
- The response streams conversationally from Gemini, explaining the matrix concept.
- It is NOT blocked or intercepted locally.
4. Type: `show matrix guide` -> Send.
5. Verify it intercepts locally, showing the three tutorial buttons (Video Onboarding, Matrix Walkthrough, Analytics Walkthrough).

**Pass:** ✅ | **Fail:** ❌

---

## Test 27 — Priority Routing Engine & Enable Routing Logs Toggle

**Steps:**
1. Open the chatbot settings panel (gear icon).
2. Toggle the **"Enable Routing Logs"** checkbox (check it).
3. Close settings.
4. Type: `what is the eisenhower matrix` -> Send.
5. Observe the log pill at the top of the message stream.
6. Type: `make cake recipes` -> Send.
7. Observe the log pill.
8. Type: `Add a task: write code` -> Send.
9. Observe the log pill.

**Expected:**
- The toggle checkbox is persisted in `localStorage`.
- Enabling the toggle displays center-aligned system logs in the chat history.
- For `what is the eisenhower matrix` (or guide request), the log pill displays: `🔍 Routing Decision: VIDEO_TUTORIAL`.
- For `make cake recipes` (off-topic query), the log pill displays: `🔍 Routing Decision: FAQ (OFF_TOPIC)`.
- For `Add a task: write code` (task manipulation query), the log pill displays: `🔍 Routing Decision: GEMINI`.

**Pass:** ✅ | **Fail:** ❌

---

## Test 28 — Mobile Voice Web Speech API Duplication & Overlap Fix

**Steps:**
1. Open the app on a mobile device (or simulate mobile in Chrome DevTools using touch mode).
2. Open the chatbot, click the microphone button, and start speaking.
3. Pause for a second or speak words in quick succession, then pause again.
4. Observe the compiled text in the input box.

**Expected:**
- The words appear sequentially without stuttering or duplication (e.g. no repeating words like "addaddaddadad" or "add a task of add a task of").
- Pausing and resuming speech results in clean, correctly-spaced words compiled sequentially.

**Pass:** ✅ | **Fail:** ❌

---

## Test 29 — Admin Password Reset Request Deletion

**Steps:**
1. Log in as administrator and navigate to `/admin`.
2. Find the **Password Reset Requests** table.
3. For any resolved (e.g., approved/completed) request, look for the Trash (delete) icon next to the status badge.
4. Click the Trash icon.

**Expected:**
- The reset request is immediately removed from the UI.
- Refreshing the page confirms the request has been deleted from the database.

**Pass:** ✅ | **Fail:** ❌

---

## Test 30 — FAQ Redirections & Default Seed Verification

**Steps:**
1. Navigate to the landing page `/`. Verify there is a **Help (QuestionMark)** icon in the header. Click it.
2. Navigate to the Eisenhower Matrix workspace page. Verify there is a **FAQ (MessageSquare)** icon in the desktop header, and an **FAQ & Help Center** list option in the mobile menu drawer.
3. Click any of the FAQ entry points.
4. Scroll through the `/faq` page.

**Expected:**
- The redirection links to `/faq` successfully.
- The `/faq` page lists at least 7 default, pre-populated questions and answers (including Test Mode, voice input, and data security questions).

**Pass:** ✅ | **Fail:** ❌

---

## Test 31 — Floating Chatbot Button & Invitation Label

**Steps:**
1. Open any page.
2. Inspect the floating chatbot button in the bottom-right corner.
3. Observe the avatar image and the text label below it.
4. Click settings (gear icon) in the chatbot and change the avatar to a custom image URL.
5. Save settings and observe the floating chatbot trigger button again.

**Expected:**
- The default trigger button shows the custom neural image filling the circle completely with zero border/padding.
- Directly underneath the floating trigger button, a glassmorphic text label `"Ask Betu"` (or the bot's custom name) is rendered centered.
- When a custom avatar image URL is saved, it also fills the trigger button circle completely.

**Pass:** ✅ | **Fail:** ❌

---

## Production Build

> ⚠️ Run this step manually in your terminal — **do NOT let the IDE run it automatically**.

```bash
npm run build
```

**Expected:** Build completes with 0 errors. Check for any type errors or missing imports.

---

## All Tests Summary

| # | Test | Pass/Fail |
|---|------|-----------|
| 1 | Auth guard (no login) | |
| 2 | Chat opens after login | |
| 3 | Q&A mode streaming | |
| 4 | Sample prompt auto-fill | |
| 5 | Simple task (Inbox) | |
| 6 | Quadrant inference (Do First) | |
| 7 | Task decomposition (>240 min) | |
| 8 | Delegation + follow-up | |
| 9 | Matrix page workspace lock | |
| 10 | Clarification loop | |
| 11 | Voice input + silence timeout | |
| 12 | LLM provider switching | |
| 13 | Admin quota settings | |
| 14 | Quota exceeded + request flow | |
| 15 | Rate limiting | |
| 16 | Chatbot Renaming | |
| 17 | Forgot Password & Admin Approve | |
| 18 | Explicit API Key Missing Errors | |
| 19 | Voice Pause Concatenation Jitter | |
| 20 | Daily Spoken Briefing Playback | |
| 21 | Analytics Activity Heatmap Grid | |
| 22 | Hinglish Chat Mode | |
| 23 | Hinglish Audio Briefings | |
| 24 | Persistent Multi-Session Chat History | |
| 25 | Forced Video Tour Redirect | |
| 26 | Refined Q&A Conceptual Routing | |
| 27 | Priority Routing Engine & Logs | |
| 28 | Mobile Voice Transcription Fix | |
| 29 | Admin Password Reset Deletion | |
| 30 | FAQ Redirections & Seeding | |
| 31 | Trigger Button & Invitation Label | |
| — | Production build | |

