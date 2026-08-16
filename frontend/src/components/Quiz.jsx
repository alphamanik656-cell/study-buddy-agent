import { useState } from 'react';

const DIFFICULTY_LABEL = { easy: 'easy', medium: 'medium', hard: 'hard' };

function QuizSettings({ difficulty, setDifficulty, count, setCount, onGenerate, disabled }) {
  return (
    <div className="quiz-settings">
      <label className="quiz-settings-field">
        Difficulty
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} disabled={disabled}>
          <option value="mixed">Mixed</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </label>
      <label className="quiz-settings-field">
        Questions
        <select value={count} onChange={(e) => setCount(Number(e.target.value))} disabled={disabled}>
          <option value={3}>3</option>
          <option value={5}>5</option>
          <option value={10}>10</option>
        </select>
      </label>
      <button className="secondary" onClick={() => onGenerate(difficulty, count)} disabled={disabled}>
        🔄 Generate
      </button>
    </div>
  );
}

export default function Quiz({ questions, loading, error, onRegenerate }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [difficulty, setDifficulty] = useState('mixed');
  const [count, setCount] = useState(questions.length || 3);

  const settings = (
    <QuizSettings
      difficulty={difficulty}
      setDifficulty={setDifficulty}
      count={count}
      setCount={setCount}
      onGenerate={onRegenerate}
      disabled={loading}
    />
  );

  return (
    <div className="card cards-card">
      <h2 className="breakdown-title">📝 Quiz</h2>

      {loading && <p className="task-summary">Generating questions…</p>}

      {!loading && error && (
        <>
          <p className="error">⚠️ {error}</p>
          <button className="secondary" onClick={() => onRegenerate(difficulty, count)}>
            Retry
          </button>
        </>
      )}

      {!loading && !error && !questions.length && (
        <>
          <p className="task-summary">No quiz questions generated — try regenerating.</p>
          {settings}
        </>
      )}

      {!loading && !error && questions.length > 0 && finished && (
        <div className="quiz-result">
          <p className="finished-message">
            🎉 You scored {score} / {questions.length}
          </p>
          <button
            className="secondary"
            onClick={() => {
              setIndex(0);
              setSelected(null);
              setScore(0);
              setFinished(false);
            }}
          >
            ↺ Try again
          </button>
          {settings}
        </div>
      )}

      {!loading && !error && questions.length > 0 && !finished && (
        <QuizQuestionView
          question={questions[index]}
          index={index}
          total={questions.length}
          selected={selected}
          settings={settings}
          onChoose={(i) => {
            if (selected !== null) return;
            setSelected(i);
            if (i === questions[index].correctIndex) setScore((s) => s + 1);
          }}
          onNext={() => {
            if (index + 1 >= questions.length) {
              setFinished(true);
            } else {
              setIndex((i) => i + 1);
              setSelected(null);
            }
          }}
        />
      )}
    </div>
  );
}

function QuizQuestionView({ question: q, index, total, selected, settings, onChoose, onNext }) {
  return (
    <div className="quiz-wrap">
      {settings}

      <div className="quiz-header-row">
        <span className="progress-label">
          Question {index + 1} / {total}
        </span>
        {q.difficulty && (
          <span className={`difficulty-badge difficulty-${q.difficulty}`}>
            {DIFFICULTY_LABEL[q.difficulty] || q.difficulty}
          </span>
        )}
      </div>
      <p className="quiz-question">{q.question}</p>

      <div className="quiz-choices">
        {q.choices.map((choice, i) => {
          let cls = 'quiz-choice';
          if (selected !== null && i === q.correctIndex) cls += ' correct';
          else if (selected === i) cls += ' incorrect';
          return (
            <button key={i} className={cls} onClick={() => onChoose(i)} disabled={selected !== null}>
              {choice}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <>
          <p className="quiz-explanation">💬 {q.explanation}</p>
          <button className="primary" onClick={onNext}>
            {index + 1 >= total ? 'See score' : 'Next question'}
          </button>
        </>
      )}
    </div>
  );
}
