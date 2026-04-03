import { registerSessionHandlers } from './sessions.ipc.js'
import { registerQuestionHandlers } from './questions.ipc.js'
import { registerAnswerHandlers } from './answers.ipc.js'
import { registerSettingsHandlers } from './settings.ipc.js'
import { registerOllamaHandlers } from './ollama.ipc.js'
import { registerAudioHandlers } from './audio.ipc.js'
import { registerWhisperHandlers } from './whisper.ipc.js'
import { registerVoiceProfileHandlers } from './voice-profile.ipc.js'
import { registerExportHandlers } from './export.ipc.js'

export function registerAllIpcHandlers() {
  registerSessionHandlers()
  registerQuestionHandlers()
  registerAnswerHandlers()
  registerSettingsHandlers()
  registerOllamaHandlers()
  registerAudioHandlers()
  registerWhisperHandlers()
  registerVoiceProfileHandlers()
  registerExportHandlers()
}
