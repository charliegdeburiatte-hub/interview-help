import { useState, useCallback } from 'react'
import { useAppDispatch } from '../context/app-context'
import WelcomeScreen from '../components/setup/WelcomeScreen'
import VoiceProfileWizard from '../components/setup/VoiceProfileWizard'
import OllamaCheck from '../components/setup/OllamaCheck'

const STEPS = {
  WELCOME: 'welcome',
  VOICE_PROFILE: 'voice-profile',
  OLLAMA_CHECK: 'ollama-check'
}

function Setup() {
  const dispatch = useAppDispatch()
  const [step, setStep] = useState(STEPS.WELCOME)

  const handleComplete = useCallback(async () => {
    try {
      await window.api.markSetupComplete()
    } catch {
      // Non-critical — app still works
    }
    dispatch({ type: 'SET_SETUP_COMPLETE' })
  }, [dispatch])

  return (
    <div className="h-screen bg-background flex items-center justify-center p-8">
      {step === STEPS.WELCOME && (
        <WelcomeScreen onContinue={() => setStep(STEPS.VOICE_PROFILE)} />
      )}
      {step === STEPS.VOICE_PROFILE && (
        <VoiceProfileWizard onComplete={() => setStep(STEPS.OLLAMA_CHECK)} />
      )}
      {step === STEPS.OLLAMA_CHECK && (
        <OllamaCheck onComplete={handleComplete} />
      )}
    </div>
  )
}

export default Setup
