export function ocrPrompt() {
  return `Transcribe all handwritten or printed text visible in this image of study notes. ` +
    `Output plain text only, preserving line breaks and structure. Do not add commentary, ` +
    `do not describe the image, and do not add a preamble like "Here is the text:" — just the transcription.`;
}

export function breakdownPrompt(sourceText) {
  return `Your task: break the study material at the bottom of this prompt into exactly 5 sections that
literally explain its content in plain language, so a student who is confused by the original wording can
actually understand it. Order sections the way the material itself is ordered (foundational concepts first).
Stay strictly within that material — do not invent facts it doesn't contain. The "sections" array MUST
contain exactly 5 items — not fewer, not more.

Each section needs:
- "heading": short, names the specific concept this section explains (e.g. "Chlorophyll's role", not "Part 1")
- "explanation": 2-4 sentences that actually explain this concept in plain, simple words — a real
  explanation a confused student could learn from, not a one-line label and not copied from the source
- "keyTerms": 2-4 important words or short phrases COPIED EXACTLY (same spelling/capitalization) from within
  this section's own "explanation" text — the terms most worth a student remembering. Every entry MUST be an
  exact substring of "explanation", not a paraphrase or a word from elsewhere.
- "memoryTrick": ONE short, playful memory aid tied to this section's content — an acronym/silly sentence for
  a list of terms, or a vivid one-line mental image if there's no list. Never generic advice. Max 15 words.

"topic" must be a 2-5 word title naming the MATERIAL's subject (e.g. "Water Cycle Basics"), never a
description of these instructions.

JSON only, no markdown fences, no extra text. The "sections" array below shows only 2 example items but you
MUST output 5 — keep going, do not stop early:
{"topic":"...","sections":[{"heading":"...","explanation":"...","keyTerms":["...","..."],"memoryTrick":"..."},{"heading":"...","explanation":"...","keyTerms":["...","..."],"memoryTrick":"..."}, ... 3 more sections ...]}

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
   "explanation" (max 1 sentence), and "difficulty" ("easy", "medium", or "hard" — mix a variety across
   the questions). The "quiz" array MUST contain exactly 3 items — not fewer, not more.

Stay strictly within the material given. JSON only, no markdown fences, no extra text. The example below
shows only 1 item per array but you MUST output 5 flashcards and 3 quiz questions — keep going:
{"flashcards":[{"front":"...","back":"..."}, ... 4 more ...],"quiz":[{"question":"...","choices":["...","...","...","..."],"correctIndex":0,"explanation":"...","difficulty":"easy"}, ... 2 more ...]}

MATERIAL:
"""
${sourceText}
"""`;
}

const QUIZ_DIFFICULTY_INSTRUCTIONS = {
  easy: 'Every question must be "easy": tests recall of a single clearly-stated fact.',
  medium:
    'Every question must be "medium": requires connecting two related facts or explaining a concept in ' +
    'your own words, not just spotting a fact verbatim.',
  hard: 'Every question must be "hard": requires reasoning about *why* or *how*, or distinguishing between ' +
    'similar-sounding concepts in the material — not answerable by simple recall.',
  mixed: 'Mix a variety of difficulties across the questions: some "easy" (single-fact recall), some ' +
    '"medium" (connecting facts), some "hard" (reasoning about why/how).',
};

export function quizPrompt(sourceText, { difficulty = 'mixed', count = 3 } = {}) {
  const n = Math.max(2, Math.min(10, Math.round(count)));
  const difficultyInstruction = QUIZ_DIFFICULTY_INSTRUCTIONS[difficulty] || QUIZ_DIFFICULTY_INSTRUCTIONS.mixed;

  return `Study coach building a short practice quiz strictly from the material below.

DIFFICULTY REQUIREMENT (read this first, follow it for every single question): ${difficultyInstruction}

Multiple-choice questions, each with "question", "choices" (exactly 4 strings), "correctIndex"
(0-based index of the correct choice — double-check it matches "explanation"), "explanation"
(max 1 sentence), and "difficulty" ("easy", "medium", or "hard"). Before writing each question, re-read
the difficulty requirement above and make sure this specific question satisfies it.
The "quiz" array MUST contain exactly ${n} items — not fewer, not more.

Stay strictly within the material given. JSON only, no markdown fences, no extra text. The example below
shows only 1 item but you MUST output ${n} — keep going:
{"quiz":[{"question":"...","choices":["...","...","...","..."],"correctIndex":0,"explanation":"...","difficulty":"easy"}, ... ${n - 1} more ...]}

MATERIAL:
"""
${sourceText}
"""`;
}

export function apMcqPrompt(subject) {
  return `You are an experienced AP exam question writer. Write exactly 5 multiple-choice questions in the
style, rigor, and format of the real AP ${subject} exam, drawing from across the official AP ${subject}
course framework (not just one topic) so the set covers a range of major units.

Each question needs:
- "question": a realistic AP-style question stem for this subject
- "choices": exactly 4 answer options as strings, all plausible (no giveaway wording)
- "correctIndex": 0-based index of the correct choice — double-check it matches "explanation"
- "explanation": 1-2 sentences on why that answer is correct

The "mcqs" array MUST contain exactly 5 items — not fewer, not more.

JSON only, no markdown fences, no extra text. The example below shows only 1 item but you MUST output 5 —
keep going, do not stop early:
{"mcqs":[{"question":"...","choices":["...","...","...","..."],"correctIndex":0,"explanation":"..."}, ... 4 more ...]}`;
}

export function apFrqPrompt(subject) {
  return `You are an experienced AP exam question writer. Write exactly 2 free-response questions (FRQs) in
the style, rigor, structure, and length typical of the real AP ${subject} exam.

Each needs:
- "prompt": the full free-response question text, matching how real AP ${subject} FRQs are phrased and
  structured (parts labeled (a)/(b)/(c) if that's how this subject's FRQs are normally structured)
- "rubric": 3-5 short bullet points (as an array of strings) describing exactly what a high-scoring response
  must include — written the way real AP scoring guidelines describe earning points
- "sampleResponse": a strong, exemplary answer that would earn full or near-full credit, written the way a
  well-prepared student would actually answer it (not just a summary of the rubric)

The "frqs" array MUST contain exactly 2 items — not fewer, not more.

JSON only, no markdown fences, no extra text. The example below shows only 1 item but you MUST output 2 —
keep going:
{"frqs":[{"prompt":"...","rubric":["...","...","..."],"sampleResponse":"..."}, ... 1 more ...]}`;
}

export function apFrqGradePrompt(subject, frqPrompt, rubric, response) {
  const rubricList = rubric.map((r, i) => `${i + 1}. ${r}`).join('\n');
  return `You are an experienced AP ${subject} exam grader using the official-style scoring rubric below.

FREE RESPONSE QUESTION:
"""
${frqPrompt}
"""

SCORING RUBRIC (award each point independently):
${rubricList}

STUDENT'S RESPONSE:
"""
${response}
"""

For each of the ${rubric.length} rubric points above, IN ORDER, decide whether the student's response
earns that specific point. Be a fair but genuine grader: award a point only when the response actually
demonstrates it, not just mentions related words. Also write "overallFeedback": 2-3 sentences,
encouraging but honest, naming the single biggest thing that would improve the response.

JSON only, no markdown fences, no extra text. Return exactly ${rubric.length} items in "rubricResults",
in the same order as the rubric points listed above:
{"rubricResults":[{"earned":true,"note":"..."}, ... ${rubric.length} items total ...],"overallFeedback":"..."}`;
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
