function WelcomeScreen({ onContinue }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 max-w-md text-center">
      <h1 className="text-display font-semibold">Interview Help</h1>
      <p className="text-text-secondary text-body leading-relaxed">
        Prepare for interviews with AI-powered practice, or analyse real
        interview recordings to improve over time. Everything runs locally
        on your machine.
      </p>
      <button
        className="bg-accent text-background font-medium px-6 py-2.5 rounded-btn transition-colors duration-fast hover:bg-accent-hover"
        onClick={onContinue}
      >
        Get Started
      </button>
    </div>
  )
}

export default WelcomeScreen
