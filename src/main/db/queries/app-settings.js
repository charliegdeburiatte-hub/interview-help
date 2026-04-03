import { getDatabase } from '../database.js'

export function getSetting(key) {
  const db = getDatabase()
  const row = db
    .prepare('SELECT value FROM app_settings WHERE key = ?')
    .get(key)
  return row ? row.value : null
}

export function setSetting(key, value) {
  const db = getDatabase()
  db.prepare(
    'INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?'
  ).run(key, value, value)
}

export function isSetupComplete() {
  return getSetting('setup_complete') === 'true'
}

export function markSetupComplete() {
  setSetting('setup_complete', 'true')
}
