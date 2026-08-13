import { Router } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { generateText, generateFromImage } from '../services/ollama.js';
import { ocrPrompt, breakdownPrompt, tutorSystemPrompt } from '../services/prompts.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

function extractJson(raw) {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Model did not return JSON');
  return JSON.parse(raw.slice(start, end + 1));
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

router.post('/breakdown', upload.single('file'), async (req, res, next) => {
  try {
    const sourceText = await extractSourceText(req);
    if (!sourceText) {
      return res.status(400).json({ error: 'No readable text found in the submitted material.' });
    }

    const raw = await generateText(breakdownPrompt(sourceText), { json: true, temperature: 0.75 });
    const parsed = extractJson(raw);

    res.json({
      sourceText,
      topic: parsed.topic || 'Study session',
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
    });
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
