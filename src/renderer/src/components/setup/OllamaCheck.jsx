import { useOllama } from '../../hooks/useOllama'
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

function OllamaCheck({ onComplete }) {
  const { checking, connected, hasModel, error, checkConnection } = useOllama()

  if (checking) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-5 h-5 text-accent animate-spin" />
        <p className="text-text-secondary">Checking Ollama connection...</p>
      </div>
    )
  }

  if (connected && hasModel) {
    return (
      <div className="flex flex-col items-center gap-4">
        <CheckCircle className="w-5 h-5 text-positive" />
        <p className="text-text-primary">Ollama is running with Mistral Small</p>
        {onComplete && (
          <button
            className="bg-accent text-background font-medium px-6 py-2 rounded-btn transition-colors duration-fast hover:bg-accent-hover"
            onClick={onComplete}
          >
            Continue
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 max-w-md text-center">
      <XCircle className="w-5 h-5 text-destructive" />
      <p className="text-text-primary">
        {!connected
          ? "Can't connect to Ollama"
          : 'Mistral Small model not found'}
      </p>
      <div className="text-text-secondary text-small space-y-2">
        {!connected ? (
          <>
            <p>Make sure Ollama is installed and running.</p>
            <p>Open a terminal and run: <code className="font-mono text-accent">ollama serve</code></p>
          </>
        ) : (
          <>
            <p>Ollama is running but the model needs to be downloaded.</p>
            <p>Open a terminal and run: <code className="font-mono text-accent">ollama pull mistral-small:22b</code></p>
          </>
        )}
      </div>
      <div className="flex gap-3">
        <button
          className="flex items-center gap-2 bg-surface-raised text-text-primary border border-border font-medium px-4 py-2 rounded-btn transition-colors duration-fast hover:bg-surface-raised"
          onClick={checkConnection}
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
        {onComplete && (
          <button
            className="text-text-muted text-small hover:text-text-secondary transition-colors duration-fast"
            onClick={onComplete}
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  )
}

export default OllamaCheck
