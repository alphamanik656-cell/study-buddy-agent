import { useState } from 'react';

export default function Flashcards({ cards, loading, error, onRegenerate }) {
  return (
    <div className="card cards-card">
      <div className="quiz-header-row">
        <h2 className="breakdown-title">📇 Flashcards</h2>
        <button className="link" onClick={onRegenerate} disabled={loading}>
          ↺ Regenerate
        </button>
      </div>

      {loading && <p className="task-summary">Generating flashcards…</p>}

      {error && (
        <>
          <p className="error">⚠️ {error}</p>
          <button className="secondary" onClick={onRegenerate}>
            Retry
          </button>
        </>
      )}

      {!loading && !error && <FlashcardDeck cards={cards} />}
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
