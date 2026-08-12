import { useState } from 'react';
import { sendChatMessage } from '../api';

export default function TutorChat({ sourceText }) {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend(e) {
    e.preventDefault();
    const message = input.trim();
    if (!message || loading) return;

    const nextHistory = [...history, { role: 'user', content: message }];
    setHistory(nextHistory);
    setInput('');
    setLoading(true);

    try {
      const reply = await sendChatMessage({ sourceText, history: nextHistory, message });
      setHistory((h) => [...h, { role: 'assistant', content: reply }]);
    } catch (err) {
      setHistory((h) => [...h, { role: 'assistant', content: `Sorry, something went wrong: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card chat-card">
      <h3>💬 Ask your tutor</h3>
      <p className="task-summary">Answers come only from your uploaded material.</p>

      <div className="chat-history">
        {history.length === 0 && <p className="chat-empty">Stuck on something? Ask away.</p>}
        {history.map((turn, i) => (
          <div key={i} className={`chat-bubble ${turn.role}`}>
            {turn.content}
          </div>
        ))}
        {loading && <div className="chat-bubble assistant">Thinking…</div>}
      </div>

      <form onSubmit={handleSend} className="chat-input-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. What does this term mean?"
        />
        <button type="submit" className="primary" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
