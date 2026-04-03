import { ipcMain } from 'electron'
import { getQuestionsBySession } from '../db/queries/questions.js'

export function registerQuestionHandlers() {
  ipcMain.handle('questions:get-by-session', (_event, sessionId) => {
    return getQuestionsBySession(sessionId)
  })
}
