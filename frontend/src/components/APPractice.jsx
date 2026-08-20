import { useState } from 'react';
import { requestAPMcqs, requestAPFrqs } from '../api';

const AP_SUBJECT_GROUPS = [
  {
    category: 'Arts',
    subjects: [
      { name: 'AP 2-D Art and Design', slug: 'ap-2-d-art-and-design' },
      { name: 'AP 3-D Art and Design', slug: 'ap-3-d-art-and-design' },
      { name: 'AP Drawing', slug: 'ap-drawing' },
      { name: 'AP Art History', slug: 'ap-art-history' },
      { name: 'AP Music Theory', slug: 'ap-music-theory' },
    ],
  },
  {
    category: 'English',
    subjects: [
      { name: 'AP English Language and Composition', slug: 'ap-english-language-and-composition' },
      { name: 'AP English Literature and Composition', slug: 'ap-english-literature-and-composition' },
    ],
  },
  {
    category: 'History and Social Sciences',
    subjects: [
      { name: 'AP African American Studies', slug: 'ap-african-american-studies' },
      { name: 'AP Comparative Government and Politics', slug: 'ap-comparative-government-and-politics' },
      { name: 'AP European History', slug: 'ap-european-history' },
      { name: 'AP Human Geography', slug: 'ap-human-geography' },
      { name: 'AP Macroeconomics', slug: 'ap-macroeconomics' },
      { name: 'AP Microeconomics', slug: 'ap-microeconomics' },
      { name: 'AP Psychology', slug: 'ap-psychology' },
      { name: 'AP United States Government and Politics', slug: 'ap-united-states-government-and-politics' },
      { name: 'AP United States History', slug: 'ap-united-states-history' },
      { name: 'AP World History', slug: 'ap-world-history' },
    ],
  },
  {
    category: 'Math and Computer Science',
    subjects: [
      { name: 'AP Calculus AB', slug: 'ap-calculus-ab' },
      { name: 'AP Calculus BC', slug: 'ap-calculus-bc' },
      { name: 'AP Computer Science A', slug: 'ap-computer-science-a' },
      { name: 'AP Computer Science Principles', slug: 'ap-computer-science-principles' },
      { name: 'AP Precalculus', slug: 'ap-precalculus' },
      { name: 'AP Statistics', slug: 'ap-statistics' },
    ],
  },
  {
    category: 'Sciences',
    subjects: [
      { name: 'AP Biology', slug: 'ap-biology' },
      { name: 'AP Chemistry', slug: 'ap-chemistry' },
      { name: 'AP Environmental Science', slug: 'ap-environmental-science' },
      { name: 'AP Physics 1', slug: 'ap-physics-1' },
      { name: 'AP Physics 2', slug: 'ap-physics-2' },
      { name: 'AP Physics C: Electricity and Magnetism', slug: 'ap-physics-c-electricity-and-magnetism' },
      { name: 'AP Physics C: Mechanics', slug: 'ap-physics-c-mechanics' },
    ],
  },
  {
    category: 'World Languages and Cultures',
    subjects: [
      { name: 'AP Chinese Language and Culture', slug: 'ap-chinese-language-and-culture' },
      { name: 'AP French Language and Culture', slug: 'ap-french-language-and-culture' },
      { name: 'AP German Language and Culture', slug: 'ap-german-language-and-culture' },
      { name: 'AP Italian Language and Culture', slug: 'ap-italian-language-and-culture' },
      { name: 'AP Japanese Language and Culture', slug: 'ap-japanese-language-and-culture' },
      { name: 'AP Latin', slug: 'ap-latin' },
      { name: 'AP Spanish Language and Culture', slug: 'ap-spanish-language-and-culture' },
      { name: 'AP Spanish Literature and Culture', slug: 'ap-spanish-literature-and-culture' },
    ],
  },
  {
    category: 'AP Capstone',
    subjects: [
      { name: 'AP Research', slug: 'ap-research' },
      { name: 'AP Seminar', slug: 'ap-seminar' },
    ],
  },
  {
    category: 'AP Career Kickstart',
    subjects: [
      { name: 'AP Business with Personal Finance', slug: 'ap-business-personal-finance' },
      { name: 'AP Cybersecurity', slug: 'ap-cybersecurity' },
      { name: 'AP Networking', slug: 'ap-networking' },
    ],
  },
];

function collegeBoardLink(slug) {
  return `https://apcentral.collegeboard.org/courses/${slug}`;
}

