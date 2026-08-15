# Study Buddy — AI notes, broken into small steps

Built for **QuantumHacks** (Hack4Today).

## Project Description

**Introducing Study Buddy: Your Ultimate AI Learning Companion**

Struggling to decipher complex class notes or catch up after a missed lecture? Study Buddy
transforms your messy study materials into clear, actionable learning tools in seconds. Just
upload your teacher's notes, slides, or syllabus, and let Study Buddy do the heavy lifting.

**Key Features**

- **Instant Concept Breakdown** — simplifies dense, confusing topics into small, ordered,
  time-boxed tasks with plain-language explanations, so you always know exactly what to do
  next.
- **Smart Flashcards & Quizzes** — automatically generates custom flashcards and targeted
  multiple-choice practice questions (with instant feedback and explanations) to test your
  knowledge before exam day.
- **Memory Hacks & Study Tips** — every task comes with a mnemonic, silly acronym, or vivid
  mental image tied to that specific content, to help tough concepts stick.
- **Absence Recovery** — perfect for filling in the blanks if you missed class, fell behind,
  or zoned out during a lecture. Paste notes, upload a PDF, or snap a photo of handwritten
  notes — Study Buddy reads it all.

Whether you're prepping for a final, catching up after a sick day, or just need a second
explanation, Study Buddy ensures you never fall behind.

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
│   ├── routes/study.js        POST /api/breakdown, POST /api/flashcards, POST /api/chat
│   └── services/
│       ├── ollama.js          thin client for the local Ollama HTTP API
│       └── prompts.js         prompt templates (OCR, breakdown, flashcards/quiz, tutor)
└── frontend/
    └── src/
        ├── App.jsx            top-level state: upload → study session
        ├── api.js             fetch wrappers for the backend
        └── components/
            ├── UploadScreen.jsx
            ├── TaskList.jsx
            ├── FocusTimer.jsx
            ├── FlashcardsQuiz.jsx
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
