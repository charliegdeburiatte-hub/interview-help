import { useState, useRef, useCallback } from 'react'
import { Mic, Square, CheckCircle, Loader2 } from 'lucide-react'

const PROMPTS = [
  {
    instruction: 'Read this in your normal speaking voice:',
    text: 'In my previous role, I worked closely with a cross-functional team to deliver projects on time and within budget.'
  },
  {
    instruction: 'Now a bit faster, like you are excited about something:',
    text: 'One of the things I really enjoyed was solving complex problems and seeing the direct impact of my work on the product.'
  },
  {
    instruction: 'Now quieter and more thoughtful:',
    text: 'Looking back, I think the biggest lesson I learned was the importance of clear communication, especially when things go wrong.'
  }
]

const STATES = { IDLE: 'idle', RECORDING: 'recording', SAVING: 'saving' }

function VoiceProfileWizard({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [recordings, setRecordings] = useState([])
  const [recordingState, setRecordingState] = useState(STATES.IDLE)
  const [error, setError] = useState(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const totalSteps = PROMPTS.length
  const isLastStep = currentStep === totalSteps - 1
  const allRecorded = recordings.length === totalSteps

  const startRecording = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      chunksRef.current = []
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const arrayBuffer = await blob.arrayBuffer()

        setRecordings((prev) => [...prev, arrayBuffer])
        setRecordingState(STATES.IDLE)

        if (!isLastStep) {
          setCurrentStep((prev) => prev + 1)
        }
      }

      mediaRecorder.start()
      setRecordingState(STATES.RECORDING)
    } catch {
      setError('Could not access microphone. Check permissions.')
    }
  }, [isLastStep])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const handleFinish = useCallback(async () => {
    setRecordingState(STATES.SAVING)
    try {
      // Save the combined voice profile via main process
      const combined = await mergeArrayBuffers(recordings)
      await window.api.saveVoiceProfile(combined)
      onComplete()
    } catch {
      setError('Failed to save voice profile. Try again.')
      setRecordingState(STATES.IDLE)
    }
  }, [recordings, onComplete])

  const prompt = PROMPTS[currentStep]

  return (
    <div className="flex flex-col items-center gap-6 max-w-lg text-center">
      <h2 className="text-heading font-semibold">Voice Profile</h2>
      <p className="text-text-secondary text-small">
        We need to learn your voice so we can identify you in recordings.
      </p>

      <StepDots current={currentStep} total={totalSteps} recorded={recordings.length} />

      <div className="bg-surface border border-border rounded-card p-6 w-full">
        <p className="text-small text-text-muted mb-3">{prompt.instruction}</p>
        <p className="text-body text-text-primary leading-relaxed italic">
          &ldquo;{prompt.text}&rdquo;
        </p>
      </div>

      {recordingState === STATES.IDLE && !allRecorded && (
        <button
          className="flex items-center gap-2 bg-accent text-background font-medium px-6 py-2.5 rounded-btn transition-colors duration-fast hover:bg-accent-hover"
          onClick={startRecording}
        >
          <Mic className="w-4 h-4" />
          Record
        </button>
      )}

      {recordingState === STATES.RECORDING && (
        <div className="flex items-center gap-4">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
          </span>
          <span className="text-text-secondary text-small">Recording...</span>
          <button
            className="flex items-center gap-2 border border-border text-text-primary font-medium px-4 py-2 rounded-btn transition-colors duration-fast hover:bg-surface-raised"
            onClick={stopRecording}
          >
            <Square className="w-3.5 h-3.5" />
            Stop
          </button>
        </div>
      )}

      {recordingState === STATES.SAVING && (
        <div className="flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-accent animate-spin" />
          <span className="text-text-secondary">Saving voice profile...</span>
        </div>
      )}

      {allRecorded && recordingState === STATES.IDLE && (
        <button
          className="flex items-center gap-2 bg-accent text-background font-medium px-6 py-2.5 rounded-btn transition-colors duration-fast hover:bg-accent-hover"
          onClick={handleFinish}
        >
          <CheckCircle className="w-4 h-4" />
          Save Profile
        </button>
      )}

      {error && <p className="text-small text-destructive">{error}</p>}
    </div>
  )
}

function StepDots({ current, total, recorded }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`w-2 h-2 rounded-full transition-colors duration-fast ${
            i < recorded
              ? 'bg-accent'
              : i === current
                ? 'bg-text-secondary'
                : 'bg-text-muted'
          }`}
        />
      ))}
    </div>
  )
}

async function mergeArrayBuffers(buffers) {
  const totalLength = buffers.reduce((sum, buf) => sum + buf.byteLength, 0)
  const merged = new Uint8Array(totalLength)
  let offset = 0
  for (const buf of buffers) {
    merged.set(new Uint8Array(buf), offset)
    offset += buf.byteLength
  }
  return merged.buffer
}

export default VoiceProfileWizard
