import { ipcMain, dialog } from 'electron'
import { exportSessionToPdf } from '../services/export.service.js'

export function registerExportHandlers() {
  ipcMain.handle('export:pdf', async (event, sessionId) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Export Session as PDF',
        defaultPath: `interview-session-${sessionId}.pdf`,
        filters: [{ name: 'PDF', extensions: ['pdf'] }]
      })

      if (canceled || !filePath) {
        return { canceled: true }
      }

      const result = await exportSessionToPdf(sessionId, filePath)
      return result
    } catch (err) {
      console.error('PDF export failed:', err)
      return { error: 'Failed to export PDF. Try again.' }
    }
  })
}
