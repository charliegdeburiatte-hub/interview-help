const OLLAMA_BASE_URL = 'http://localhost:11434'
const OLLAMA_MODEL = 'mistral-small:22b'
const OLLAMA_TIMEOUT_MS = 120000

export async function checkConnection() {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: controller.signal
    })
    clearTimeout(timeout)

    if (!response.ok) return { connected: false, error: 'Ollama responded with an error' }

    const data = await response.json()
    const hasModel = data.models?.some((m) => m.name.startsWith('mistral-small'))

    return {
      connected: true,
      hasModel,
      models: data.models?.map((m) => m.name) || []
    }
  } catch (err) {
    return {
      connected: false,
      error: err.name === 'AbortError' ? 'Connection timed out' : 'Cannot reach Ollama'
    }
  }
}

export async function generateCompletion({ system, prompt }) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS)

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        system,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 4096
        }
      }),
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Ollama error (${response.status}): ${text}`)
    }

    const data = await response.json()
    return data.response
  } catch (err) {
    clearTimeout(timeout)
    if (err.name === 'AbortError') {
      throw new Error('AI request timed out. The model may be loading — try again in a moment.')
    }
    throw err
  }
}

export function parseJsonResponse(raw) {
  // Strip markdown code fences if present
  let cleaned = raw.trim()
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7)
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3)
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3)
  }
  cleaned = cleaned.trim()

  return JSON.parse(cleaned)
}
