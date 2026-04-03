import { getDatabase } from '../database.js'

export function createSession({ mode, company, role }) {
  const db = getDatabase()
  const stmt = db.prepare(
    'INSERT INTO sessions (mode, company, role) VALUES (?, ?, ?)'
  )
  const result = stmt.run(mode, company || null, role || null)
  return getSessionById(result.lastInsertRowid)
}

export function getSessions() {
  const db = getDatabase()
  return db
    .prepare('SELECT * FROM sessions ORDER BY date DESC')
    .all()
}

export function getSessionsByMode(mode) {
  const db = getDatabase()
  return db
    .prepare('SELECT * FROM sessions WHERE mode = ? ORDER BY date DESC')
    .all(mode)
}

export function getSessionById(id) {
  const db = getDatabase()
  return db
    .prepare('SELECT * FROM sessions WHERE id = ?')
    .get(id)
}

export function updateSessionStatus(id, status) {
  const db = getDatabase()
  db.prepare('UPDATE sessions SET status = ? WHERE id = ?').run(status, id)
  return getSessionById(id)
}

export function deleteSession(id) {
  const db = getDatabase()
  db.prepare('DELETE FROM sessions WHERE id = ?').run(id)
}
