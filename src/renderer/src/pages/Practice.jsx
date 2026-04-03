import { useState, useCallback } from 'react'
import { useApp } from '../context/app-context'
import { useSessionState, useSessionDispatch } from '../context/session-context'
import { useSession } from '../hooks/useSession'
import { useRecording } from '../hooks/useRecording'
import JobDescriptionInput from '../components/practice/JobDescriptionInput'
import QuestionList from '../components/practice/QuestionList'
import QuestionCard from '../components/practice/QuestionCard'
import RecordingControls from '../components/practice/RecordingControls'
import FeedbackPanel from '../components/practice/FeedbackPanel'

function Practice() {
  const { currentSessionId } = useApp()
  const { questions, activeSession } = useSessionState()
  const sessionDispatch = useSessionDispatch()
  const { createSession } = useSession()

  const [generating, setGenerating] = useState(false)
  const [activeQuestion, setActiveQuestion] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [evaluating, setEvaluating] = useState(false)
  const [transcript, setTranscript] = useState(null)
  const [error, setError] = useState(null)

  const sessionId = currentSessionId || activeSession?.id

  const handleTranscript = useCallback(async (result) => {
    setTranscript(result)
    sessionDispatch({ type: 'SET_TRANSCRIPT', transcript: result })

    if (!activeQuestion) return

    // Evaluate the answer
    setEvaluating(true)
    try {
      const evalResult = await window.api.evaluateAnswer({
        questionId: activeQuestion.id,
        question: activeQuestion.text,
        transcript: result.transcript,
        durationSeconds: result.duration,
        audioPath: result.audioPath,
        jobTitle: activeSession?.role || '',
        keyRequirements: ''
      })

      if (evalResult.error) {
        setError(evalResult.error)
      } else {
        setFeedback(evalResult.feedback)
      }
    } catch (err) {
      console.error('Evaluation failed:', err)
      setError("Feedback couldn't be generated. Check Ollama is running and try again.")
    } finally {
      setEvaluating(false)
    }
  }, [activeQuestion, activeSession, sessionDispatch])

  const recording = useRecording({
    sessionId: sessionId || 0,
    onTranscript: handleTranscript
  })

  const handleGenerateQuestions = useCallback(async (jobDescription) => {
    setGenerating(true)
    setError(null)

    try {
      let sid = sessionId
      if (!sid) {
        const session = await createSession({ mode: 'practice' })
        if (!session) throw new Error('Failed to create session')
        sid = session.id
      }

      const result = await window.api.generateQuestions({ jobDescription, sessionId: sid })

      if (result.error) {
        setError(result.error)
        return
      }

      sessionDispatch({ type: 'SET_QUESTIONS', questions: result.questions })
    } catch (err) {
      console.error('Generate questions failed:', err)
      setError("Couldn't generate questions. Check Ollama is running and try again.")
    } finally {
      setGenerating(false)
    }
  }, [sessionId, createSession, sessionDispatch])

  const handleSelectQuestion = useCallback((question) => {
    setActiveQuestion(question)
    setFeedback(null)
    setTranscript(null)
    setError(null)
    sessionDispatch({ type: 'SET_TRANSCRIPT', transcript: null })
  }, [sessionDispatch])

  const hasQuestions = questions.length > 0

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-display font-semibold">Practice Mode</h1>

      {error && (
        <div className="bg-destructive-subtle border border-destructive text-destructive rounded-card px-4 py-3 text-small">
          {error}
        </div>
      )}

      {!hasQuestions ? (
        <>
          <p className="text-text-secondary">
            Paste a job description to generate tailored interview questions.
          </p>
          <JobDescriptionInput onSubmit={handleGenerateQuestions} loading={generating} />
        </>
      ) : activeQuestion ? (
        <ActiveQuestionView
          question={activeQuestion}
          recording={recording}
          feedback={feedback}
          evaluating={evaluating}
          onBack={() => handleSelectQuestion(null)}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-text-secondary">
              {questions.length} questions generated — select one to practise
            </p>
            <button
              className="text-small text-text-muted hover:text-text-secondary transition-colors duration-fast"
              onClick={() => {
                sessionDispatch({ type: 'SET_QUESTIONS', questions: [] })
                handleSelectQuestion(null)
              }}
            >
              New JD
            </button>
          </div>
          <QuestionList
            questions={questions}
            activeQuestionId={null}
            onSelect={handleSelectQuestion}
          />
        </>
      )}
    </div>
  )
}

function ActiveQuestionView({ question, recording, feedback, evaluating, onBack }) {
  return (
    <div className="flex flex-col gap-6">
      <button
        className="text-small text-text-muted hover:text-text-secondary transition-colors duration-fast self-start"
        onClick={onBack}
      >
        &larr; All questions
      </button>

      <QuestionCard question={question} isActive />

      <RecordingControls
        state={recording.state}
        duration={recording.duration}
        onStart={recording.startRecording}
        onStop={recording.stopRecording}
        error={recording.error}
      />

      {evaluating && (
        <div className="flex items-center gap-3 justify-center py-4">
          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-text-secondary">Analysing your answer...</span>
        </div>
      )}

      <FeedbackPanel feedback={feedback} />
    </div>
  )
}

export default Practice
