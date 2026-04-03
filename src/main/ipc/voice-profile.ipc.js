import { ipcMain } from 'electron'
import { saveVoiceProfile } from '../services/voice-profile.service.js'
import { hasVoiceProfile } from '../db/queries/voice-profile.js'

export function registerVoiceProfileHandlers() {
  ipcMain.handle('voice-profile:save', (_event, arrayBuffer) => {
    try {
      const profile = saveVoiceProfile(arrayBuffer)
      return { success: true, profile }
    } catch (err) {
      console.error('Failed to save voice profile:', err)
      return { error: 'Failed to save voice profile' }
    }
  })

  ipcMain.handle('voice-profile:has', () => {
    return hasVoiceProfile()
  })
}
