# Study Buddy — AI notes, explained in plain language

Built for **QuantumHacks** (Hack4Today).

## Project Description

**Introducing Study Buddy: Your Ultimate AI Learning Companion**

Struggling to decipher complex class notes or catch up after a missed lecture? Study Buddy
transforms your messy study materials into clear, actionable learning tools in seconds. Just
upload your teacher's notes, slides, or syllabus, and let Study Buddy do the heavy lifting.

**Key Features**

- **Instant Concept Breakdown** — turns dense, confusing notes into a numbered, plain-language
  walkthrough: each section names a specific concept and actually explains it in simple words,
  instead of just re-showing the original text.
- **Smart Flashcards** — auto-generated front/back cards to test recall before exam day, with
  an independent regenerate that leaves your quiz untouched.
- **Quiz Game** — multiple-choice questions generated from your own notes (instant feedback,
  explanations, per-question difficulty badge), played as a boss battle: answer correctly to
  attack the boss, get one wrong and it hits back, with live HP bars for both sides. Pick a
  difficulty (easy/medium/hard/mixed) and question count (3/5/10) before each fight.
- **Memory Hacks & Study Tips** — every section comes with a mnemonic, silly acronym, or vivid
  mental image tied to that specific content, to help tough concepts stick.
- **Absence Recovery** — perfect for filling in the blanks if you missed class, fell behind,
  or zoned out during a lecture. Paste notes, upload a PDF, or snap a photo of handwritten
  notes — Study Buddy reads it all.
- **Accounts & Saved Sessions** — sign up, and every study session (notes, breakdown, flashcards)
  is saved to your private account. Reopen it any time, or delete sessions you no longer need.
- **Try It Instantly, No Sign-Up** — a one-click guest mode with sample notes (Photosynthesis,
  the Water Cycle, the French Revolution) lets anyone try the full app — breakdown, flashcards,
  quiz, and Boss Battle — in seconds, no account required.

Whether you're prepping for a final, catching up after a sick day, or just need a second
explanation, Study Buddy ensures you never fall behind.

## Problem It Solves & Impact

**The problem.** Dense, jargon-heavy class notes are often harder to learn from than the
subject matter actually deserves — especially for students with ADHD, autism, or other
executive-function challenges, where an unstructured wall of text causes overwhelm before any
real learning starts. It's worse if you missed the class entirely: there's no one around to
re-explain it in simpler terms.

**The fix.** Study Buddy reads the material and rewrites it as a numbered, plain-language
walkthrough — each section names one specific concept and actually explains it, instead of
just repeating the confusing original wording, paired with a memory aid to help it stick.
Flashcards and a quiz turn that passive reading into active recall practice, and a tutor chat
scoped strictly to the uploaded material answers follow-up questions without wandering
off-topic or inventing things that aren't in your notes.

**Why it matters.** This is a small, concrete accessibility tool, not a general-purpose
chatbot wrapper. It targets a specific, underserved need — executive-function support for
studying — which is exactly what the "Educational Platforms" and "Social Impact" hackathon
tracks are looking for.

## Technologies Used

- **Frontend:** React 19 + Vite, plain CSS (calming, low-stimulation color system, respects
  `prefers-reduced-motion` and `prefers-color-scheme`)
- **Backend:** Node.js + Express
- **AI:** [Ollama](https://ollama.com) running locally — `llama3.2` for the notes breakdown,
  flashcards/quiz, and tutor chat, `llava` for transcribing photographed handwritten notes.
  No API key, no per-request cost, fully offline-capable.
- **Auth & storage:** `node:sqlite` (Node's built-in SQLite — no native module install) for
  users and saved sessions; passwords hashed with `node:crypto` scrypt; httpOnly cookie
  sessions via `cookie-parser` (no external auth service or JWT library needed)
- **File handling:** `multer` for uploads, `pdf-parse` for PDF text extraction

## Architecture

```
study-buddy-agent/
├── backend/
│   ├── server.js              Express app entrypoint
│   ├── middleware/requireAuth.js   cookie session -> req.userId, 401 otherwise
│   ├── routes/
│   │   ├── auth.js            POST /api/auth/{signup,signin,signout,guest}, GET /api/auth/me
│   │   ├── sessions.js        CRUD for saved study sessions (auth-protected)
│   │   └── study.js           POST /api/breakdown, /flashcards, /quiz, /chat (auth-protected)
│   └── services/
│       ├── db.js              node:sqlite setup (users, auth_tokens, study_sessions tables)
│       ├── auth.js            password hashing (scrypt) + session token generation
│       ├── ollama.js          thin client for the local Ollama HTTP API
│       └── prompts.js         prompt templates (OCR, breakdown, flashcards/quiz, tutor)
└── frontend/
    └── src/
        ├── App.jsx            top-level state: auth -> dashboard -> study session
        ├── api.js             fetch wrappers for the backend (credentialed for cookies)
        └── components/
            ├── AuthScreen.jsx
            ├── SessionDashboard.jsx
            ├── UploadScreen.jsx
            ├── NotesBreakdown.jsx
            ├── Flashcards.jsx
            ├── Quiz.jsx           the Quiz Game - HP-bar boss battle
            ├── QuizSettings.jsx   difficulty/count picker
            └── TutorChat.jsx
```

Auth uses an httpOnly cookie holding a random session token, checked against the
`auth_tokens` table on every request — no JWT library, just `node:crypto` and SQLite. Each
signed-in user only ever sees their own sessions (every query is scoped by `user_id`). A study
session's `sourceText` is stored once at creation and reused for every `/api/chat` and
`/api/flashcards` call on that session, so the tutor and quiz stay grounded in the student's
own material. Generated flashcards are cached back to the database the first time they're
built, so reopening a session doesn't re-run the AI unless you explicitly regenerate.

## Installation Instructions

**Prerequisites:** Node.js 18+, and [Ollama](https://ollama.com) installed and running.

```bash
# 1. Pull the models used by the app
ollama pull llama3.2
ollama pull llava

# 2. Backend
cd backend
npm install
cp .env.example .env
npm run dev        # starts on http://localhost:3001

# 3. Frontend (in a second terminal)
cd frontend
npm install
cp .env.example .env
npm run dev         # starts on http://localhost:5173
```

Open http://localhost:5173. Click **"🎓 Try a sample — no sign-up needed"** to try the full app
instantly with pre-loaded sample notes, or sign up with any email/password (8+ characters —
stored locally in `backend/data.sqlite`, created automatically on first run) to save sessions
under a real account. Either way: start a new session, paste notes (or upload a PDF/image/txt
file — or pick a sample topic right on the upload screen) and click "Break it down for me."
Past sessions are listed on the dashboard after you sign back in, and can be reopened or deleted.

## Team

- Ainesh Manik — solo

## Demo Video / Screenshots / Live Demo

_Add links here before submitting to Devpost._
