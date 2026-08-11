const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

export async function requestBreakdown({ text, file }) {
  const form = new FormData();
  if (text) form.append('text', text);
  if (file) form.append('file', file);

  const res = await fetch(`${API_BASE}/breakdown`, { method: 'POST', body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to break down material.');
  return data;
}

export async function sendChatMessage({ sourceText, history, message }) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceText, history, message }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get a reply.');
  return data.reply;
}
