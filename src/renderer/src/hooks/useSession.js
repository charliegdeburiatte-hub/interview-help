import { useCallback, useEffect } from 'react'
import { useSessionState, useSessionDispatch } from '../context/session-context'

export function useSession() {
  const state = useSessionState()
  const dispatch = useSessionDispatch()

  const loadSessions = useCallback(async () => {
    try {
      const sessions = await window.api.getSessions()
      dispatch({ type: 'SET_SESSIONS', sessions })
    } catch (err) {
      console.error('Failed to load sessions:', err)
      dispatch({ type: 'SET_ERROR', error: 'Failed to load sessions' })
    }
  }, [dispatch])

  const createSession = useCallback(async ({ mode, company, role }) => {
    try {
      const session = await window.api.createSession({ mode, company, role })
      dispatch({ type: 'ADD_SESSION', session })
      dispatch({ type: 'SET_ACTIVE_SESSION', session })
      return session
    } catch (err) {
      console.error('Failed to create session:', err)
      dispatch({ type: 'SET_ERROR', error: 'Failed to create session' })
      return null
    }
  }, [dispatch])

  const loadSession = useCallback(async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', loading: true })
      const session = await window.api.getSession(id)
      dispatch({ type: 'SET_ACTIVE_SESSION', session })

      if (session) {
        const questions = await window.api.getQuestionsBySession(id)
        dispatch({ type: 'SET_QUESTIONS', questions })
      }
    } catch (err) {
      console.error('Failed to load session:', id, err)
      dispatch({ type: 'SET_ERROR', error: 'Failed to load session' })
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false })
    }
  }, [dispatch])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  return {
    ...state,
    loadSessions,
    createSession,
    loadSession
  }
}
