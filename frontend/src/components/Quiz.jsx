import { useState } from 'react';
import PracticeQuiz from './PracticeQuiz';
import BossBattle from './BossBattle';

export default function Quiz({ topic, sourceText }) {
  const [mode, setMode] = useState('practice'); // 'practice' | 'battle'

  return (
    <div className="card cards-card">
      <div className="mode-tabs">
        <button className={`tab ${mode === 'practice' ? 'active' : ''}`} onClick={() => setMode('practice')}>
          📝 Practice
        </button>
        <button className={`tab ${mode === 'battle' ? 'active' : ''}`} onClick={() => setMode('battle')}>
          ⚔️ Boss Battle
        </button>
      </div>

      {mode === 'practice' ? (
        <PracticeQuiz sourceText={sourceText} />
      ) : (
        <BossBattle topic={topic} sourceText={sourceText} />
      )}
    </div>
  );
}
