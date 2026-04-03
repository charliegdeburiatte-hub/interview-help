import { getDatabase } from '../database.js'

export function insertVoiceProfile(audioSamplesPath) {
  const db = getDatabase()
  const stmt = db.prepare(
    'INSERT INTO voice_profile (audio_samples_path) VALUES (?)'
  )
  const result = stmt.run(audioSamplesPath)
  return getVoiceProfile(result.lastInsertRowid)
}

export function getVoiceProfile(id) {
  const db = getDatabase()
  return db
    .prepare('SELECT * FROM voice_profile WHERE id = ?')
    .get(id)
}

export function getLatestVoiceProfile() {
  const db = getDatabase()
  return db
    .prepare('SELECT * FROM voice_profile ORDER BY created_at DESC LIMIT 1')
    .get()
}

export function hasVoiceProfile() {
  const profile = getLatestVoiceProfile()
  return !!profile
}
