# Study Buddy — AI notes, broken into small steps

Built for **QuantumHacks** (Hack4Today).

## Project Description

Study Buddy turns a wall of study notes into a short list of small, concrete, timed tasks —
then walks the student through them one at a time with a focus timer and a tutor chat that
only knows their material.

A student pastes notes, or uploads a PDF, a text file, or a photo of handwritten notes. The
AI reads the material and breaks it into 4–10 bite-sized tasks (each 3–20 minutes, with a
plain-language summary and a difficulty tag). The student works through the list one task at
a time using a built-in focus timer, checking tasks off as they go, and can ask a scoped
tutor chat to clarify anything without leaving the flow or getting an answer that wanders
off-topic.

## Problem It Solves & Impact

Long, undifferentiated study material is one of the biggest barriers to getting started for
students with ADHD, autism, or other executive-function challenges — the "wall of text"
problem causes task paralysis before studying even begins. Generic study apps assume the
student can already plan, sequence, and time-box their own work, which is precisely the part
that's hardest for this population.

Study Buddy does that planning *for* the student: it converts any source material into an
ordered, time-boxed checklist automatically, and pairs each task with a short focus-timer
session so starting never requires deciding what "starting" even means. The tutor chat is
scoped strictly to the uploaded material, so a student who gets stuck gets a short, relevant
answer instead of an open-ended AI conversation that can itself become a distraction.

This directly targets the "Educational Platforms" and "Social Impact" tracks — it's a small,
concrete tool aimed at a specific, underserved accessibility need, not a general-purpose
chatbot wrapper.

## Technologies Used

- **Frontend:** React 19 + Vite, plain CSS (calming, low-stimulation color system, respects
  `prefers-reduced-motion` and `prefers-color-scheme`)
- **Backend:** Node.js + Express
- **AI:** [Ollama](https://ollama.com) running locally — `llama3.2` for task breakdown and
  tutor chat, `llama3.2-vision` for transcribing photographed handwritten notes. No API key,
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
ollama pull llama3.2-vision

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

- Rohit Manik — solo

## Demo Video / Screenshots / Live Demo

_Add links here before submitting to Devpost._
