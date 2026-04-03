function SessionCard({ session, isActive, onClick }) {
  const modeLabel = session.mode === 'practice' ? 'Practice' : 'Interview'
  const title = session.company || 'Untitled'
  const subtitle = session.role || modeLabel

  return (
    <button
      className={`w-full text-left px-4 py-3 rounded-card transition-colors duration-fast ${
        isActive
          ? 'border-l-2 border-accent bg-surface-raised'
          : 'border-l-2 border-transparent hover:bg-surface-raised'
      }`}
      onClick={onClick}
    >
      <p className="text-subheading font-medium text-text-primary truncate">
        {title}
      </p>
      <p className="text-small text-text-secondary truncate">{subtitle}</p>
      <p className="text-label uppercase tracking-wider text-text-muted mt-1">
        {modeLabel}
      </p>
    </button>
  )
}

export default SessionCard
