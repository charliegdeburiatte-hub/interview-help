function RightPanel({ children }) {
  return (
    <div className="w-80 shrink-0 bg-surface flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle">
        <p className="text-subheading font-medium text-text-secondary">
          Transcript
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {children || (
          <p className="text-text-muted text-small">
            Transcript will appear here
          </p>
        )}
      </div>
    </div>
  )
}

export default RightPanel
