import { getDatabase } from '../database.js'

export function insertRealInterview({ sessionId, audioPath }) {
  const db = getDatabase()
  const stmt = db.prepare(
    'INSERT INTO real_interviews (session_id, audio_path) VALUES (?, ?)'
  )
  const result = stmt.run(sessionId, audioPath)
  return getRealInterviewById(result.lastInsertRowid)
}

export function getRealInterviewBySession(sessionId) {
  const db = getDatabase()
  return db
    .prepare('SELECT * FROM real_interviews WHERE session_id = ?')
    .get(sessionId)
}

export function getRealInterviewById(id) {
  const db = getDatabase()
  return db
    .prepare('SELECT * FROM real_interviews WHERE id = ?')
    .get(id)
}

export function updateTranscript(id, transcriptJson) {
  const db = getDatabase()
  db.prepare(
    'UPDATE real_interviews SET transcript_json = ? WHERE id = ?'
  ).run(JSON.stringify(transcriptJson), id)
  return getRealInterviewById(id)
}

export function updateAnalysis(id, analysisJson) {
  const db = getDatabase()
  db.prepare(
    'UPDATE real_interviews SET analysis_json = ? WHERE id = ?'
  ).run(JSON.stringify(analysisJson), id)
  return getRealInterviewById(id)
}
