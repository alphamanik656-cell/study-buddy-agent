import { useState } from 'react';
import { signIn, signUp, tryGuest } from '../api';

export default function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { user } = mode === 'signup' ? await signUp({ email, password }) : await signIn({ email, password });
      onAuthed(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGuest() {
    setGuestLoading(true);
    setError('');
    try {
      const { user } = await tryGuest();
      onAuthed(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuestLoading(false);
    }
  }

  return (
    <div className="upload-page">
      <div className="hero">
        <div className="hero-mascot" aria-hidden="true">
          🧠
        </div>
        <h1>Study Buddy</h1>
        <p className="subtitle">
          {mode === 'signup'
            ? 'Create an account to save your study sessions.'
            : 'Sign in to pick up where you left off.'}
        </p>
      </div>

      <div className="card upload-card">
        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="auth-email">
            📧 Email
          </label>
          <input
            id="auth-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-input"
          />

          <label className="field-label" htmlFor="auth-password" style={{ marginTop: 14 }}>
            🔒 Password
          </label>
          <input
            id="auth-password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-input"
          />
          {mode === 'signup' && <p className="flashcard-hint">At least 8 characters.</p>}

          {error && <p className="error">⚠️ {error}</p>}

          <button type="submit" className="primary big" disabled={loading}>
            {loading ? 'One sec…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            className="link"
            onClick={() => {
              setMode(mode === 'signup' ? 'signin' : 'signup');
              setError('');
            }}
          >
            {mode === 'signup' ? 'Sign in' : 'Sign up'}
          </button>
        </p>

        <div className="divider">
          <span>or</span>
        </div>

        <button
          type="button"
          className="secondary"
          style={{ width: '100%' }}
          onClick={handleGuest}
          disabled={guestLoading}
        >
          {guestLoading ? 'One sec…' : '🎓 Try a sample — no sign-up needed'}
        </button>
      </div>
    </div>
  );
}
