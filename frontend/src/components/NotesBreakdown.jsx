function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Wraps any keyTerms that actually occur in the explanation text in a <mark>. Terms the model
// mis-cased or slightly reworded (e.g. plural vs singular) just won't match - skipped silently
// rather than breaking the render.
function highlightTerms(text, terms) {
  const cleanTerms = (terms || []).map((t) => t.trim()).filter(Boolean);
  if (!cleanTerms.length) return text;

  const pattern = cleanTerms
    .sort((a, b) => b.length - a.length) // match longer phrases before their substrings
    .map(escapeRegExp)
    .join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');
  const lowerTerms = new Set(cleanTerms.map((t) => t.toLowerCase()));

  return text.split(regex).map((part, i) =>
    lowerTerms.has(part.toLowerCase()) ? (
      <mark key={i} className="key-term">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function NotesBreakdown({ topic, sections }) {
  return (
    <div className="card breakdown-card">
      <h2 className="breakdown-title">📖 {topic}</h2>
      <p className="task-summary">Here's what your notes actually mean, broken down section by section.</p>

      <ol className="section-list">
        {sections.map((section, i) => (
          <li key={i} className="section-item">
            <span className="section-heading">{section.heading}</span>
            <p className="section-explanation">{highlightTerms(section.explanation, section.keyTerms)}</p>
            {section.memoryTrick && (
              <span className="memory-trick">
                <span className="memory-trick-icon">💡</span>
                {section.memoryTrick}
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
