import { Router } from 'express';
import db from '../services/db.js';
import requireAuth from '../middleware/requireAuth.js';

const router = Router();
router.use(requireAuth);

const listStmt = db.prepare(
  'SELECT id, topic, sections, created_at, updated_at FROM study_sessions WHERE user_id = ? ORDER BY updated_at DESC'
);
const getStmt = db.prepare('SELECT * FROM study_sessions WHERE id = ? AND user_id = ?');
const insertStmt = db.prepare(
  `INSERT INTO study_sessions (user_id, topic, source_text, sections, flashcards, created_at, updated_at)
   VALUES (?, ?, ?, ?, NULL, ?, ?)`
);
const updateStmt = db.prepare(
  'UPDATE study_sessions SET flashcards = ?, updated_at = ? WHERE id = ? AND user_id = ?'
);
const deleteStmt = db.prepare('DELETE FROM study_sessions WHERE id = ? AND user_id = ?');

router.get('/', (req, res) => {
  const rows = listStmt.all(req.userId);
  const sessions = rows.map((row) => ({
    id: row.id,
    topic: row.topic,
    sectionCount: JSON.parse(row.sections).length,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
  res.json({ sessions });
});

router.post('/', (req, res) => {
  const { topic, sourceText, sections } = req.body;
  if (!topic || !sourceText || !Array.isArray(sections)) {
    return res.status(400).json({ error: 'topic, sourceText, and sections are required.' });
  }

  const now = new Date().toISOString();
  const info = insertStmt.run(req.userId, topic, sourceText, JSON.stringify(sections), now, now);

  res.status(201).json({
    id: info.lastInsertRowid,
    topic,
    sourceText,
    sections,
    flashcards: null,
  });
});

router.get('/:id', (req, res) => {
  const row = getStmt.get(req.params.id, req.userId);
  if (!row) return res.status(404).json({ error: 'Session not found.' });

  res.json({
    id: row.id,
    topic: row.topic,
    sourceText: row.source_text,
    sections: JSON.parse(row.sections),
    flashcards: row.flashcards ? JSON.parse(row.flashcards) : null,
  });
});

router.patch('/:id', (req, res) => {
  const existing = getStmt.get(req.params.id, req.userId);
  if (!existing) return res.status(404).json({ error: 'Session not found.' });

  const flashcards =
    req.body.flashcards !== undefined ? JSON.stringify(req.body.flashcards) : existing.flashcards;

  updateStmt.run(flashcards, new Date().toISOString(), req.params.id, req.userId);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  const info = deleteStmt.run(req.params.id, req.userId);
  if (info.changes === 0) return res.status(404).json({ error: 'Session not found.' });
  res.json({ ok: true });
});

export default router;
