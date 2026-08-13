const DIFFICULTY_LABEL = { easy: 'easy', medium: 'medium', hard: 'hard' };

export default function TaskList({ topic, tasks, completed, activeIndex, onSelectTask, onToggleComplete }) {
  const doneCount = completed.size;

  return (
    <div className="card task-list-card">
      <div className="task-list-header">
        <h2>📋 {topic}</h2>
        <span className="progress-label">
          {doneCount} / {tasks.length} done
        </span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${tasks.length ? (doneCount / tasks.length) * 100 : 0}%` }}
        />
      </div>

      <ul className="task-list">
        {tasks.map((task, i) => {
          const isDone = completed.has(i);
          const isActive = activeIndex === i;
          return (
            <li key={i} className={`task-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
              <label className="task-checkbox">
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => onToggleComplete(i)}
                />
              </label>
              <button className="task-body" onClick={() => onSelectTask(i)}>
                <span className="task-title">{task.title}</span>
                <span className="task-summary">{task.summary}</span>
                <span className="task-meta">
                  <span className="meta-chip">⏱ {task.minutes} min</span>
                  <span className={`difficulty-badge difficulty-${task.difficulty}`}>
                    {DIFFICULTY_LABEL[task.difficulty] || task.difficulty}
                  </span>
                </span>
                {task.memoryTrick && (
                  <span className="memory-trick">
                    <span className="memory-trick-icon">💡</span>
                    {task.memoryTrick}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
