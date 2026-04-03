import { useState, useRef, useCallback } from 'react'

const RECORDING_STATES = {
  IDLE: 'idle',
  RECORDING: 'recording',
  PROCESSING: 'processing'
}

export function useRecording({ sessionId, onTranscript }) {
  const [state, setState] = useState(RECORDING_STATES.IDLE)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState(null)

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)

  const startRecording = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      chunksRef.current = []
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        // Stop all tracks to release mic
        stream.getTracks().forEach((track) => track.stop())
        clearInterval(timerRef.current)

        setState(RECORDING_STATES.PROCESSING)

        try {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
          const arrayBuffer = await blob.arrayBuffer()

          // Save to disk via main process
          const saveResult = await window.api.saveAudioBlob(arrayBuffer, sessionId)
          if (saveResult.error) throw new Error(saveResult.error)

          // Transcribe
          const transcript = await window.api.transcribe(saveResult.path)
          if (transcript.error) throw new Error(transcript.error)

          const finalDuration = Math.round((Date.now() - startTimeRef.current) / 1000)

          if (onTranscript) {
            onTranscript({
              audioPath: saveResult.path,
              transcript: transcript.fullText,
              segments: transcript.segments,
              duration: finalDuration
            })
          }
        } catch (err) {
          console.error('Recording processing failed:', err)
          setError('Failed to process recording. Try again.')
        } finally {
          setState(RECORDING_STATES.IDLE)
        }
      }

      mediaRecorder.start(1000)
      startTimeRef.current = Date.now()
      setState(RECORDING_STATES.RECORDING)

      // Update duration every second
      timerRef.current = setInterval(() => {
        setDuration(Math.round((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
    } catch (err) {
      console.error('Failed to start recording:', err)
      setError('Could not access microphone. Check permissions.')
      setState(RECORDING_STATES.IDLE)
    }
  }, [sessionId, onTranscript])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  return {
    state,
    duration,
    error,
    isIdle: state === RECORDING_STATES.IDLE,
    isRecording: state === RECORDING_STATES.RECORDING,
    isProcessing: state === RECORDING_STATES.PROCESSING,
    startRecording,
    stopRecording
  }
}

export { RECORDING_STATES }
