import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  // Sessions
  createSession: (data) => ipcRenderer.invoke('sessions:create', data),
  getSessions: () => ipcRenderer.invoke('sessions:list'),
  getSession: (id) => ipcRenderer.invoke('sessions:get', id),
  updateSessionStatus: (id, status) => ipcRenderer.invoke('sessions:update-status', id, status),
  deleteSession: (id) => ipcRenderer.invoke('sessions:delete', id),

  // Questions
  getQuestionsBySession: (sessionId) => ipcRenderer.invoke('questions:get-by-session', sessionId),

  // Answers
  getAnswersByQuestion: (questionId) => ipcRenderer.invoke('answers:get-by-question', questionId),

  // App settings
  isSetupComplete: () => ipcRenderer.invoke('settings:is-setup-complete'),
  markSetupComplete: () => ipcRenderer.invoke('settings:mark-setup-complete'),

  // Ollama — added in Phase 4
  checkOllama: () => ipcRenderer.invoke('ollama:check'),
  generateQuestions: (jd) => ipcRenderer.invoke('ollama:generate-questions', jd),
  evaluateAnswer: (data) => ipcRenderer.invoke('ollama:evaluate-answer', data),
  analyseInterview: (data) => ipcRenderer.invoke('ollama:analyse-interview', data),

  // Audio — added in Phase 5
  saveAudioBlob: (arrayBuffer, sessionId) => ipcRenderer.invoke('audio:save-blob', arrayBuffer, sessionId),

  // Whisper — added in Phase 5
  transcribe: (audioPath) => ipcRenderer.invoke('whisper:transcribe', audioPath),
  transcribeWithDiarization: (audioPath) => ipcRenderer.invoke('whisper:transcribe-diarized', audioPath),

  // Voice profile — added in Phase 7
  saveVoiceProfile: (arrayBuffer) => ipcRenderer.invoke('voice-profile:save', arrayBuffer),
  hasVoiceProfile: () => ipcRenderer.invoke('voice-profile:has'),

  // Export — added in Phase 9
  exportPdf: (sessionId) => ipcRenderer.invoke('export:pdf', sessionId),

  // Events (main → renderer)
  onTranscriptionProgress: (cb) => {
    const handler = (_e, data) => cb(data)
    ipcRenderer.on('whisper:progress', handler)
    return () => ipcRenderer.removeListener('whisper:progress', handler)
  }
})
