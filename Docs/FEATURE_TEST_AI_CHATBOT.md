# 🧪 Feature Test — AI Chatbot Tasker (Priya) v2.3.0

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

**Expected:** A "Sign in to use Priya" screen appears with a Sign In button — NOT the chat interface.

**Pass:** ✅ Sign-in prompt shown | **Fail:** ❌ Chat UI visible without login

---

## Test 2 — Chat Opens After Login

**Steps:**
1. Log in with your admin credentials
2. Navigate to the **home page** (`/`)
3. Click the floating **bot icon**

**Expected:**
- Chat panel slides up from bottom-right
- Header shows "Priya — AI Productivity Assistant" with gradient
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

**Expected:**
- Transcript appears in the text input
- After ~2.5 seconds of silence: a **countdown ring** shrinks around the mic icon
- Mic **auto-stops** (icon returns to grey)
- Text field shows transcript (you can review/edit before sending)

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
| — | Production build | |