export default function APPractice() {
  const [subject, setSubject] = useState(null);
  const [mcqs, setMcqs] = useState([]);
  const [mcqLoading, setMcqLoading] = useState(false);
  const [mcqError, setMcqError] = useState('');
  const [mcqVersion, setMcqVersion] = useState(0);
  const [frqs, setFrqs] = useState([]);
  const [frqLoading, setFrqLoading] = useState(false);
  const [frqError, setFrqError] = useState('');
  const [frqVersion, setFrqVersion] = useState(0);

  function chooseSubject(subj) {
    setSubject(subj);
    loadMcqs(subj);
    loadFrqs(subj);
  }

  async function loadMcqs(subj) {
    setMcqLoading(true);
    setMcqError('');
    try {
      const { mcqs } = await requestAPMcqs({ subject: subj.name });
      setMcqs(mcqs);
      setMcqVersion((v) => v + 1);
    } catch (err) {
      setMcqError(err.message);
    } finally {
      setMcqLoading(false);
    }
  }

  async function loadFrqs(subj) {
    setFrqLoading(true);
    setFrqError('');
    try {
      const { frqs } = await requestAPFrqs({ subject: subj.name });
      setFrqs(frqs);
      setFrqVersion((v) => v + 1);
    } catch (err) {
      setFrqError(err.message);
    } finally {
      setFrqLoading(false);
    }
  }

  if (!subject) {
    return (
      <div className="card cards-card ap-picker-card">
        <h2 className="breakdown-title">🎓 AP Practice</h2>
        <p className="task-summary">
          Pick a subject for AI-generated practice questions in the style of the real exam — original
          questions, never copied from College Board. Each subject links to College Board's own real
          course page for further practice with the genuine released questions.
        </p>
        {AP_SUBJECT_GROUPS.map((group) => (
          <div key={group.category} className="ap-subject-group">
            <h3 className="ap-section-title ap-category-title">{group.category}</h3>
            <div className="ap-subject-grid">
              {group.subjects.map((subj) => (
                <button
                  key={subj.name}
                  type="button"
                  className="secondary ap-subject-btn"
                  onClick={() => chooseSubject(subj)}
                >
                  {subj.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="card">
      <div className="quiz-header-row">
        <h2 className="breakdown-title">🎓 {subject.name}</h2>
        <button className="link" onClick={() => setSubject(null)}>
          ← Change subject
        </button>
      </div>
      <a className="ap-cb-link" href={collegeBoardLink(subject.slug)} target="_blank" rel="noopener noreferrer">
        🔗 These practice problems are based on College Board's AP Central
      </a>

      <h3 className="ap-section-title">📝 Multiple Choice</h3>
      {mcqLoading && <p className="task-summary">Generating questions…</p>}
      {!mcqLoading && mcqError && (
        <>
          <p className="error">⚠️ {mcqError}</p>
          <button className="secondary" onClick={() => loadMcqs(subject)}>
            Retry
          </button>
        </>
      )}
      {!mcqLoading && !mcqError && (
        <>
          <div className="ap-item-list">
            {mcqs.map((q, i) => (
              <APMcqItem key={mcqVersion + '-' + i} question={q} index={i} />
            ))}
          </div>
          <button className="secondary" onClick={() => loadMcqs(subject)}>
            🔄 New MCQs
          </button>
        </>
      )}

      <h3 className="ap-section-title">✍️ Free Response</h3>
      {frqLoading && <p className="task-summary">Generating questions…</p>}
      {!frqLoading && frqError && (
        <>
          <p className="error">⚠️ {frqError}</p>
          <button className="secondary" onClick={() => loadFrqs(subject)}>
            Retry
          </button>
        </>
      )}
      {!frqLoading && !frqError && (
        <>
          <div className="ap-item-list">
            {frqs.map((f, i) => (
              <APFrqItem key={frqVersion + '-' + i} frq={f} index={i} />
            ))}
          </div>
          <button className="secondary" onClick={() => loadFrqs(subject)}>
            🔄 New FRQs
          </button>
        </>
      )}
    </div>
  );
}

function APMcqItem({ question: q, index }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="ap-item">
      <p className="quiz-question">
        {index + 1}. {q.question}
      </p>
      <div className="quiz-choices">
        {q.choices.map((choice, i) => {
          let cls = 'quiz-choice';
          if (selected !== null && i === q.correctIndex) cls += ' correct';
          else if (selected === i) cls += ' incorrect';
          return (
            <button
              key={i}
              className={cls}
              onClick={() => selected === null && setSelected(i)}
              disabled={selected !== null}
            >
              {choice}
            </button>
          );
        })}
      </div>
      {selected !== null && <p className="quiz-explanation">💬 {q.explanation}</p>}
    </div>
  );
}

function APFrqItem({ frq, index }) {
  const [draft, setDraft] = useState('');
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="ap-item">
      <p className="quiz-question">
        {index + 1}. {frq.prompt}
      </p>
      <textarea
        className="ap-frq-draft"
        placeholder="Draft your response here — this stays local, nothing is submitted or graded automatically."
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={6}
      />
      <button className="secondary" onClick={() => setRevealed((r) => !r)}>
        {revealed ? 'Hide sample response & rubric' : '👁 Show sample response & rubric'}
      </button>
      {revealed && (
        <div className="ap-frq-reveal">
          <p className="ap-frq-reveal-label">Scoring rubric</p>
          <ul className="ap-rubric-list">
            {frq.rubric.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
          <p className="ap-frq-reveal-label">Sample response</p>
          <p className="ap-sample-response">{frq.sampleResponse}</p>
        </div>
      )}
    </div>
  );
}
