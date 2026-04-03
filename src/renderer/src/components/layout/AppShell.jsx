import LeftPanel from './LeftPanel'
import MiddlePanel from './MiddlePanel'
import RightPanel from './RightPanel'

function AppShell({ children, rightContent }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <LeftPanel />
      <div className="border-l border-border" />
      <MiddlePanel>{children}</MiddlePanel>
      <div className="border-l border-border" />
      <RightPanel>{rightContent}</RightPanel>
    </div>
  )
}

export default AppShell
