function AnalysisView({ analysis, onPractiseQuestion }) {
  if (!analysis) return null

  const {
    overallImpression,
    strongestMoments,
    areasToDevlop,
    energyAndTone,
    questionsToPractise,
    overallRating
  } = analysis

  return (
    <div className="flex flex-col gap-6">
      <RatingBanner rating={overallRating} />
      <OverallSection text={overallImpression} />
      {strongestMoments?.length > 0 && (
        <MomentsSection title="Strongest Moments" items={strongestMoments} variant="positive" />
      )}
      {areasToDevlop?.length > 0 && (
        <MomentsSection title="Areas to Develop" items={areasToDevlop} variant="accent" />
      )}
      {energyAndTone && <EnergySection data={energyAndTone} />}
      {questionsToPractise?.length > 0 && (
        <PractiseSection questions={questionsToPractise} onPractise={onPractiseQuestion} />
      )}
    </div>
  )
}

function RatingBanner({ rating }) {
  const messages = {
    strong: 'Strong performance — you came across well overall.',
    solid: 'Solid foundation — specific areas to sharpen identified below.',
    developing: "Here's your path forward — clear growth areas to work on."
  }

  return (
    <div className="bg-surface border border-border-subtle rounded-card px-4 py-3">
      <p className="text-body text-text-secondary">
        {messages[rating] || messages.solid}
      </p>
    </div>
  )
}

function OverallSection({ text }) {
  return (
    <div>
      <h3 className="text-label uppercase tracking-wider text-text-muted mb-2">Overall</h3>
      <div className="border-t border-border-subtle mb-3" />
      <p className="text-body text-text-primary leading-relaxed">{text}</p>
    </div>
  )
}

function MomentsSection({ title, items, variant }) {
  const prefix = variant === 'positive' ? '\u25CF' : '\u2192'
  const colorClass = variant === 'positive' ? 'text-positive' : 'text-accent'

  return (
    <div>
      <h3 className="text-label uppercase tracking-wider text-text-muted mb-2">{title}</h3>
      <div className="border-t border-border-subtle mb-3" />
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3">
            <span className={`${colorClass} shrink-0`}>{prefix}</span>
            <div>
              <span className="text-small text-text-muted mr-2">{item.timestamp}</span>
              <span className="text-body text-text-primary">{item.observation}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EnergySection({ data }) {
  return (
    <div>
      <h3 className="text-label uppercase tracking-wider text-text-muted mb-2">
        Energy &amp; Tone
      </h3>
      <div className="border-t border-border-subtle mb-3" />
      <p className="text-body text-text-primary mb-2">{data.summary}</p>
      {data.patterns?.length > 0 && (
        <div className="flex flex-col gap-1">
          {data.patterns.map((p, i) => (
            <p key={i} className="text-small text-text-secondary">{p}</p>
          ))}
        </div>
      )}
    </div>
  )
}

function PractiseSection({ questions, onPractise }) {
  return (
    <div>
      <h3 className="text-label uppercase tracking-wider text-text-muted mb-2">
        Practise These
      </h3>
      <div className="border-t border-border-subtle mb-3" />
      <div className="flex flex-col gap-2">
        {questions.map((q, i) => (
          <div key={i} className="flex items-start justify-between gap-4 bg-surface border border-border rounded-card px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-body text-text-primary">{q.question}</p>
              <p className="text-small text-text-muted mt-1">{q.reason}</p>
            </div>
            {onPractise && (
              <button
                className="shrink-0 text-small text-accent hover:text-accent-hover transition-colors duration-fast"
                onClick={() => onPractise(q.question)}
              >
                Practise &rarr;
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AnalysisView
