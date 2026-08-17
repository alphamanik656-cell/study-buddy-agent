import { Router } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { generateText, generateFromImage } from '../services/ollama.js';
import {
  ocrPrompt,
  breakdownPrompt,
  flashcardsPrompt,
  quizPrompt,
  apMcqPrompt,
  apFrqPrompt,
  tutorSystemPrompt,
} from '../services/prompts.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

function extractJson(raw) {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Model did not return JSON');
  const slice = raw.slice(start, end + 1);

  try {
    return JSON.parse(slice);
  } catch (err) {
    // Trailing commas before a closing ] or } are the single most common LLM JSON mistake - worth
    // one repair attempt before giving up and letting the caller retry the whole generation.
    try {
      return JSON.parse(slice.replace(/,\s*([\]}])/g, '$1'));
    } catch {
      throw err;
    }
  }
}

// Small local models occasionally under-generate (e.g. return 1-2 tasks instead of the requested 5)
// or return outright malformed JSON. A couple of automatic retries catch most of those cases
// without slowing down the common, already-correct case.
async function generateJsonWithRetry(prompt, opts, isValid) {
  let parsed = null;
  let lastError = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const raw = await generateText(prompt, opts);
      const candidate = extractJson(raw);
      parsed = candidate;
      if (isValid(candidate)) return candidate;
    } catch (err) {
      lastError = err;
    }
  }

  if (parsed) return parsed; // best-effort: parsed but didn't fully satisfy isValid
  throw lastError || new Error('Model did not return usable JSON after multiple attempts.');
}

async function extractSourceText(req) {
  if (req.body.text && req.body.text.trim()) {
    return req.body.text.trim();
  }

  const file = req.file;
  if (!file) {
    const err = new Error('Provide either "text" or a file upload.');
    err.status = 400;
    throw err;
  }

  if (file.mimetype === 'application/pdf') {
    const parsed = await pdfParse(file.buffer);
    return parsed.text.trim();
  }

  if (file.mimetype.startsWith('image/')) {
    const base64 = file.buffer.toString('base64');
    const transcription = await generateFromImage(ocrPrompt(), base64);
    return transcription.trim();
  }

  if (file.mimetype === 'text/plain') {
    return file.buffer.toString('utf-8').trim();
  }

  const err = new Error(`Unsupported file type: ${file.mimetype}`);
  err.status = 400;
  throw err;
}

// A trailing-comma repair can turn genuinely broken model output into technically-parseable JSON
// that's still garbage (e.g. a stray string sitting where a question object should be, or a
// choices array with the wrong length from a truncated/mangled generation). Length checks alone
// don't catch this - each item's actual shape has to be validated before it's trusted.
function isWellFormedMcq(item) {
  return (
    item &&
    typeof item.question === 'string' &&
    item.question.trim().length > 0 &&
    Array.isArray(item.choices) &&
    item.choices.length === 4 &&
    item.choices.every((c) => typeof c === 'string' && c.trim().length > 0)
  );
}
function sanitizeMcqs(items) {
  return Array.isArray(items) ? items.filter(isWellFormedMcq) : [];
}

function isWellFormedFrq(item) {
  return (
    item &&
    typeof item.prompt === 'string' &&
    item.prompt.trim().length > 0 &&
    Array.isArray(item.rubric) &&
    item.rubric.length > 0 &&
    item.rubric.every((r) => typeof r === 'string' && r.trim().length > 0) &&
    typeof item.sampleResponse === 'string' &&
    item.sampleResponse.trim().length > 0
  );
}
function sanitizeFrqs(items) {
  return Array.isArray(items) ? items.filter(isWellFormedFrq) : [];
}

// The model's "explanation" is often a near-verbatim copy of the correct choice text, but the
// "correctIndex" it points to doesn't always match. Where the explanation clearly matches a
// different choice than the claimed index, trust the text match over the index.
function normalize(s) {
  return String(s).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}
