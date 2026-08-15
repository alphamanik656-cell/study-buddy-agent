export function ocrPrompt() {
  return `Transcribe all handwritten or printed text visible in this image of study notes. ` +
    `Output plain text only, preserving line breaks and structure. Do not add commentary, ` +
    `do not describe the image, and do not add a preamble like "Here is the text:" — just the transcription.`;
}

export function breakdownPrompt(sourceText) {
  return `Your task: break the study material at the bottom of this prompt into exactly 5 small tasks for an
ADHD/neurodivergent student, ordered logically (foundational first). Stay strictly within that material.
The "tasks" array MUST contain exactly 5 items — not fewer, not more.

Each task needs:
- "title": specific to the content, starts with a verb (e.g. "Skim section on chlorophyll", not just "Skim")
- "summary": 1 short sentence in plain words, not copied from the source
- "minutes": realistic estimate, 3-20
- "difficulty": "easy" | "medium" | "hard"
- "memoryTrick": ONE short, playful memory aid tied to this task's content — an acronym/silly sentence for a
  list of terms, or a vivid one-line mental image if there's no list. Never generic advice. Max 15 words.

"topic" must be a 2-5 word title naming the MATERIAL's subject (e.g. "Water Cycle Basics"), never a
description of these instructions.

JSON only, no markdown fences, no extra text. The "tasks" array below shows only 2 example items but you
MUST output 5 — keep going, do not stop early:
{"topic":"...","tasks":[{"title":"...","summary":"...","minutes":10,"difficulty":"easy","memoryTrick":"..."},{"title":"...","summary":"...","minutes":10,"difficulty":"easy","memoryTrick":"..."}, ... 3 more tasks ...]}

MATERIAL:
"""
${sourceText}
"""`;
}

export function flashcardsPrompt(sourceText) {
  return `Study coach building review materials strictly from the material below.

1. "flashcards": each a short "front" (term/question) and "back" (answer, max 1 sentence).
   The "flashcards" array MUST contain exactly 5 items — not fewer, not more.
2. "quiz": multiple-choice questions, each with "question", "choices" (exactly 4 strings),
   "correctIndex" (0-based index of the correct choice — double-check it matches "explanation"),
   and "explanation" (max 1 sentence). The "quiz" array MUST contain exactly 3 items — not fewer, not more.

Stay strictly within the material given. JSON only, no markdown fences, no extra text. The example below
shows only 1 item per array but you MUST output 5 flashcards and 3 quiz questions — keep going:
{"flashcards":[{"front":"...","back":"..."}, ... 4 more ...],"quiz":[{"question":"...","choices":["...","...","...","..."],"correctIndex":0,"explanation":"..."}, ... 2 more ...]}

MATERIAL:
"""
${sourceText}
"""`;
}

export function tutorSystemPrompt(sourceText) {
  return `You are a patient, encouraging study tutor helping a neurodivergent student understand their own notes.
Answer ONLY using the study material below — if the answer isn't in the material, say so plainly rather than
guessing. Keep answers short: 2-5 sentences or a tight bullet list. Avoid jargon; when you must use a technical
term, define it in the same sentence. Never be condescending. Use a warm, calm tone.

STUDY MATERIAL:
"""
${sourceText}
"""`;
}
