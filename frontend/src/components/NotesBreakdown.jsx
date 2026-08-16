export default function NotesBreakdown({ topic, sections }) {
  return (
    <div className="card breakdown-card">
      <h2 className="breakdown-title">📖 {topic}</h2>
      <p className="task-summary">Here's what your notes actually mean, broken down section by section.</p>

      <ol className="section-list">
        {sections.map((section, i) => (
          <li key={i} className="section-item">
            <span className="section-heading">{section.heading}</span>
            <p className="section-explanation">{section.explanation}</p>
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
