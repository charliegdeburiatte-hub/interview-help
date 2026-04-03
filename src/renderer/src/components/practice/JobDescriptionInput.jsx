import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'

const MAX_JD_LENGTH = 3000

function JobDescriptionInput({ onSubmit, loading }) {
  const [text, setText] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim() || loading) return
    onSubmit(text.trim())
  }

  const charCount = text.length
  const isOverLimit = charCount > MAX_JD_LENGTH

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="text-label uppercase tracking-wider text-text-muted">
        Job Description
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste the job description here..."
        className="w-full h-48 bg-surface border border-border rounded-card p-4 text-body text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent transition-colors duration-fast"
        disabled={loading}
      />
      <div className="flex items-center justify-between">
        <span className={`text-small ${isOverLimit ? 'text-destructive' : 'text-text-muted'}`}>
          {charCount.toLocaleString()} / {MAX_JD_LENGTH.toLocaleString()}
        </span>
        <button
          type="submit"
          disabled={!text.trim() || loading || isOverLimit}
          className="flex items-center gap-2 bg-accent text-background font-medium px-5 py-2 rounded-btn transition-colors duration-fast hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {loading ? 'Generating...' : 'Generate Questions'}
        </button>
      </div>
    </form>
  )
}

export default JobDescriptionInput
