import { Router } from 'express';
import db from '../services/db.js';
import { hashPassword, verifyPassword, generateToken, TOKEN_TTL_MS } from '../services/auth.js';
import requireAuth from '../middleware/requireAuth.js';

const router = Router();

const insertUser = db.prepare(
  'INSERT INTO users (email, password_hash, password_salt, created_at) VALUES (?, ?, ?, ?)'
);
const findUserByEmail = db.prepare('SELECT * FROM users WHERE email = ?');
const findUserById = db.prepare('SELECT id, email FROM users WHERE id = ?');
const insertToken = db.prepare('INSERT INTO auth_tokens (token, user_id, expires_at) VALUES (?, ?, ?)');
const deleteToken = db.prepare('DELETE FROM auth_tokens WHERE token = ?');

// In production the frontend (Vercel) and backend (Render) live on different domains, so the
// cookie must be sameSite:"none" + secure to be sent on cross-site fetch requests. Locally both
// run on http://localhost, where secure cookies don't work at all, so lax + non-secure is used.
const IS_PROD = process.env.NODE_ENV === 'production';
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: IS_PROD ? 'none' : 'lax',
  secure: IS_PROD,
  maxAge: TOKEN_TTL_MS,
};

function issueSession(res, userId) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();
  insertToken.run(token, userId, expiresAt);
  res.cookie('session_token', token, COOKIE_OPTS);
}

const GUEST_EMAIL_PATTERN = /^guest-[0-9a-f]+@studybuddy\.local$/;
function displayEmail(email) {
  return GUEST_EMAIL_PATTERN.test(email) ? 'Guest' : email;
}

router.post('/signup', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (findUserByEmail.get(normalizedEmail)) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const { hash, salt } = hashPassword(password);
  const info = insertUser.run(normalizedEmail, hash, salt, new Date().toISOString());

  issueSession(res, info.lastInsertRowid);
  res.status(201).json({ user: { id: info.lastInsertRowid, email: normalizedEmail, isGuest: false } });
});

// Lets someone try the full app - saved sessions included - without creating a real account.
// Under the hood it's just a normal user row with a random, never-shown email/password, so every
// other route (breakdown, flashcards, quiz, chat, sessions) works completely unchanged.
router.post('/guest', (req, res) => {
  const randomEmail = `guest-${generateToken().slice(0, 16)}@studybuddy.local`;
  const { hash, salt } = hashPassword(generateToken());
  const info = insertUser.run(randomEmail, hash, salt, new Date().toISOString());

  issueSession(res, info.lastInsertRowid);
  res.status(201).json({ user: { id: info.lastInsertRowid, email: 'Guest', isGuest: true } });
});

router.post('/signin', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = findUserByEmail.get(email.trim().toLowerCase());
  if (!user || !verifyPassword(password, user.password_hash, user.password_salt)) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  issueSession(res, user.id);
  res.json({ user: { id: user.id, email: user.email, isGuest: false } });
});

router.post('/signout', (req, res) => {
  const token = req.cookies?.session_token;
  if (token) deleteToken.run(token);
  res.clearCookie('session_token', { httpOnly: true, sameSite: COOKIE_OPTS.sameSite, secure: COOKIE_OPTS.secure });
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  const user = findUserById.get(req.userId);
  if (!user) return res.status(401).json({ error: 'Not signed in.' });
  res.json({ user: { ...user, email: displayEmail(user.email), isGuest: GUEST_EMAIL_PATTERN.test(user.email) } });
});

export default router;
