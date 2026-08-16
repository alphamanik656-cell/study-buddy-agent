import { useEffect, useState } from 'react';
import { deleteSession, listSessions } from '../api';

export default function SessionDashboard({ userEmail, onStartNew, onOpenSession, onOpenAPPractice }) {
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setError('');
    try {
      setSessions(await listSessions());
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this session? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="upload-page">
      <div className="hero">
        <div className="hero-mascot" aria-hidden="true">
          👋
        </div>
        <h1>Welcome back</h1>
        <p className="subtitle">
          Signed in as {userEmail}. Start a new session, or pick up a previous one below.
        </p>
      </div>

      <div className="card upload-card dashboard-actions">
        <button className="primary big" onClick={onStartNew}>
          ✨ Start a new session
        </button>
        <button className="secondary" style={{ width: '100%' }} onClick={onOpenAPPractice}>
          🎓 AP Practice
        </button>
      </div>

      {error && <p className="error">⚠️ {error}</p>}

      {sessions === null ? (
        <p className="task-summary">Loading your sessions…</p>
      ) : sessions.length === 0 ? (
        <p className="task-summary">No previous sessions yet — start one above.</p>
      ) : (
        <div className="card session-list-card">
          <h2 className="session-list-title">📚 Your sessions</h2>
          <ul className="session-list">
            {sessions.map((s) => (
              <li key={s.id} className="session-item">
                <button className="session-item-body" onClick={() => onOpenSession(s.id)}>
                  <span className="task-title">{s.topic}</span>
                  <span className="task-meta">
                    <span className="meta-chip">{s.sectionCount} sections</span>
                    <span className="meta-chip">{new Date(s.updatedAt).toLocaleDateString()}</span>
                  </span>
                </button>
                <button
                  className="secondary session-delete"
                  onClick={() => handleDelete(s.id)}
                  disabled={deletingId === s.id}
                >
                  {deletingId === s.id ? 'Deleting…' : '🗑 Delete'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
