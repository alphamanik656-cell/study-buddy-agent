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
- **Smart Flashcards & Quizzes** — automatically generates custom flashcards and targeted
  multiple-choice practice questions (with instant feedback, explanations, and a per-question
  difficulty badge) to test your knowledge before exam day. Pick a difficulty (easy/medium/hard/
  mixed) and how many questions (3/5/10), and regenerate just the quiz without touching your
  flashcards.
- **Memory Hacks & Study Tips** — every section comes with a mnemonic, silly acronym, or vivid
  mental image tied to that specific content, to help tough concepts stick.
- **Absence Recovery** — perfect for filling in the blanks if you missed class, fell behind,
  or zoned out during a lecture. Paste notes, upload a PDF, or snap a photo of handwritten
  notes — Study Buddy reads it all.
- **Accounts & Saved Sessions** — sign up, and every study session (notes, breakdown, flashcards)
  is saved to your private account. Reopen it any time, or delete sessions you no longer need.
- **Boss Battle Game** — a gamified quiz mode: answer questions from your own notes to attack a
  boss, get one wrong and it hits back. Pick difficulty and question count, watch HP bars drop
  in real time, then fight again. Turns quiz review into something with actual stakes.

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
│   │   ├── auth.js            POST /api/auth/{signup,signin,signout}, GET /api/auth/me
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
            ├── Quiz.jsx
            ├── QuizSettings.jsx   shared difficulty/count picker (Quiz + Game)
            ├── Game.jsx           Boss Battle mode
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

Open http://localhost:5173, sign up with any email/password (8+ characters — stored locally
in `backend/data.sqlite`, created automatically on first run), then start a new session: paste
some notes (or upload a PDF/image/txt file) and click "Break it down for me." Past sessions
are listed on the dashboard after you sign back in, and can be reopened or deleted.

## Team

- Ainesh Manik — solo

## Demo Video / Screenshots / Live Demo

_Add links here before submitting to Devpost._
