import { Router } from 'express';
import db from '../services/db.js';
import requireAuth from '../middleware/requireAuth.js';

const router = Router();
router.use(requireAuth);

const listStmt = db.prepare(
  'SELECT id, topic, tasks, completed, created_at, updated_at FROM study_sessions WHERE user_id = ? ORDER BY updated_at DESC'
);
const getStmt = db.prepare('SELECT * FROM study_sessions WHERE id = ? AND user_id = ?');
const insertStmt = db.prepare(
  `INSERT INTO study_sessions (user_id, topic, source_text, tasks, completed, flashcards, created_at, updated_at)
   VALUES (?, ?, ?, ?, '[]', NULL, ?, ?)`
);
const updateStmt = db.prepare(
  'UPDATE study_sessions SET completed = ?, flashcards = ?, updated_at = ? WHERE id = ? AND user_id = ?'
);
const deleteStmt = db.prepare('DELETE FROM study_sessions WHERE id = ? AND user_id = ?');

router.get('/', (req, res) => {
  const rows = listStmt.all(req.userId);
  const sessions = rows.map((row) => {
    const tasks = JSON.parse(row.tasks);
    const completed = JSON.parse(row.completed);
    return {
      id: row.id,
      topic: row.topic,
      taskCount: tasks.length,
      completedCount: completed.length,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
  res.json({ sessions });
});

router.post('/', (req, res) => {
  const { topic, sourceText, tasks } = req.body;
  if (!topic || !sourceText || !Array.isArray(tasks)) {
    return res.status(400).json({ error: 'topic, sourceText, and tasks are required.' });
  }

  const now = new Date().toISOString();
  const info = insertStmt.run(req.userId, topic, sourceText, JSON.stringify(tasks), now, now);

  res.status(201).json({
    id: info.lastInsertRowid,
    topic,
    sourceText,
    tasks,
    completed: [],
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
    tasks: JSON.parse(row.tasks),
    completed: JSON.parse(row.completed),
    flashcards: row.flashcards ? JSON.parse(row.flashcards) : null,
  });
});

router.patch('/:id', (req, res) => {
  const existing = getStmt.get(req.params.id, req.userId);
  if (!existing) return res.status(404).json({ error: 'Session not found.' });

  const completed = req.body.completed !== undefined ? JSON.stringify(req.body.completed) : existing.completed;
  const flashcards =
    req.body.flashcards !== undefined ? JSON.stringify(req.body.flashcards) : existing.flashcards;

  updateStmt.run(completed, flashcards, new Date().toISOString(), req.params.id, req.userId);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  const info = deleteStmt.run(req.params.id, req.userId);
  if (info.changes === 0) return res.status(404).json({ error: 'Session not found.' });
  res.json({ ok: true });
});

export default router;
