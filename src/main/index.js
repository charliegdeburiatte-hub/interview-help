import { app, BrowserWindow, Menu, shell, dialog } from 'electron'
import { join } from 'path'
import { existsSync, writeFileSync } from 'fs'
import { is } from '@electron-toolkit/utils'
import electronUpdater from 'electron-updater'
import { getDatabase, closeDatabase } from './db/database.js'
import { registerAllIpcHandlers } from './ipc/register-ipc.js'

const { autoUpdater } = electronUpdater

function getSetupGuidePath() {
  return is.dev
    ? join(app.getAppPath(), 'SETUP-GUIDE.md')
    : join(process.resourcesPath, 'SETUP-GUIDE.md')
}

function openSetupGuide() {
  const guidePath = getSetupGuidePath()
  if (existsSync(guidePath)) {
    shell.openPath(guidePath)
  } else {
    dialog.showErrorBox('Setup Guide not found', `Expected at: ${guidePath}`)
  }
}

function buildMenu() {
  const template = [
    ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),
    { role: 'fileMenu' },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    {
      role: 'help',
      submenu: [
        { label: 'View Setup Guide', click: openSetupGuide },
        { type: 'separator' },
        {
          label: 'Check for Updates',
          click: () => {
            autoUpdater.checkForUpdatesAndNotify().catch((err) => {
              dialog.showErrorBox('Update check failed', String(err))
            })
          }
        }
      ]
    }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

function maybeShowFirstRunGuide() {
  const flagPath = join(app.getPath('userData'), '.setup-guide-shown')
  if (existsSync(flagPath)) return
  writeFileSync(flagPath, new Date().toISOString())

  const choice = dialog.showMessageBoxSync({
    type: 'info',
    title: 'Welcome to Interview Help',
    message: 'First-time setup required',
    detail:
      'Interview Help needs Ollama (and a pulled model) running before it will work. Open the setup guide now?',
    buttons: ['Open Setup Guide', 'Later'],
    defaultId: 0,
    cancelId: 1
  })
  if (choice === 0) openSetupGuide()
}

const APP_WIDTH = 1280
const APP_HEIGHT = 800
const MIN_WIDTH = 1024
const MIN_HEIGHT = 600

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: APP_WIDTH,
    height: APP_HEIGHT,
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    backgroundColor: '#0C0C0C',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  getDatabase()
  registerAllIpcHandlers()
  buildMenu()
  createWindow()
  maybeShowFirstRunGuide()

  if (!is.dev) {
    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      console.error('Auto-update check failed:', err)
    })
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  closeDatabase()
})
