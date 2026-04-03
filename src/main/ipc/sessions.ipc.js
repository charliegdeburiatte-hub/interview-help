import { ipcMain } from 'electron'
import {
  createSession,
  getSessions,
  getSessionById,
  updateSessionStatus,
  deleteSession
} from '../db/queries/sessions.js'

export function registerSessionHandlers() {
  ipcMain.handle('sessions:create', (_event, data) => {
    return createSession(data)
  })

  ipcMain.handle('sessions:list', () => {
    return getSessions()
  })

  ipcMain.handle('sessions:get', (_event, id) => {
    return getSessionById(id)
  })

  ipcMain.handle('sessions:update-status', (_event, id, status) => {
    return updateSessionStatus(id, status)
  })

  ipcMain.handle('sessions:delete', (_event, id) => {
    return deleteSession(id)
  })
}
