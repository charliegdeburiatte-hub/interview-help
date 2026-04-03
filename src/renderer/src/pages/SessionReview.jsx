import { useEffect, useState, useCallback } from 'react'
import { useApp, useAppDispatch, MODES } from '../context/app-context'
import { useSessionDispatch } from '../context/session-context'
import FeedbackPanel from '../components/practice/FeedbackPanel'
import AnalysisView from '../components/interview/AnalysisView'
import { Download, ArrowLeft, Loader2 } from 'lucide-react'

function SessionReview() {
  const { currentSessionId } = useApp()
  const appDispatch = useAppDispatch()
  const sessionDispatch = useSessionDispatch()

  const [session, setSession] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      if (!currentSessionId) return

      try {
        setLoading(true)
        const s = await window.api.getSession(currentSessionId)
        setSession(s)

        if (s?.mode === 'practice') {
          const qs = await window.api.getQuestionsBySession(currentSessionId)
          setQuestions(qs)

          const answerMap = {}
          for (const q of qs) {
            const as = await window.api.getAnswersByQuestion(q.id)
            if (as.length > 0) answerMap[q.id] = as[0]
          }
          setAnswers(answerMap)
        }
      } catch (err) {
        console.error('Failed to load session:', err)
        setError('Failed to load session data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [currentSessionId])

  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      const result = await window.api.exportPdf(currentSessionId)
      if (result.error) setError(result.error)
    } catch {
      setError('Export failed. Try again.')
    } finally {
      setExporting(false)
    }
  }, [currentSessionId])

  const handleBack = useCallback(() => {
    const mode = session?.mode === 'real' ? MODES.REAL : MODES.PRACTICE
    appDispatch({ type: 'SET_MODE', mode })
  }, [session, appDispatch])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 text-accent animate-spin" />
      </div>
    )
  }

  if (!session) {
    return <p className="text-text-muted">Session not found.</p>
  }

  const title = [session.company, session.role].filter(Boolean).join(' — ') || 'Session'
  const date = new Date(session.date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-1.5 text-small text-text-muted hover:text-text-secondary transition-colors duration-fast"
          onClick={handleBack}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <button
          className="flex items-center gap-2 border border-border text-text-primary font-medium px-4 py-1.5 rounded-btn text-small transition-colors duration-fast hover:bg-surface-raised disabled:opacity-40"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          Export PDF
        </button>
      </div>

      <div>
        <h1 className="text-display font-semibold">{title}</h1>
        <p className="text-small text-text-muted mt-1">{date}</p>
      </div>

      {error && (
        <div className="bg-destructive-subtle border border-destructive text-destructive rounded-card px-4 py-3 text-small">
          {error}
        </div>
      )}

      {session.mode === 'practice' && (
        <PracticeReview questions={questions} answers={answers} />
      )}

      {session.mode === 'real' && (
        <p className="text-text-secondary">
          Interview analysis will appear here when session data is loaded.
        </p>
      )}
    </div>
  )
}

function PracticeReview({ questions, answers }) {
  if (questions.length === 0) {
    return <p className="text-text-muted">No questions in this session.</p>
  }

  return (
    <div className="flex flex-col gap-8">
      {questions.map((q) => {
        const answer = answers[q.id]
        const feedback = answer?.feedback_json ? JSON.parse(answer.feedback_json) : null

        return (
          <div key={q.id} className="flex flex-col gap-4">
            <div className="bg-surface border border-border rounded-card p-4">
              {q.category && (
                <p className="text-label uppercase tracking-wider text-text-muted mb-2">
                  {q.category}
                </p>
              )}
              <p className="text-heading text-text-primary">{q.text}</p>
            </div>

            {answer?.transcript && (
              <div className="px-4">
                <p className="text-label uppercase tracking-wider text-text-muted mb-2">Your Answer</p>
                <p className="font-mono text-mono text-text-secondary">{answer.transcript}</p>
              </div>
            )}

            {feedback && <FeedbackPanel feedback={feedback} />}

            {!answer && (
              <p className="text-small text-text-muted px-4">No answer recorded</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default SessionReview
