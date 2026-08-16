const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include', ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

function jsonRequest(path, body, method = 'POST') {
  return request(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// --- Auth ---

export function signUp({ email, password }) {
  return jsonRequest('/auth/signup', { email, password });
}

export function signIn({ email, password }) {
  return jsonRequest('/auth/signin', { email, password });
}

export function signOut() {
  return request('/auth/signout', { method: 'POST' });
}

export function getCurrentUser() {
  return request('/auth/me');
}

// --- Study sessions ---

export async function listSessions() {
  const { sessions } = await request('/sessions');
  return sessions;
}

export function createSession({ topic, sourceText, sections }) {
  return jsonRequest('/sessions', { topic, sourceText, sections });
}

export function getSession(id) {
  return request(`/sessions/${id}`);
}

export function updateSession(id, { flashcards }) {
  return jsonRequest(`/sessions/${id}`, { flashcards }, 'PATCH');
}

export function deleteSession(id) {
  return request(`/sessions/${id}`, { method: 'DELETE' });
}

// --- AI generation ---

export async function requestBreakdown({ text, file }) {
  const form = new FormData();
  if (text) form.append('text', text);
  if (file) form.append('file', file);
  return request('/breakdown', { method: 'POST', body: form, credentials: 'include' });
}

export function requestFlashcards({ sourceText }) {
  return jsonRequest('/flashcards', { sourceText });
}

export function requestQuiz({ sourceText, difficulty, count }) {
  return jsonRequest('/quiz', { sourceText, difficulty, count });
}

export async function sendChatMessage({ sourceText, history, message }) {
  const { reply } = await jsonRequest('/chat', { sourceText, history, message });
  return reply;
}
