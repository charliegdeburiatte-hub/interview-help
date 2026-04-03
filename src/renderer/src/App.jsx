import { useEffect } from 'react'
import { AppProvider, useApp, useAppDispatch, PAGES } from './context/app-context'
import { SessionProvider, useSessionState } from './context/session-context'
import AppShell from './components/layout/AppShell'
import TranscriptViewer from './components/shared/TranscriptViewer'
import Setup from './pages/Setup'
import Practice from './pages/Practice'
import RealInterview from './pages/RealInterview'
import SessionReview from './pages/SessionReview'

function AppContent() {
  const { currentPage } = useApp()
  const dispatch = useAppDispatch()

  useEffect(() => {
    async function checkSetup() {
      try {
        const complete = await window.api.isSetupComplete()
        if (!complete) {
          dispatch({ type: 'REQUIRE_SETUP' })
        } else {
          dispatch({ type: 'SET_SETUP_COMPLETE' })
        }
      } catch {
        // If API not available yet, default to practice mode
      }
    }
    checkSetup()
  }, [dispatch])

  if (currentPage === PAGES.SETUP) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <Setup />
      </div>
    )
  }

  return (
    <AppShell rightContent={<TranscriptPanel />}>
      <PageRouter page={currentPage} />
    </AppShell>
  )
}

function PageRouter({ page }) {
  switch (page) {
    case PAGES.PRACTICE:
      return <Practice />
    case PAGES.REAL_INTERVIEW:
      return <RealInterview />
    case PAGES.SESSION_REVIEW:
      return <SessionReview />
    default:
      return <Practice />
  }
}

function TranscriptPanel() {
  const { transcript } = useSessionState()
  if (!transcript) return null
  return <TranscriptViewer segments={transcript.segments} />
}

function App() {
  return (
    <AppProvider>
      <SessionProvider>
        <AppContent />
      </SessionProvider>
    </AppProvider>
  )
}

export default App
