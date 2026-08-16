import { useState } from 'react';
import QuizSettings from './QuizSettings';
import { requestQuiz } from '../api';

const START_HP = 100;
const DAMAGE_BY_DIFFICULTY = { easy: 15, medium: 25, hard: 40 };
const BOSS_EMOJI = ['🐉', '👹', '🧟', '👾', '🦑', '🐲', '🕷️', '👻'];

function damageFor(question) {
  return DAMAGE_BY_DIFFICULTY[question?.difficulty] || DAMAGE_BY_DIFFICULTY.medium;
}

function pickBossEmoji(topic) {
  const seed = (topic || '').split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return BOSS_EMOJI[seed % BOSS_EMOJI.length];
}

export default function Quiz({ topic, sourceText }) {
  const [phase, setPhase] = useState('settings'); // 'settings' | 'battle' | 'result'
  const [difficulty, setDifficulty] = useState('mixed');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [bossHp, setBossHp] = useState(START_HP);
  const [playerHp, setPlayerHp] = useState(START_HP);
  const [hitFlash, setHitFlash] = useState(null); // 'boss' | 'player' | null
  const [bossEmoji] = useState(() => pickBossEmoji(topic));

  async function startBattle(chosenDifficulty, chosenCount) {
    setLoading(true);
    setError('');
    try {
      const { quiz } = await requestQuiz({ sourceText, difficulty: chosenDifficulty, count: chosenCount });
      if (!quiz.length) throw new Error('No questions came back — try again.');
      setQuestions(quiz);
      setIndex(0);
      setSelected(null);
      setBossHp(START_HP);
      setPlayerHp(START_HP);
      setPhase('battle');
    } catch (err) {
      setError(err.message);
      setPhase('settings'); // surface the error via the settings screen even on a "fight again" retry
    } finally {
      setLoading(false);
    }
  }

  function choose(i) {
    if (selected !== null) return;
    setSelected(i);

    const q = questions[index];
    const dmg = damageFor(q);
    if (i === q.correctIndex) {
      setBossHp((hp) => Math.max(0, hp - dmg));
      setHitFlash('boss');
    } else {
      setPlayerHp((hp) => Math.max(0, hp - Math.round(dmg * 0.7)));
      setHitFlash('player');
    }
    setTimeout(() => setHitFlash(null), 400);
  }

  function next() {
    if (bossHp <= 0 || playerHp <= 0 || index + 1 >= questions.length) {
      setPhase('result');
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  }

  function outcome() {
    if (bossHp <= 0 && playerHp > 0) return 'win';
    if (playerHp <= 0 && bossHp > 0) return 'lose';
    return bossHp < playerHp ? 'win' : bossHp > playerHp ? 'lose' : 'draw';
  }

  if (phase === 'settings') {
    return (
      <div className="card cards-card game-intro">
        <h2 className="breakdown-title">🎮 Quiz Game</h2>
        <p className="task-summary">
          Answer questions about your notes to attack {bossEmoji} the boss. Get one wrong and it hits back.
          Defeat it before it defeats you!
        </p>
        {error && <p className="error">⚠️ {error}</p>}
        <QuizSettings
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          count={count}
          setCount={setCount}
          onGenerate={startBattle}
          disabled={loading}
          label={loading ? 'Summoning…' : '⚔️ Start Battle'}
        />
      </div>
    );
  }

  if (phase === 'result') {
    const result = outcome();
    const message =
      result === 'win'
        ? `🎉 Victory! You defeated ${bossEmoji} the boss.`
        : result === 'lose'
        ? `💀 Defeated! ${bossEmoji} got the better of you this time.`
        : "🤝 It's a draw — you both ran out of steam.";

    return (
      <div className="card cards-card game-intro">
        <h2 className="breakdown-title">🎮 Quiz Game</h2>
        <p className="finished-message">{message}</p>
        <p className="task-summary">
          Final HP — You: {playerHp} · Boss: {bossHp}
        </p>
        <QuizSettings
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          count={count}
          setCount={setCount}
          onGenerate={startBattle}
          disabled={loading}
          label={loading ? 'Summoning…' : '⚔️ Fight again'}
        />
      </div>
    );
  }

  const q = questions[index];
  const bossDefeated = bossHp <= 0;
  const playerDefeated = playerHp <= 0;

  return (
    <div className="card cards-card">
      <div className="battle-arena">
        <div className="battle-side">
          <span className="battle-label">{bossEmoji} Boss</span>
          <div className="hp-bar">
            <div className="hp-bar-fill boss" style={{ width: `${bossHp}%` }} />
          </div>
          <span className="hp-value">{bossHp} HP</span>
        </div>
        <div className={`battle-emoji ${hitFlash === 'boss' ? 'hit' : ''}`}>{bossEmoji}</div>
        <div className="battle-vs">VS</div>
        <div className={`battle-emoji ${hitFlash === 'player' ? 'hit' : ''}`}>🧑‍🎓</div>
        <div className="battle-side">
          <span className="battle-label">🧑‍🎓 You</span>
          <div className="hp-bar">
            <div className="hp-bar-fill player" style={{ width: `${playerHp}%` }} />
          </div>
          <span className="hp-value">{playerHp} HP</span>
        </div>
      </div>

      <div className="quiz-header-row">
        <span className="progress-label">
          Question {index + 1} / {questions.length}
        </span>
        {q.difficulty && <span className={`difficulty-badge difficulty-${q.difficulty}`}>{q.difficulty}</span>}
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
            {bossDefeated || playerDefeated || index + 1 >= questions.length ? 'See result' : 'Next question'}
          </button>
        </>
      )}
    </div>
  );
}
