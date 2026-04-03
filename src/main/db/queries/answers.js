import { getDatabase } from '../database.js'

export function insertAnswer({ questionId, audioPath, transcript, duration }) {
  const db = getDatabase()
  const stmt = db.prepare(
    'INSERT INTO answers (question_id, audio_path, transcript, duration) VALUES (?, ?, ?, ?)'
  )
  const result = stmt.run(questionId, audioPath || null, transcript || null, duration || null)
  return getAnswerById(result.lastInsertRowid)
}

export function getAnswersByQuestion(questionId) {
  const db = getDatabase()
  return db
    .prepare('SELECT * FROM answers WHERE question_id = ? ORDER BY date DESC')
    .all(questionId)
}

export function getAnswerById(id) {
  const db = getDatabase()
  return db
    .prepare('SELECT * FROM answers WHERE id = ?')
    .get(id)
}

export function updateAnswerTranscript(id, transcript) {
  const db = getDatabase()
  db.prepare('UPDATE answers SET transcript = ? WHERE id = ?').run(transcript, id)
  return getAnswerById(id)
}

export function updateAnswerFeedback(id, feedbackJson, starScores) {
  const db = getDatabase()
  db.prepare(
    'UPDATE answers SET feedback_json = ?, star_scores = ? WHERE id = ?'
  ).run(
    JSON.stringify(feedbackJson),
    JSON.stringify(starScores),
    id
  )
  return getAnswerById(id)
}
