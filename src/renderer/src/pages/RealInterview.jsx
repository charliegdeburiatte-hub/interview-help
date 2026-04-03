import { useState, useCallback } from 'react'
import { useApp, useAppDispatch, MODES } from '../context/app-context'
import { useSessionState, useSessionDispatch } from '../context/session-context'
import { useSession } from '../hooks/useSession'
import UploadZone from '../components/interview/UploadZone'
import AnalysisView from '../components/interview/AnalysisView'
import { Loader2 } from 'lucide-react'

const STEPS = {
  DETAILS: 'details',
  UPLOAD: 'upload',
  TRANSCRIBING: 'transcribing',
  ANALYSING: 'analysing',
  RESULTS: 'results'
}

function RealInterview() {
  const { currentSessionId } = useApp()
  const appDispatch = useAppDispatch()
  const sessionDispatch = useSessionDispatch()
  const { activeSession } = useSessionState()
  const { createSession } = useSession()

  const [step, setStep] = useState(STEPS.DETAILS)
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)

  const handleStartSession = useCallback(async () => {
    if (!company.trim()) return
    const session = await createSession({ mode: 'real', company: company.trim(), role: role.trim() })
    if (session) {
      appDispatch({ type: 'SET_SESSION', sessionId: session.id })
      setStep(STEPS.UPLOAD)
    }
  }, [company, role, createSession, appDispatch])

  const handleUpload = useCallback(async (file) => {
    setError(null)

    try {
      // Save the file via main process
      const arrayBuffer = await file.arrayBuffer()
      const sessionId = currentSessionId || activeSession?.id
      const saveResult = await window.api.saveAudioBlob(arrayBuffer, sessionId)

      if (saveResult.error) throw new Error(saveResult.error)

      // Transcribe with diarization
      setStep(STEPS.TRANSCRIBING)
      const transcript = await window.api.transcribeWithDiarization(saveResult.path)

      if (transcript.error) throw new Error(transcript.error)

      sessionDispatch({ type: 'SET_TRANSCRIPT', transcript })

      // Analyse
      setStep(STEPS.ANALYSING)
      const result = await window.api.analyseInterview({
        jobTitle: role || activeSession?.role || '',
        company: company || activeSession?.company || '',
        transcript: transcript.fullText
      })

      if (result.error) throw new Error(result.error)

      setAnalysis(result.analysis)
      setStep(STEPS.RESULTS)
    } catch (err) {
      console.error('Interview processing failed:', err)
      setError(err.message || 'Something went wrong. Try again.')
      setStep(STEPS.UPLOAD)
    }
  }, [currentSessionId, activeSession, role, company, sessionDispatch])

  const handlePractiseQuestion = useCallback((questionText) => {
    // Switch to practice mode with the question ready
    appDispatch({ type: 'SET_MODE', mode: MODES.PRACTICE })
    // The question will need to be added to a practice session
    // For now, switch mode — full pre-load is a future enhancement
  }, [appDispatch])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-display font-semibold">Real Interview</h1>

      {error && (
        <div className="bg-destructive-subtle border border-destructive text-destructive rounded-card px-4 py-3 text-small">
          {error}
        </div>
      )}

      {step === STEPS.DETAILS && (
        <SessionDetailsForm
          company={company}
          role={role}
          onCompanyChange={setCompany}
          onRoleChange={setRole}
          onSubmit={handleStartSession}
        />
      )}

      {step === STEPS.UPLOAD && (
        <>
          <p className="text-text-secondary">
            Upload your OBS recording for analysis.
          </p>
          <UploadZone onUpload={handleUpload} />
        </>
      )}

      {step === STEPS.TRANSCRIBING && (
        <ProcessingState message="Transcribing your interview..." />
      )}

      {step === STEPS.ANALYSING && (
        <ProcessingState message="Analysing the conversation..." />
      )}

      {step === STEPS.RESULTS && (
        <AnalysisView analysis={analysis} onPractiseQuestion={handlePractiseQuestion} />
      )}
    </div>
  )
}

function SessionDetailsForm({ company, role, onCompanyChange, onRoleChange, onSubmit }) {
  return (
    <div className="flex flex-col gap-4 max-w-md">
      <p className="text-text-secondary">
        Name this interview session so you can find it later.
      </p>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Company name"
          value={company}
          onChange={(e) => onCompanyChange(e.target.value)}
          className="bg-surface border border-border rounded-card px-4 py-2.5 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors duration-fast"
        />
        <input
          type="text"
          placeholder="Role (optional)"
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
          className="bg-surface border border-border rounded-card px-4 py-2.5 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors duration-fast"
        />
      </div>
      <button
        className="self-start bg-accent text-background font-medium px-5 py-2 rounded-btn transition-colors duration-fast hover:bg-accent-hover disabled:opacity-40"
        onClick={onSubmit}
        disabled={!company.trim()}
      >
        Continue
      </button>
    </div>
  )
}

function ProcessingState({ message }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12">
      <Loader2 className="w-5 h-5 text-accent animate-spin" />
      <span className="text-body text-text-secondary">{message}</span>
    </div>
  )
}

export default RealInterview
