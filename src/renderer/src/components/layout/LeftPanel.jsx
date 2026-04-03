import { useApp, useAppDispatch, MODES } from '../../context/app-context'
import { useSessionState } from '../../context/session-context'

function LeftPanel() {
  const { currentMode, currentSessionId } = useApp()
  const dispatch = useAppDispatch()
  const { sessions } = useSessionState()

  const filteredSessions = sessions.filter((s) => s.mode === currentMode)

  return (
    <div className="w-60 shrink-0 bg-surface flex flex-col h-full overflow-hidden">
      <div className="p-4">
        <ModeToggle currentMode={currentMode} dispatch={dispatch} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {filteredSessions.length === 0 ? (
          <p className="text-text-muted text-small">No sessions yet</p>
        ) : (
          <SessionList
            sessions={filteredSessions}
            activeId={currentSessionId}
            dispatch={dispatch}
          />
        )}
      </div>
    </div>
  )
}

function ModeToggle({ currentMode, dispatch }) {
  return (
    <div className="flex gap-1 bg-background rounded-btn p-1">
      <button
        className={`flex-1 text-small font-medium py-1.5 rounded-btn transition-colors duration-fast ${
          currentMode === MODES.PRACTICE
            ? 'bg-surface-raised text-text-primary'
            : 'text-text-muted hover:text-text-secondary'
        }`}
        onClick={() => dispatch({ type: 'SET_MODE', mode: MODES.PRACTICE })}
      >
        Practice
      </button>
      <button
        className={`flex-1 text-small font-medium py-1.5 rounded-btn transition-colors duration-fast ${
          currentMode === MODES.REAL
            ? 'bg-surface-raised text-text-primary'
            : 'text-text-muted hover:text-text-secondary'
        }`}
        onClick={() => dispatch({ type: 'SET_MODE', mode: MODES.REAL })}
      >
        Interview
      </button>
    </div>
  )
}

function SessionList({ sessions, activeId, dispatch }) {
  const grouped = groupByDate(sessions)

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <p className="text-label uppercase tracking-wider text-text-muted mb-2">
            {date}
          </p>
          <div className="flex flex-col gap-1">
            {items.map((session) => (
              <button
                key={session.id}
                className={`w-full text-left px-4 py-3 rounded-card transition-colors duration-fast ${
                  activeId === session.id
                    ? 'border-l-2 border-accent bg-surface-raised'
                    : 'border-l-2 border-transparent hover:bg-surface-raised'
                }`}
                onClick={() => dispatch({ type: 'VIEW_SESSION', sessionId: session.id })}
              >
                <p className="text-subheading font-medium text-text-primary truncate">
                  {session.company || 'Untitled'}
                </p>
                <p className="text-small text-text-secondary truncate">
                  {session.role || session.mode}
                </p>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function groupByDate(sessions) {
  const groups = {}
  for (const session of sessions) {
    const date = new Date(session.date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
    if (!groups[date]) groups[date] = []
    groups[date].push(session)
  }
  return groups
}

export default LeftPanel
