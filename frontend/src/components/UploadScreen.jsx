import { useRef, useState } from 'react';

export default function UploadScreen({ onSubmit, loading, error }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() && !file) return;
    onSubmit({ text: text.trim(), file });
  }

  return (
    <div className="card upload-card">
      <h1>Study Buddy</h1>
      <p className="subtitle">
        Paste your notes, or upload a PDF, photo, or text file. We'll break it into small,
        manageable steps — no walls of text, no overwhelm.
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Paste your notes here…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
        />

        <div className="upload-row">
          <button
            type="button"
            className="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            {file ? `📎 ${file.name}` : '📎 Attach PDF, image, or .txt'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,image/*"
            hidden
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file && (
            <button type="button" className="link" onClick={() => setFile(null)}>
              remove
            </button>
          )}
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="primary" disabled={loading || (!text.trim() && !file)}>
          {loading ? 'Breaking it down…' : 'Break it down for me'}
        </button>
      </form>
    </div>
  );
}
