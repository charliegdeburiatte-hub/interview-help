import { createContext, useContext, useReducer } from 'react'

const initialState = {
  sessions: [],
  activeSession: null,
  questions: [],
  answers: {},
  transcript: null,
  loading: false,
  error: null
}

function sessionReducer(state, action) {
  switch (action.type) {
    case 'SET_SESSIONS':
      return { ...state, sessions: action.sessions }
    case 'SET_ACTIVE_SESSION':
      return { ...state, activeSession: action.session }
    case 'SET_QUESTIONS':
      return { ...state, questions: action.questions }
    case 'SET_ANSWERS':
      return { ...state, answers: { ...state.answers, [action.questionId]: action.answers } }
    case 'SET_TRANSCRIPT':
      return { ...state, transcript: action.transcript }
    case 'SET_LOADING':
      return { ...state, loading: action.loading }
    case 'SET_ERROR':
      return { ...state, error: action.error }
    case 'ADD_SESSION':
      return { ...state, sessions: [action.session, ...state.sessions] }
    case 'CLEAR_ACTIVE':
      return { ...state, activeSession: null, questions: [], answers: {}, transcript: null }
    default:
      return state
  }
}

const SessionContext = createContext(null)
const SessionDispatchContext = createContext(null)

export function SessionProvider({ children }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState)

  return (
    <SessionContext.Provider value={state}>
      <SessionDispatchContext.Provider value={dispatch}>
        {children}
      </SessionDispatchContext.Provider>
    </SessionContext.Provider>
  )
}

export function useSessionState() {
  const context = useContext(SessionContext)
  if (!context) throw new Error('useSessionState must be used within SessionProvider')
  return context
}

export function useSessionDispatch() {
  const context = useContext(SessionDispatchContext)
  if (!context) throw new Error('useSessionDispatch must be used within SessionProvider')
  return context
}
