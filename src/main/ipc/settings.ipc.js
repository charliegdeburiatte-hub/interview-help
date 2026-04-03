import { ipcMain } from 'electron'
import { isSetupComplete, markSetupComplete } from '../db/queries/app-settings.js'

export function registerSettingsHandlers() {
  ipcMain.handle('settings:is-setup-complete', () => {
    return isSetupComplete()
  })

  ipcMain.handle('settings:mark-setup-complete', () => {
    markSetupComplete()
    return true
  })
}
