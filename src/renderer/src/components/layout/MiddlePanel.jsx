function MiddlePanel({ children }) {
  return (
    <div className="flex-1 bg-background overflow-y-auto">
      <div className="p-8 max-w-3xl mx-auto">
        {children}
      </div>
    </div>
  )
}

export default MiddlePanel
