import { useState } from 'react';
import QuizSettings from './QuizSettings';
import { requestQuiz } from '../api';

const DIFFICULTY_LABEL = { easy: 'easy', medium: 'medium', hard: 'hard' };

export default function PracticeQuiz({ sourceText }) {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [difficulty, setDifficulty] = useState('mixed');
  const [count, setCount] = useState(3);

  async function generate(chosenDifficulty, chosenCount) {
    setLoading(true);
    setError('');
    try {
      const { quiz } = await requestQuiz({ sourceText, difficulty: chosenDifficulty, count: chosenCount });
      if (!quiz.length) throw new Error('No questions came back — try again.');
      setQuestions(quiz);
      setIndex(0);
      setSelected(null);
      setScore(0);
      setFinished(false);
      setStarted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const settings = (
    <QuizSettings
      difficulty={difficulty}
      setDifficulty={setDifficulty}
      count={count}
      setCount={setCount}
      onGenerate={generate}
      disabled={loading}
      label={loading ? 'Generating…' : started ? '🔄 New quiz' : '🔄 Generate'}
    />
  );

  if (loading) return <p className="task-summary">Generating questions…</p>;

  if (error) {
    return (
      <>
        <p className="error">⚠️ {error}</p>
        {settings}
      </>
    );
  }

  if (!started || !questions.length) {
    return (
      <>
        <p className="task-summary">Pick a difficulty and question count, then generate a quiz from your notes.</p>
        {settings}
      </>
    );
  }

  if (finished) {
    return (
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
      {settings}

      <div className="quiz-header-row">
        <span className="progress-label">
          Question {index + 1} / {questions.length}
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
