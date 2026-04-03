import { useState, useEffect, useCallback } from 'react'

export function useOllama() {
  const [status, setStatus] = useState({ checking: true, connected: false, hasModel: false })

  const checkConnection = useCallback(async () => {
    setStatus((prev) => ({ ...prev, checking: true }))
    try {
      const result = await window.api.checkOllama()
      setStatus({ checking: false, ...result })
    } catch {
      setStatus({ checking: false, connected: false, error: 'Failed to check connection' })
    }
  }, [])

  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  return { ...status, checkConnection }
}