function fixQuizAnswers(quiz) {
  if (!Array.isArray(quiz)) return quiz;
  return quiz.map((q) => {
    if (!Array.isArray(q.choices)) return q;

    let correctIndex = q.correctIndex;

    if (typeof q.explanation === 'string') {
      const explNorm = normalize(q.explanation);
      if (explNorm) {
        const matchIndex = q.choices.findIndex((c) => {
          const choiceNorm = normalize(c);
          return choiceNorm && (explNorm.includes(choiceNorm) || choiceNorm.includes(explNorm));
        });
        if (matchIndex !== -1) correctIndex = matchIndex;
      }
    }

    // Out-of-range index would render as a blank "correct" answer in the UI - clamp as a last resort.
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= q.choices.length) {
      correctIndex = 0;
    }

    return correctIndex === q.correctIndex ? q : { ...q, correctIndex };
  });
}

// Small local models occasionally leak the prompt's own instructions into the "topic" field
// (e.g. "Study coach for ADHD/neurodivergent students") instead of naming the material's subject.
const LEAKED_TOPIC_PATTERN = /adhd|neurodivergent|study coach|these instructions/i;
function sanitizeTopic(topic) {
  if (!topic || LEAKED_TOPIC_PATTERN.test(topic)) return 'Study session';
  return topic;
}

const QUIZ_DIFFICULTIES = new Set(['easy', 'medium', 'hard', 'mixed']);

// The model doesn't reliably honor "make every question X difficulty" - it writes a mix even when
// asked for one level throughout. The prompt still steers the actual question content toward the
// requested difficulty, but the *label* shown to the student must always match what they asked
// for, so it's enforced here rather than trusting the model's own per-question tagging.
function applyRequestedDifficulty(quiz, difficulty) {
  if (difficulty === 'mixed') {
    return quiz.map((q) => ({ ...q, difficulty: QUIZ_DIFFICULTIES.has(q.difficulty) ? q.difficulty : 'medium' }));
  }
  return quiz.map((q) => ({ ...q, difficulty }));
}

