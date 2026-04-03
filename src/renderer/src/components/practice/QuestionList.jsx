import QuestionCard from './QuestionCard'

const CATEGORY_ORDER = ['technical', 'behavioural', 'situational', 'motivation', 'culture']

function QuestionList({ questions, activeQuestionId, onSelect }) {
  const grouped = groupByCategory(questions)

  return (
    <div className="flex flex-col gap-6">
      {CATEGORY_ORDER.map((category) => {
        const items = grouped[category]
        if (!items || items.length === 0) return null

        return (
          <div key={category}>
            <h3 className="text-label uppercase tracking-wider text-text-muted mb-3">
              {category} ({items.length})
            </h3>
            <div className="flex flex-col gap-2">
              {items.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  isActive={activeQuestionId === q.id}
                  onClick={() => onSelect(q)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function groupByCategory(questions) {
  const groups = {}
  for (const q of questions) {
    const cat = q.category || 'other'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(q)
  }
  return groups
}

export default QuestionList
