import { ipcMain } from 'electron'
import { getAnswersByQuestion } from '../db/queries/answers.js'

export function registerAnswerHandlers() {
  ipcMain.handle('answers:get-by-question', (_event, questionId) => {
    return getAnswersByQuestion(questionId)
  })
}
