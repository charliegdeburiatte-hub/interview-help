function QuestionCard({ question, isActive, onClick }) {
  return (
    <button
      className={`w-full text-left p-4 bg-surface border rounded-card transition-colors duration-fast ${
        isActive
          ? 'border-accent'
          : 'border-border hover:border-border'
      }`}
      onClick={onClick}
    >
      {question.category && (
        <p className="text-label uppercase tracking-wider text-text-muted mb-2">
          {question.category}
        </p>
      )}
      <p className="text-heading text-text-primary leading-snug">
        {question.text}
      </p>
    </button>
  )
}

export default QuestionCard
