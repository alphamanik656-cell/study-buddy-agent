import { useEffect, useState } from 'react';
import { requestFlashcards } from '../api';

export default function FlashcardsQuiz({ sourceText }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('flashcards');

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceText]);

  async function generate() {
    setLoading(true);
    setError('');
    try {
      const result = await requestFlashcards({ sourceText });
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card cards-card">
      <div className="cards-tabs">
        <button
          className={`tab ${mode === 'flashcards' ? 'active' : ''}`}
          onClick={() => setMode('flashcards')}
        >
          📇 Flashcards
        </button>
        <button className={`tab ${mode === 'quiz' ? 'active' : ''}`} onClick={() => setMode('quiz')}>
          📝 Quiz
        </button>
        <button className="link" onClick={generate} disabled={loading}>
          ↺ Regenerate
        </button>
      </div>

      {loading && <p className="task-summary">Generating {mode === 'flashcards' ? 'flashcards' : 'quiz'}…</p>}

      {error && (
        <>
          <p className="error">⚠️ {error}</p>
          <button className="secondary" onClick={generate}>
            Retry
          </button>
        </>
      )}

      {!loading && !error && data && (
        mode === 'flashcards' ? <FlashcardDeck cards={data.flashcards} /> : <Quiz questions={data.quiz} />
      )}
    </div>
  );
}

function FlashcardDeck({ cards }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!cards.length) return <p className="task-summary">No flashcards generated — try regenerating.</p>;
  const card = cards[index];

  function go(delta) {
    setFlipped(false);
    setIndex((i) => (i + delta + cards.length) % cards.length);
  }

  return (
    <div className="flashcard-wrap">
      <span className="progress-label">
        {index + 1} / {cards.length}
      </span>

      <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped((f) => !f)}>
        <div className="flashcard-inner">
          <div className="flashcard-face flashcard-front">{card.front}</div>
          <div className="flashcard-face flashcard-back">{card.back}</div>
        </div>
      </div>
      <p className="flashcard-hint">Tap the card to flip</p>

      <div className="timer-controls">
        <button className="secondary" onClick={() => go(-1)}>
          ← Prev
        </button>
        <button className="secondary" onClick={() => go(1)}>
          Next →
        </button>
      </div>
    </div>
  );
}

function Quiz({ questions }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!questions.length) return <p className="task-summary">No quiz questions generated — try regenerating.</p>;

  if (finished) {
    return (
      <div className="quiz-result">
        <p className="finished-message">
          🎉 You scored {score} / {questions.length}
        </p>
        <button
          className="primary"
          onClick={() => {
            setIndex(0);
            setSelected(null);
            setScore(0);
            setFinished(false);
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  const q = questions[index];

  function choose(i) {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.correctIndex) setScore((s) => s + 1);
  }

  function next() {
    if (index + 1 >= questions.length) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  }

  return (
    <div className="quiz-wrap">
      <span className="progress-label">
        Question {index + 1} / {questions.length}
      </span>
      <p className="quiz-question">{q.question}</p>

      <div className="quiz-choices">
        {q.choices.map((choice, i) => {
          let cls = 'quiz-choice';
          if (selected !== null && i === q.correctIndex) cls += ' correct';
          else if (selected === i) cls += ' incorrect';
          return (
            <button key={i} className={cls} onClick={() => choose(i)} disabled={selected !== null}>
              {choice}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <>
          <p className="quiz-explanation">💬 {q.explanation}</p>
          <button className="primary" onClick={next}>
            {index + 1 >= questions.length ? 'See score' : 'Next question'}
          </button>
        </>
      )}
    </div>
  );
}
