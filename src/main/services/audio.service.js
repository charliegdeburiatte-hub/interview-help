import { app } from 'electron'
import { join } from 'path'
import { mkdirSync, writeFileSync } from 'fs'

const AUDIO_DIR_NAME = 'recordings'

export function getAudioDirectory() {
  const dir = join(app.getPath('userData'), AUDIO_DIR_NAME)
  mkdirSync(dir, { recursive: true })
  return dir
}

export function saveAudioBlob(arrayBuffer, sessionId) {
  const dir = getAudioDirectory()
  const timestamp = Date.now()
  const filename = `session-${sessionId}-${timestamp}.webm`
  const filePath = join(dir, filename)

  writeFileSync(filePath, Buffer.from(arrayBuffer))
  return filePath
}

export function getAudioPathForSession(sessionId, suffix = '') {
  const dir = getAudioDirectory()
  const timestamp = Date.now()
  const filename = `session-${sessionId}${suffix}-${timestamp}.wav`
  return join(dir, filename)
}
