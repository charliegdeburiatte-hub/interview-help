function TimelineView({ moments }) {
  if (!moments || moments.length === 0) return null

  return (
    <div className="flex flex-col gap-1">
      {moments.map((moment, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-3 py-2 rounded-btn hover:bg-surface-raised transition-colors duration-fast cursor-default"
        >
          <span className="text-label text-text-muted font-mono shrink-0">
            {moment.timestamp}
          </span>
          <div
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              moment.type === 'strength' ? 'bg-positive' : 'bg-accent'
            }`}
          />
          <p className="text-small text-text-secondary truncate">
            {moment.observation}
          </p>
        </div>
      ))}
    </div>
  )
}

export default TimelineView
