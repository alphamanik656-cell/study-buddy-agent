import { useRef, useState } from 'react';

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
        <div className="feature-pill">⏱ Bite-sized focus timers</div>
        <div className="feature-pill">💬 Tutor chat on your material only</div>
        <div className="feature-pill">🔒 Runs fully local, no API key</div>
      </div>
    </div>
  );
}
