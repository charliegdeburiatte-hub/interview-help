import { Mic, Square, Loader2 } from 'lucide-react'

function RecordingControls({ state, duration, onStart, onStop, error }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {state === 'idle' && (
        <button
          className="flex items-center gap-2 bg-accent text-background font-medium px-6 py-2.5 rounded-btn transition-colors duration-fast hover:bg-accent-hover"
          onClick={onStart}
        >
          <Mic className="w-4 h-4" />
          Start Recording
        </button>
      )}

      {state === 'recording' && (
        <div className="flex items-center gap-4">
          <RecordingIndicator />
          <span className="text-body text-text-primary font-mono tabular-nums">
            {formatDuration(duration)}
          </span>
          <button
            className="flex items-center gap-2 border border-border text-text-primary font-medium px-5 py-2 rounded-btn transition-colors duration-fast hover:bg-surface-raised"
            onClick={onStop}
          >
            <Square className="w-3.5 h-3.5" />
            Stop
          </button>
        </div>
      )}

      {state === 'processing' && (
        <div className="flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-accent animate-spin" />
          <span className="text-body text-text-secondary">Transcribing...</span>
        </div>
      )}

      {error && (
        <p className="text-small text-destructive mt-1">{error}</p>
      )}
    </div>
  )
}

function RecordingIndicator() {
  return (
    <span className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
    </span>
  )
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default RecordingControls
