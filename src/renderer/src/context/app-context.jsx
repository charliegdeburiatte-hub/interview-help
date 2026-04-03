import { createContext, useContext, useReducer } from 'react'

const PAGES = {
  SETUP: 'setup',
  PRACTICE: 'practice',
  REAL_INTERVIEW: 'real-interview',
  SESSION_REVIEW: 'session-review'
}

const MODES = {
  PRACTICE: 'practice',
  REAL: 'real'
}

const initialState = {
  currentPage: PAGES.PRACTICE,
  currentMode: MODES.PRACTICE,
  setupComplete: false,
  currentSessionId: null
}

function appReducer(state, action) {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, currentPage: action.page }
    case 'SET_MODE':
      return {
        ...state,
        currentMode: action.mode,
        currentPage: action.mode === MODES.PRACTICE ? PAGES.PRACTICE : PAGES.REAL_INTERVIEW,
        currentSessionId: null
      }
    case 'SET_SESSION':
      return { ...state, currentSessionId: action.sessionId }
    case 'SET_SETUP_COMPLETE':
      return { ...state, setupComplete: true, currentPage: PAGES.PRACTICE }
    case 'REQUIRE_SETUP':
      return { ...state, setupComplete: false, currentPage: PAGES.SETUP }
    case 'VIEW_SESSION':
      return {
        ...state,
        currentSessionId: action.sessionId,
        currentPage: PAGES.SESSION_REVIEW
      }
    default:
      return state
  }
}

const AppContext = createContext(null)
const AppDispatchContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <AppContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}

export function useAppDispatch() {
  const context = useContext(AppDispatchContext)
  if (!context) throw new Error('useAppDispatch must be used within AppProvider')
  return context
}

export { PAGES, MODES }
