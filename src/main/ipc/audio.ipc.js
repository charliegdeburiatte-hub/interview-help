import { ipcMain } from 'electron'
import { saveAudioBlob } from '../services/audio.service.js'

export function registerAudioHandlers() {
  ipcMain.handle('audio:save-blob', (_event, arrayBuffer, sessionId) => {
    try {
      const filePath = saveAudioBlob(arrayBuffer, sessionId)
      return { path: filePath }
    } catch (err) {
      console.error('Failed to save audio:', err)
      return { error: 'Failed to save recording' }
    }
  })
}
