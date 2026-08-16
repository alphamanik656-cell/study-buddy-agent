import { useRef, useState } from 'react';

const SAMPLE_NOTES = [
  {
    label: '🌱 Photosynthesis',
    text: 'Photosynthesis is the process by which plants convert light energy into chemical energy. It occurs in the chloroplasts, using chlorophyll. The process has two stages: light-dependent reactions (in the thylakoid membrane) and the Calvin cycle (in the stroma). Light-dependent reactions produce ATP and NADPH, and release oxygen as a byproduct. The Calvin cycle uses ATP and NADPH to fix carbon dioxide into glucose.',
  },
  {
    label: '🌊 The Water Cycle',
    text: 'The water cycle describes how water moves through Earth\'s systems in four stages: evaporation, condensation, precipitation, and collection. Evaporation happens when the sun heats water in oceans and lakes, turning it into vapor that rises into the atmosphere. As that vapor cools, it condenses into tiny droplets that form clouds. When those droplets grow heavy enough, they fall back to Earth as precipitation - rain, snow, or hail. Finally, that water collects in oceans, lakes, and rivers, or seeps into the ground as groundwater, ready to start the cycle again.',
  },
  {
    label: '🏛️ The French Revolution',
    text: 'The French Revolution began in 1789, driven by widespread frustration with the monarchy, crushing national debt, and stark inequality between the wealthy nobility and the common people. In July 1789, citizens stormed the Bastille prison, a symbol of royal tyranny, marking the start of the uprising. The revolutionaries adopted the Declaration of the Rights of Man, asserting liberty and equality for all citizens. The monarchy was eventually abolished, and King Louis XVI was executed in 1793. The revolution led to a period of political turmoil known as the Reign of Terror, before Napoleon Bonaparte eventually rose to power in 1799.',
  },
];

export default function UploadScreen({ onSubmit, loading, error }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() && !file) return;
    onSubmit({ text: text.trim(), file });
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  }

  function useSample(sampleText) {
    setFile(null);
    setText(sampleText);
  }

  return (
    <div className="upload-page">
      <div className="hero">
        <div className="hero-mascot" aria-hidden="true">
          🧠
        </div>
        <h1>Study Buddy</h1>
        <p className="subtitle">
          Turn any notes into small, doable steps — no walls of text, no overwhelm.
          Built for brains that work better in short bursts.
        </p>
      </div>

      <div className="card upload-card">
        <p className="field-label">✨ No notes handy? Try a sample</p>
        <div className="sample-row">
          {SAMPLE_NOTES.map((sample) => (
            <button
              key={sample.label}
              type="button"
              className="secondary sample-pill"
              onClick={() => useSample(sample.text)}
            >
              {sample.label}
            </button>
          ))}
        </div>

        <div className="divider">
          <span>or use your own</span>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="notes-textarea">
            📝 Paste your notes
          </label>
          <textarea
            id="notes-textarea"
            placeholder="e.g. Photosynthesis is the process by which plants convert light energy…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
          />

          <div className="divider">
            <span>or</span>
          </div>

          <div
            className={`dropzone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,image/*"
              hidden
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <>
                <span className="dropzone-icon">📎</span>
                <span className="dropzone-text">{file.name}</span>
                <button
                  type="button"
                  className="link"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  remove
                </button>
              </>
            ) : (
              <>
                <span className="dropzone-icon">📄🖼️</span>
                <span className="dropzone-text">Drop a PDF, photo, or .txt file — or click to browse</span>
              </>
            )}
          </div>

          {error && <p className="error">⚠️ {error}</p>}

          <button type="submit" className="primary big" disabled={loading || (!text.trim() && !file)}>
            {loading ? '🪄 Breaking it down…' : '🪄 Break it down for me'}
          </button>
        </form>
      </div>

      <div className="feature-strip">
        <div className="feature-pill">📖 Notes explained in plain language</div>
        <div className="feature-pill">🎮 Flashcards, quizzes &amp; boss battles</div>
        <div className="feature-pill">🔒 Runs fully local, no API key</div>
      </div>
    </div>
  );
}
