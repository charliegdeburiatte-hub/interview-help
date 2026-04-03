import { app } from 'electron'
import { join } from 'path'
import { mkdirSync, writeFileSync } from 'fs'
import { insertVoiceProfile } from '../db/queries/voice-profile.js'

const VOICE_PROFILE_DIR = 'voice-profiles'

export function saveVoiceProfile(arrayBuffer) {
  const dir = join(app.getPath('userData'), VOICE_PROFILE_DIR)
  mkdirSync(dir, { recursive: true })

  const timestamp = Date.now()
  const filename = `voice-profile-${timestamp}.webm`
  const filePath = join(dir, filename)

  writeFileSync(filePath, Buffer.from(arrayBuffer))

  const profile = insertVoiceProfile(filePath)
  return profile
}
