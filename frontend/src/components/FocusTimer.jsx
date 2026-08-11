import { useEffect, useRef, useState } from 'react';

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
  const progress = totalSeconds ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  return (
    <div className="card focus-timer-card">
      <span className="focus-label">Focusing on</span>
      <h3>{task.title}</h3>
      <p className="task-summary">{task.summary}</p>

      <div className="timer-ring-wrap">
        <div className="timer-time" aria-live="polite">
          {isFinished ? '🎉' : `${minutes}:${seconds}`}
        </div>
      </div>
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {isFinished ? (
        <>
          <p className="finished-message">Nice work! Take a short breather before the next one.</p>
          <button className="primary" onClick={onFinish}>
            Mark done &amp; continue
          </button>
        </>
      ) : (
        <div className="timer-controls">
          <button className="primary" onClick={() => setRunning((r) => !r)}>
            {running ? 'Pause' : secondsLeft === totalSeconds ? 'Start' : 'Resume'}
          </button>
          <button className="secondary" onClick={() => setSecondsLeft(totalSeconds)}>
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
