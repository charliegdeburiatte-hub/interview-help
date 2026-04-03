import { transcribe, transcribeWithDiarization } from '../../../whisper/transcribe.js'

export async function transcribeAudio(audioPath, onProgress) {
  try {
    if (onProgress) onProgress({ stage: 'starting', progress: 0 })

    const result = await transcribe(audioPath, {
      onProgress: (data) => {
        if (onProgress) onProgress({ stage: 'transcribing', ...data })
      }
    })

    if (onProgress) onProgress({ stage: 'complete', progress: 100 })
    return result
  } catch (err) {
    console.error('Transcription failed:', audioPath, err)
    throw new Error('Transcription failed. Make sure whisper is installed correctly.')
  }
}

export async function transcribeWithSpeakers(audioPath, voiceProfilePath, onProgress) {
  try {
    if (onProgress) onProgress({ stage: 'starting', progress: 0 })

    const result = await transcribeWithDiarization(audioPath, voiceProfilePath, {
      onProgress: (data) => {
        if (onProgress) onProgress({ stage: 'transcribing', ...data })
      }
    })

    if (onProgress) onProgress({ stage: 'complete', progress: 100 })
    return result
  } catch (err) {
    console.error('Diarized transcription failed:', audioPath, err)
    throw new Error('Transcription failed. Make sure whisper is installed correctly.')
  }
}
