import { spawn } from 'child_process'
import { join } from 'path'
import { existsSync } from 'fs'
import { platform } from 'os'

const IS_WINDOWS = platform() === 'win32'

// In a packaged Electron app, extraResources land next to the app binary.
// process.resourcesPath points there. In dev mode it's undefined.
function getResourcesWhisperDir() {
  if (process.resourcesPath) {
    return join(process.resourcesPath, 'whisper')
  }
  return null
}

// Resolve whisper binary — checks multiple locations for cross-platform support
function getWhisperBinaryPath() {
  const binName = IS_WINDOWS ? 'whisper-cli.exe' : 'whisper-cli'

  // 1. Check packaged app resources (production)
  const resourcesDir = getResourcesWhisperDir()
  if (resourcesDir) {
    const resourcesPath = join(resourcesDir, binName)
    if (existsSync(resourcesPath)) return resourcesPath
  }

  // 2. Check alongside this script (dev mode)
  const localPath = join(__dirname, binName)
  if (existsSync(localPath)) return localPath

  // 3. Check in a platform-specific subdirectory
  const platformDir = IS_WINDOWS ? 'win' : process.platform === 'darwin' ? 'mac' : 'linux'
  const platformPath = join(__dirname, 'bin', platformDir, binName)
  if (existsSync(platformPath)) return platformPath

  // 4. On Windows, also check common install locations
  if (IS_WINDOWS) {
    const programFiles = process.env.LOCALAPPDATA || 'C:\\Users\\Default\\AppData\\Local'
    const commonPath = join(programFiles, 'whisper.cpp', binName)
    if (existsSync(commonPath)) return commonPath
  }

  // 5. Fallback: assume on PATH
  return binName
}

function getDefaultModelPath() {
  // 1. Check packaged app resources (production)
  const resourcesDir = getResourcesWhisperDir()
  if (resourcesDir) {
    const resourcesModelPath = join(resourcesDir, 'models', 'ggml-base.en.bin')
    if (existsSync(resourcesModelPath)) return resourcesModelPath
  }

  // 2. Check alongside this script (dev mode)
  const localModelPath = join(__dirname, 'models', 'ggml-base.en.bin')
  if (existsSync(localModelPath)) return localModelPath

  // 3. On Windows check common whisper model locations
  if (IS_WINDOWS) {
    const appData = process.env.LOCALAPPDATA || ''
    const commonModelPath = join(appData, 'whisper.cpp', 'models', 'ggml-base.en.bin')
    if (existsSync(commonModelPath)) return commonModelPath
  }

  // Return the resources path if available, otherwise local — error will surface if missing
  return resourcesDir
    ? join(resourcesDir, 'models', 'ggml-base.en.bin')
    : localModelPath
}

export function transcribe(audioPath, options = {}) {
  const {
    modelPath = getDefaultModelPath(),
    language = 'en',
    onProgress = null
  } = options

  return new Promise((resolve, reject) => {
    const binaryPath = getWhisperBinaryPath()
    const args = [
      '-m', modelPath,
      '-f', audioPath,
      '-l', language,
      '--output-json',
      '--no-prints'
    ]

    // On Windows, windowsHide prevents a console window flashing
    const proc = spawn(binaryPath, args, {
      windowsHide: true
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data) => {
      stdout += data.toString()
      if (onProgress) onProgress({ stage: 'transcribing' })
    })

    proc.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Whisper exited with code ${code}: ${stderr}`))
        return
      }

      try {
        const result = JSON.parse(stdout)
        resolve(formatTranscript(result))
      } catch {
        // If JSON parsing fails, treat stdout as plain text transcript
        resolve({ segments: [{ text: stdout.trim(), start: 0, end: 0 }] })
      }
    })

    proc.on('error', (err) => {
      if (err.code === 'ENOENT') {
        reject(new Error(
          'Whisper binary not found. Place whisper-cli' +
          (IS_WINDOWS ? '.exe' : '') +
          ' in the whisper/ directory or install it on your system PATH.'
        ))
      } else {
        reject(new Error(`Failed to start Whisper: ${err.message}`))
      }
    })
  })
}

export function transcribeWithDiarization(audioPath, voiceProfilePath, options = {}) {
  // Diarization is a future enhancement — for now, fall back to standard transcription
  return transcribe(audioPath, {
    ...options
  })
}

function formatTranscript(whisperOutput) {
  const segments = (whisperOutput.transcription || whisperOutput.segments || []).map((seg) => ({
    text: seg.text?.trim() || '',
    start: seg.offsets?.from || seg.start || 0,
    end: seg.offsets?.to || seg.end || 0
  }))

  const fullText = segments.map((s) => s.text).join(' ')

  return { segments, fullText }
}
