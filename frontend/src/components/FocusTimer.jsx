import { useEffect, useRef, useState } from 'react';

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function FocusTimer({ task, onFinish }) {
  const totalSeconds = task.minutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setSecondsLeft(totalSeconds);
    setRunning(false);
  }, [task, totalSeconds]);

  useEffect(() => {
    if (!running) return undefined;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');
  const isFinished = secondsLeft === 0;
  const fraction = totalSeconds ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const dashOffset = CIRCUMFERENCE * (1 - fraction);

  return (
    <div className="card focus-timer-card">
      <span className="focus-label">⏳ Focusing on</span>
      <h3>{task.title}</h3>
      <p className="task-summary">{task.summary}</p>

      <div className="timer-ring-wrap">
        <svg width="180" height="180" viewBox="0 0 180 180" className={`timer-ring ${running ? 'is-running' : ''}`}>
          <circle className="timer-ring-track" cx="90" cy="90" r={RADIUS} />
          <circle
            className="timer-ring-progress"
            cx="90"
            cy="90"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="timer-time" aria-live="polite">
          {isFinished ? '🎉' : `${minutes}:${seconds}`}
        </div>
      </div>

      {task.memoryTrick && (
        <div className="memory-trick-callout">
          <span className="memory-trick-icon">💡</span>
          {task.memoryTrick}
        </div>
      )}

      {isFinished ? (
        <>
          <p className="finished-message">Nice work! Take a short breather before the next one.</p>
          <button className="primary" onClick={onFinish}>
            ✅ Mark done &amp; continue
          </button>
        </>
      ) : (
        <div className="timer-controls">
          <button className="primary" onClick={() => setRunning((r) => !r)}>
            {running ? '⏸ Pause' : secondsLeft === totalSeconds ? '▶ Start' : '▶ Resume'}
          </button>
          <button className="secondary" onClick={() => setSecondsLeft(totalSeconds)}>
            ↺ Reset
          </button>
        </div>
      )}
    </div>
  );
}
