const STAR_LABELS = {
  situation: 'Situation',
  task: 'Task',
  action: 'Action',
  result: 'Result'
}

function STARScore({ star }) {
  if (!star) return null

  return (
    <div>
      <h3 className="text-label uppercase tracking-wider text-text-muted mb-3">
        STAR Analysis
      </h3>
      <div className="border-t border-border-subtle mb-3" />
      <div className="flex flex-col gap-2">
        {Object.entries(STAR_LABELS).map(([key, label]) => {
          const item = star[key]
          if (!item) return null

          return (
            <div key={key} className="flex items-start gap-3">
              <span className={`mt-0.5 ${item.pass ? 'text-positive' : 'text-accent'}`}>
                {item.pass ? '\u25CF' : '\u25CB'}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-body text-text-primary font-medium">
                  {label}
                </span>
                {item.note && (
                  <span className="text-body text-text-secondary ml-2">
                    {item.note}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default STARScore
