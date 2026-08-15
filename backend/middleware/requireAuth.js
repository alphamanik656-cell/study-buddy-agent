import db from '../services/db.js';

const getToken = db.prepare('SELECT user_id, expires_at FROM auth_tokens WHERE token = ?');

export default function requireAuth(req, res, next) {
  const token = req.cookies?.session_token;
  if (!token) {
    return res.status(401).json({ error: 'Not signed in.' });
  }

  const row = getToken.get(token);
  if (!row || new Date(row.expires_at) < new Date()) {
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }

  req.userId = row.user_id;
  next();
}
