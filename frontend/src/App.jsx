import { useEffect, useState } from 'react';
import AuthScreen from './components/AuthScreen';
import SessionDashboard from './components/SessionDashboard';
import UploadScreen from './components/UploadScreen';
import NotesBreakdown from './components/NotesBreakdown';
import TutorChat from './components/TutorChat';
import FlashcardsQuiz from './components/FlashcardsQuiz';
import {
  createSession,
  getCurrentUser,
  getSession,
  requestBreakdown,
  requestFlashcards,
  requestQuiz,
  signOut,
  updateSession,
} from './api';
import './App.css';

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('dashboard'); // 'dashboard' | 'upload' | 'study'

  const [session, setSession] = useState(null); // { id, topic, sourceText, sections }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('breakdown'); // 'breakdown' | 'cards'
  const [cardsData, setCardsData] = useState(null);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [cardsError, setCardsError] = useState('');
  const [cardsVersion, setCardsVersion] = useState(0);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [quizVersion, setQuizVersion] = useState(0);

  useEffect(() => {
    getCurrentUser()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true));
  }, []);

  async function handleUpload({ text, file }) {
    setLoading(true);
    setError('');
    try {
      const data = await requestBreakdown({ text, file });
      const saved = await createSession({ topic: data.topic, sourceText: data.sourceText, sections: data.sections });
      setSession(saved);
      setScreen('study');
      setView('breakdown');
      loadFlashcards(saved.sourceText); // fire-and-forget: ready by the time the user switches tabs
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function openSession(id) {
    setError('');
    try {
      const data = await getSession(id);
      setSession(data);
      setCardsData(data.flashcards);
      setCardsError('');
      setCardsVersion((v) => v + 1);
      setScreen('study');
      setView('breakdown');
      if (!data.flashcards) loadFlashcards(data.sourceText);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadFlashcards(sourceText) {
    setCardsLoading(true);
    setCardsError('');
    try {
      const data = await requestFlashcards({ sourceText });
      setCardsData(data);
      setCardsVersion((v) => v + 1);
      if (session?.id) updateSession(session.id, { flashcards: data }).catch(() => {});
    } catch (err) {
      setCardsError(err.message);
    } finally {
      setCardsLoading(false);
    }
  }

  async function regenerateQuiz(difficulty, count) {
    if (!session) return;
    setQuizLoading(true);
    setQuizError('');
    try {
      const { quiz } = await requestQuiz({ sourceText: session.sourceText, difficulty, count });
      const next = { ...(cardsData || { flashcards: [] }), quiz };
      setCardsData(next);
      setQuizVersion((v) => v + 1);
      if (session.id) updateSession(session.id, { flashcards: next }).catch(() => {});
    } catch (err) {
      setQuizError(err.message);
    } finally {
      setQuizLoading(false);
    }
  }

  function goToDashboard() {
    setSession(null);
    setError('');
    setView('breakdown');
    setCardsData(null);
    setCardsError('');
    setQuizError('');
    setScreen('dashboard');
  }

  async function handleSignOut() {
    await signOut().catch(() => {});
    setUser(null);
    goToDashboard();
  }

  if (!authChecked) {
    return <main className="app-shell" />;
  }

  if (!user) {
    return (
      <main className="app-shell">
        <AuthScreen onAuthed={setUser} />
      </main>
    );
  }

  if (screen === 'dashboard') {
    return (
      <main className="app-shell">
        <header className="top-bar">
          <span className="brand">🧠 Study Buddy</span>
          <button className="link" onClick={handleSignOut}>
            Sign out
          </button>
        </header>
        <SessionDashboard userEmail={user.email} onStartNew={() => setScreen('upload')} onOpenSession={openSession} />
      </main>
    );
  }

  if (screen === 'upload') {
    return (
      <main className="app-shell">
        <header className="top-bar">
          <span className="brand">🧠 Study Buddy</span>
          <button className="link" onClick={goToDashboard}>
            ← My sessions
          </button>
        </header>
        <UploadScreen onSubmit={handleUpload} loading={loading} error={error} />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="top-bar">
        <span className="brand">🧠 Study Buddy</span>
        <div className="view-toggle">
          <button className={`tab ${view === 'breakdown' ? 'active' : ''}`} onClick={() => setView('breakdown')}>
            📖 Breakdown
          </button>
          <button className={`tab ${view === 'cards' ? 'active' : ''}`} onClick={() => setView('cards')}>
            📇 Flashcards &amp; Quiz
          </button>
        </div>
        <button className="link" onClick={goToDashboard}>
          📚 My sessions
        </button>
      </header>

      {view === 'breakdown' ? (
        <div className="study-layout">
          <NotesBreakdown topic={session.topic} sections={session.sections} />
          <div className="side-column">
            <TutorChat sourceText={session.sourceText} />
          </div>
        </div>
      ) : (
        <FlashcardsQuiz
          key={cardsVersion}
          data={cardsData}
          loading={cardsLoading}
          error={cardsError}
          onRegenerate={() => loadFlashcards(session.sourceText)}
          quizLoading={quizLoading}
          quizError={quizError}
          quizVersion={quizVersion}
          onRegenerateQuiz={regenerateQuiz}
        />
      )}
    </main>
  );
}
