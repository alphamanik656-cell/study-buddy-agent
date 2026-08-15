import { useState } from 'react';
import UploadScreen from './components/UploadScreen';
import TaskList from './components/TaskList';
import FocusTimer from './components/FocusTimer';
import TutorChat from './components/TutorChat';
import FlashcardsQuiz from './components/FlashcardsQuiz';
import { requestBreakdown } from './api';
import './App.css';

export default function App() {
  const [session, setSession] = useState(null);
  const [completed, setCompleted] = useState(new Set());
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('tasks');

  async function handleUpload({ text, file }) {
    setLoading(true);
    setError('');
    try {
      const data = await requestBreakdown({ text, file });
      setSession(data);
      setCompleted(new Set());
      setActiveIndex(data.tasks.length ? 0 : null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleComplete(index) {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleTimerFinish() {
    if (activeIndex === null) return;
    setCompleted((prev) => new Set(prev).add(activeIndex));
    const nextIndex = session.tasks.findIndex((_, i) => i > activeIndex && !completed.has(i));
    setActiveIndex(nextIndex === -1 ? null : nextIndex);
  }

  function startOver() {
    setSession(null);
    setCompleted(new Set());
    setActiveIndex(null);
    setError('');
    setView('tasks');
  }

  if (!session) {
    return (
      <main className="app-shell">
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
        <button className="link" onClick={startOver}>
          ↺ Start over
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
        <FlashcardsQuiz sourceText={session.sourceText} />
      )}
    </main>
  );
}
