import { useEffect, useState } from 'react';
import AuthScreen from './components/AuthScreen';
import SessionDashboard from './components/SessionDashboard';
import UploadScreen from './components/UploadScreen';
import TaskList from './components/TaskList';
import FocusTimer from './components/FocusTimer';
import TutorChat from './components/TutorChat';
import FlashcardsQuiz from './components/FlashcardsQuiz';
import {
  createSession,
  getCurrentUser,
  getSession,
  requestBreakdown,
  requestFlashcards,
  signOut,
  updateSession,
} from './api';
import './App.css';

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('dashboard'); // 'dashboard' | 'upload' | 'study'

  const [session, setSession] = useState(null); // { id, topic, sourceText, tasks }
  const [completed, setCompleted] = useState(new Set());
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('tasks');
  const [cardsData, setCardsData] = useState(null);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [cardsError, setCardsError] = useState('');
  const [cardsVersion, setCardsVersion] = useState(0);

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
      const saved = await createSession({ topic: data.topic, sourceText: data.sourceText, tasks: data.tasks });
      setSession(saved);
      setCompleted(new Set());
      setActiveIndex(saved.tasks.length ? 0 : null);
      setScreen('study');
      setView('tasks');
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
      setCompleted(new Set(data.completed));
      const firstIncomplete = data.tasks.findIndex((_, i) => !data.completed.includes(i));
      setActiveIndex(firstIncomplete === -1 ? null : firstIncomplete);
      setCardsData(data.flashcards);
      setCardsError('');
      setCardsVersion((v) => v + 1);
      setScreen('study');
      setView('tasks');
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

  function persistCompleted(nextSet) {
    if (session?.id) updateSession(session.id, { completed: Array.from(nextSet) }).catch(() => {});
  }

  function toggleComplete(index) {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      persistCompleted(next);
      return next;
    });
  }

  function handleTimerFinish() {
    if (activeIndex === null) return;
    setCompleted((prev) => {
      const next = new Set(prev).add(activeIndex);
      persistCompleted(next);
      const nextIndex = session.tasks.findIndex((_, i) => i > activeIndex && !next.has(i));
      setActiveIndex(nextIndex === -1 ? null : nextIndex);
      return next;
    });
  }

  function goToDashboard() {
    setSession(null);
    setCompleted(new Set());
    setActiveIndex(null);
    setError('');
    setView('tasks');
    setCardsData(null);
    setCardsError('');
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

  const activeTask = activeIndex !== null ? session.tasks[activeIndex] : null;

  return (
    <main className="app-shell">
      <header className="top-bar">
        <span className="brand">🧠 Study Buddy</span>
        <div className="view-toggle">
          <button className={`tab ${view === 'tasks' ? 'active' : ''}`} onClick={() => setView('tasks')}>
            📋 Tasks
          </button>
          <button className={`tab ${view === 'cards' ? 'active' : ''}`} onClick={() => setView('cards')}>
            📇 Flashcards &amp; Quiz
          </button>
        </div>
        <button className="link" onClick={goToDashboard}>
          📚 My sessions
        </button>
      </header>

      {view === 'tasks' ? (
        <div className="study-layout">
          <TaskList
            topic={session.topic}
            tasks={session.tasks}
            completed={completed}
            activeIndex={activeIndex}
            onSelectTask={setActiveIndex}
            onToggleComplete={toggleComplete}
          />

          <div className="side-column">
            {activeTask ? (
              <FocusTimer key={activeIndex} task={activeTask} onFinish={handleTimerFinish} />
            ) : (
              <div className="card focus-timer-card">
                <p className="finished-message">🎉 All tasks complete for this session!</p>
              </div>
            )}
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
        />
      )}
    </main>
  );
}
