# Study Buddy — AI notes, broken into small steps

Built for **QuantumHacks** (Hack4Today).

## Project Description

Study Buddy turns messy study material into a short, guided study session:

1. **Upload** your notes — paste text, or attach a PDF, a photo of handwritten notes, or a
   `.txt` file
2. **AI breaks it into 4–10 small tasks** (3–20 minutes each), in plain language, ordered so
   foundational ideas come first
3. **Work through the tasks one at a time** using a built-in focus timer
4. **Ask the built-in tutor** anything you're stuck on — it answers only from your own notes,
   so it never drifts off-topic

The result: instead of staring at a page of notes wondering where to even start, you get a
checklist you can just start ticking off.

## Problem It Solves & Impact

**The problem.** For students with ADHD, autism, or other executive-function challenges, the
hardest part of studying usually isn't understanding the material — it's *starting*. A page
of undifferentiated notes with no built-in structure causes task paralysis before any actual
learning happens. Most study apps assume the student can already break work into steps and
estimate how long each step takes — that's precisely the skill this population struggles with
most.

**The fix.** Study Buddy does that planning step automatically: it reads the material and
hands back an ordered, time-boxed checklist, so "getting started" just means pressing the
timer on task one. The tutor chat is deliberately narrow — scoped only to the uploaded
material — so a student who gets stuck gets a short, relevant answer instead of an
open-ended AI conversation that can become its own distraction.

**Why it matters.** This is a small, concrete accessibility tool, not a general-purpose
chatbot wrapper. It targets a specific, underserved need — executive-function support for
studying — which is exactly what the "Educational Platforms" and "Social Impact" hackathon
tracks are looking for.

## Technologies Used

- **Frontend:** React 19 + Vite, plain CSS (calming, low-stimulation color system, respects
  `prefers-reduced-motion` and `prefers-color-scheme`)
- **Backend:** Node.js + Express
- **AI:** [Ollama](https://ollama.com) running locally — `llama3.2` for task breakdown and
  tutor chat, `llava` for transcribing photographed handwritten notes. No API key,
  no per-request cost, fully offline-capable.
- **File handling:** `multer` for uploads, `pdf-parse` for PDF text extraction

## Architecture

```
study-buddy-agent/
├── backend/
│   ├── server.js              Express app entrypoint
│   ├── routes/study.js        POST /api/breakdown, POST /api/chat
│   └── services/
│       ├── ollama.js          thin client for the local Ollama HTTP API
│       └── prompts.js         prompt templates (OCR, breakdown, tutor)
└── frontend/
    └── src/
        ├── App.jsx            top-level state: upload → study session
        ├── api.js             fetch wrappers for the backend
        └── components/
            ├── UploadScreen.jsx
            ├── TaskList.jsx
            ├── FocusTimer.jsx
            └── TutorChat.jsx
```

The backend is intentionally stateless — no database. Each `/api/breakdown` response returns
the extracted `sourceText` alongside the generated tasks, and the frontend passes that same
`sourceText` back on every `/api/chat` call so answers stay grounded in the student's own
material without needing server-side session storage.

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

Open http://localhost:5173, paste some notes (or upload a PDF/image/txt file), and click
"Break it down for me."

## Team

- Ainesh Manik — solo

## Demo Video / Screenshots / Live Demo

_Add links here before submitting to Devpost._