router.post('/breakdown', upload.single('file'), async (req, res, next) => {
  try {
    const sourceText = await extractSourceText(req);
    if (!sourceText) {
      return res.status(400).json({ error: 'No readable text found in the submitted material.' });
    }

    const parsed = await generateJsonWithRetry(
      breakdownPrompt(sourceText),
      { json: true, temperature: 0.5, maxTokens: 1100 },
      (p) => Array.isArray(p.sections) && p.sections.length >= 4
    );

    const sections = (Array.isArray(parsed.sections) ? parsed.sections : []).map((s) => ({
      ...s,
      keyTerms: Array.isArray(s.keyTerms) ? s.keyTerms.filter((t) => typeof t === 'string' && t.trim()) : [],
    }));

    res.json({
      sourceText,
      topic: sanitizeTopic(parsed.topic),
      sections,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/flashcards', async (req, res, next) => {
  try {
    const { sourceText } = req.body;
    if (!sourceText) {
      return res.status(400).json({ error: 'sourceText is required.' });
    }

    const parsed = await generateJsonWithRetry(
      flashcardsPrompt(sourceText),
      { json: true, temperature: 0.5 },
      (p) => Array.isArray(p.flashcards) && p.flashcards.length >= 3 && sanitizeMcqs(p.quiz).length >= 2
    );

    res.json({
      flashcards: Array.isArray(parsed.flashcards) ? parsed.flashcards : [],
      quiz: applyRequestedDifficulty(fixQuizAnswers(sanitizeMcqs(parsed.quiz)), 'mixed'),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/quiz', async (req, res, next) => {
  try {
    const { sourceText } = req.body;
    if (!sourceText) {
      return res.status(400).json({ error: 'sourceText is required.' });
    }

    const difficulty = QUIZ_DIFFICULTIES.has(req.body.difficulty) ? req.body.difficulty : 'mixed';
    const count = Math.max(2, Math.min(10, Math.round(Number(req.body.count)) || 3));

    const parsed = await generateJsonWithRetry(
      quizPrompt(sourceText, { difficulty, count }),
      { json: true, temperature: 0.5, maxTokens: 120 * count + 200 },
      (p) => sanitizeMcqs(p.quiz).length >= count
    );

    const quiz = applyRequestedDifficulty(fixQuizAnswers(sanitizeMcqs(parsed.quiz)), difficulty);
    res.json({ quiz });
  } catch (err) {
    next(err);
  }
});

// AI-generated practice only - never scraped/reproduced from College Board. This whitelist keeps
// the subject name (interpolated into the prompt) constrained to a known-good, pre-approved list.
const AP_SUBJECTS = new Set([
  // Arts
  'AP 2-D Art and Design',
  'AP 3-D Art and Design',
  'AP Drawing',
  'AP Art History',
  'AP Music Theory',
  // English
  'AP English Language and Composition',
  'AP English Literature and Composition',
  // History and Social Sciences
  'AP African American Studies',
  'AP Comparative Government and Politics',
  'AP European History',
  'AP Human Geography',
  'AP Macroeconomics',
  'AP Microeconomics',
  'AP Psychology',
  'AP United States Government and Politics',
  'AP United States History',
  'AP World History',
  // Math and Computer Science
  'AP Calculus AB',
  'AP Calculus BC',
  'AP Computer Science A',
  'AP Computer Science Principles',
  'AP Precalculus',
  'AP Statistics',
  // Sciences
  'AP Biology',
  'AP Chemistry',
  'AP Environmental Science',
  'AP Physics 1',
  'AP Physics 2',
  'AP Physics C: Electricity and Magnetism',
  'AP Physics C: Mechanics',
  // World Languages and Cultures
  'AP Chinese Language and Culture',
  'AP French Language and Culture',
  'AP German Language and Culture',
  'AP Italian Language and Culture',
  'AP Japanese Language and Culture',
  'AP Latin',
  'AP Spanish Language and Culture',
  'AP Spanish Literature and Culture',
  // AP Capstone
  'AP Research',
  'AP Seminar',
  // AP Career Kickstart
  'AP Business with Personal Finance',
  'AP Cybersecurity',
  'AP Networking',
]);

router.post('/ap/mcq', async (req, res, next) => {
  try {
    const { subject } = req.body;
    if (!AP_SUBJECTS.has(subject)) {
      return res.status(400).json({ error: 'Unknown AP subject.' });
    }

    const parsed = await generateJsonWithRetry(
      apMcqPrompt(subject),
      { json: true, temperature: 0.6, maxTokens: 900 },
      (p) => sanitizeMcqs(p.mcqs).length >= 4
    );

    res.json({ mcqs: fixQuizAnswers(sanitizeMcqs(parsed.mcqs)) });
  } catch (err) {
    next(err);
  }
});

router.post('/ap/frq', async (req, res, next) => {
  try {
    const { subject } = req.body;
    if (!AP_SUBJECTS.has(subject)) {
      return res.status(400).json({ error: 'Unknown AP subject.' });
    }

    const parsed = await generateJsonWithRetry(
      apFrqPrompt(subject),
      { json: true, temperature: 0.6, maxTokens: 1300 },
      (p) => sanitizeFrqs(p.frqs).length >= 1
    );

    res.json({ frqs: sanitizeFrqs(parsed.frqs) });
  } catch (err) {
    next(err);
  }
});

router.post('/chat', async (req, res, next) => {
  try {
    const { sourceText, history = [], message } = req.body;
    if (!sourceText || !message) {
      return res.status(400).json({ error: 'sourceText and message are required.' });
    }

    const transcript = history
      .slice(-8)
      .map((turn) => `${turn.role === 'user' ? 'Student' : 'Tutor'}: ${turn.content}`)
      .join('\n');

    const prompt = `${tutorSystemPrompt(sourceText)}\n\n${transcript ? transcript + '\n' : ''}Student: ${message}\nTutor:`;

    const reply = await generateText(prompt);
    res.json({ reply: reply.trim() });
  } catch (err) {
    next(err);
  }
});

export default router;
