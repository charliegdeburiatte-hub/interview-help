import STARScore from '../shared/STARScore'

function FeedbackPanel({ feedback }) {
  if (!feedback) return null

  const { star, length, strengths, opportunities, suggestedImprovement, overallScore } = feedback

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <ScoreBanner score={overallScore} />
      <STARScore star={star} />
      {length && <LengthNote length={length} />}
      {strengths?.length > 0 && <StrengthsSection strengths={strengths} />}
      {opportunities?.length > 0 && <OpportunitiesSection opportunities={opportunities} />}
      {suggestedImprovement && <ImprovementSection text={suggestedImprovement} />}
    </div>
  )
}

function ScoreBanner({ score }) {
  if (score == null) return null

  let message = ''
  if (score >= 9) message = 'Excellent answer — this is interview-ready'
  else if (score >= 7) message = 'Solid answer — strong foundation here'
  else if (score >= 5) message = 'Good foundation — keep practising this one'
  else message = 'Early stages — practice will make a real difference'

  return (
    <div className="bg-surface border border-border-subtle rounded-card px-4 py-3">
      <p className="text-body text-text-secondary">{message}</p>
    </div>
  )
}

function LengthNote({ length }) {
  return (
    <div>
      <h3 className="text-label uppercase tracking-wider text-text-muted mb-2">
        Length
      </h3>
      <p className="text-body text-text-secondary">
        {formatDuration(length.seconds)}
        {length.note && ` — ${length.note}`}
      </p>
    </div>
  )
}

function StrengthsSection({ strengths }) {
  return (
    <div>
      <h3 className="text-label uppercase tracking-wider text-text-muted mb-2">
        Strengths
      </h3>
      <div className="border-t border-border-subtle mb-3" />
      <div className="flex flex-col gap-1.5">
        {strengths.map((s, i) => (
          <p key={i} className="text-body text-text-primary">
            <span className="text-positive mr-2">+</span>
            {s}
          </p>
        ))}
      </div>
    </div>
  )
}

function OpportunitiesSection({ opportunities }) {
  return (
    <div>
      <h3 className="text-label uppercase tracking-wider text-text-muted mb-2">
        Opportunities
      </h3>
      <div className="border-t border-border-subtle mb-3" />
      <div className="flex flex-col gap-1.5">
        {opportunities.map((o, i) => (
          <p key={i} className="text-body text-text-primary">
            <span className="text-accent mr-2">&rarr;</span>
            {o}
          </p>
        ))}
      </div>
    </div>
  )
}

function ImprovementSection({ text }) {
  return (
    <div>
      <h3 className="text-label uppercase tracking-wider text-text-muted mb-2">
        One Thing to Improve
      </h3>
      <div className="border-t border-border-subtle mb-3" />
      <p className="text-body text-text-primary">{text}</p>
    </div>
  )
}

function formatDuration(seconds) {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

export default FeedbackPanel
