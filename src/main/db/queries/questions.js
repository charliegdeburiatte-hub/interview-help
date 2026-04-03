import { getDatabase } from '../database.js'

export function insertQuestions(sessionId, questions) {
  const db = getDatabase()
  const stmt = db.prepare(
    'INSERT INTO questions (session_id, text, category, source) VALUES (?, ?, ?, ?)'
  )

  const insertMany = db.transaction((items) => {
    for (const q of items) {
      stmt.run(sessionId, q.text, q.category || null, q.source)
    }
  })

  insertMany(questions)
  return getQuestionsBySession(sessionId)
}

export function getQuestionsBySession(sessionId) {
  const db = getDatabase()
  return db
    .prepare('SELECT * FROM questions WHERE session_id = ? ORDER BY id')
    .all(sessionId)
}

export function getQuestionById(id) {
  const db = getDatabase()
  return db
    .prepare('SELECT * FROM questions WHERE id = ?')
    .get(id)
}
