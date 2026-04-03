import { ipcMain, BrowserWindow } from 'electron'
import { transcribeAudio, transcribeWithSpeakers } from '../services/whisper.service.js'
import { getLatestVoiceProfile } from '../db/queries/voice-profile.js'

export function registerWhisperHandlers() {
  ipcMain.handle('whisper:transcribe', async (event, audioPath) => {
    try {
      const win = BrowserWindow.fromWebContents(event.sender)
      const onProgress = (data) => {
        win?.webContents.send('whisper:progress', data)
      }

      const result = await transcribeAudio(audioPath, onProgress)
      return result
    } catch (err) {
      console.error('Transcription IPC failed:', err)
      return { error: 'Transcription failed. Check that whisper is installed.' }
    }
  })

  ipcMain.handle('whisper:transcribe-diarized', async (event, audioPath) => {
    try {
      const win = BrowserWindow.fromWebContents(event.sender)
      const onProgress = (data) => {
        win?.webContents.send('whisper:progress', data)
      }

      const profile = getLatestVoiceProfile()
      const voiceProfilePath = profile?.audio_samples_path || null

      const result = await transcribeWithSpeakers(audioPath, voiceProfilePath, onProgress)
      return result
    } catch (err) {
      console.error('Diarized transcription IPC failed:', err)
      return { error: 'Transcription failed. Check that whisper is installed.' }
    }
  })
}
