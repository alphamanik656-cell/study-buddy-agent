export default function QuizSettings({ difficulty, setDifficulty, count, setCount, onGenerate, disabled, label }) {
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
        {label || '🔄 Generate'}
      </button>
    </div>
  );
}
