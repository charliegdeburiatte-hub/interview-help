function TranscriptViewer({ segments, speakers }) {
  if (!segments || segments.length === 0) {
    return (
      <p className="text-text-muted text-small">
        Transcript will appear here
      </p>
    )
  }

  // If we have speaker-labelled segments (real interview mode)
  if (speakers) {
    return (
      <div className="flex flex-col gap-4">
        {segments.map((seg, i) => (
          <SpeakerSegment key={i} segment={seg} />
        ))}
      </div>
    )
  }

  // Simple transcript (practice mode)
  return (
    <div className="flex flex-col gap-2">
      {segments.map((seg, i) => (
        <div key={i} className="flex gap-3">
          {seg.start > 0 && (
            <span className="text-label text-text-muted shrink-0 mt-0.5">
              {formatTimestamp(seg.start)}
            </span>
          )}
          <p className="font-mono text-mono text-text-secondary leading-relaxed">
            {seg.text}
          </p>
        </div>
      ))}
    </div>
  )
}

function SpeakerSegment({ segment }) {
  const speaker = segment.speaker || 'UNKNOWN'
  const isUser = speaker.toUpperCase() === 'YOU'

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-label uppercase tracking-wider text-text-muted">
          {speaker}
        </span>
        {segment.start > 0 && (
          <span className="text-label text-text-muted">
            {formatTimestamp(segment.start)}
          </span>
        )}
      </div>
      <div className="border-t border-border-subtle mb-2" />
      <p className="font-mono text-mono text-text-secondary leading-relaxed">
        {segment.text}
      </p>
    </div>
  )
}

function formatTimestamp(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export default TranscriptViewer
