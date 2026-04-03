import { ipcMain } from 'electron'
import { checkConnection, generateCompletion, parseJsonResponse } from '../services/ollama.service.js'
import { buildGenerateQuestionsPrompt } from '../../../prompts/generateQuestions.js'
import { buildEvaluateAnswerPrompt } from '../../../prompts/evaluateAnswer.js'
import { buildAnalyseInterviewPrompt } from '../../../prompts/analyseInterview.js'
import { insertQuestions } from '../db/queries/questions.js'
import { insertAnswer, updateAnswerFeedback } from '../db/queries/answers.js'
import { updateAnalysis } from '../db/queries/real-interviews.js'

export function registerOllamaHandlers() {
  ipcMain.handle('ollama:check', async () => {
    try {
      return await checkConnection()
    } catch (err) {
      console.error('Ollama check failed:', err)
      return { connected: false, error: 'Failed to check Ollama connection' }
    }
  })

  ipcMain.handle('ollama:generate-questions', async (_event, { jobDescription, sessionId }) => {
    try {
      const promptData = buildGenerateQuestionsPrompt(jobDescription)
      const raw = await generateCompletion(promptData)
      const parsed = parseJsonResponse(raw)

      if (!parsed.questions) {
        throw new Error('Invalid response structure — missing questions')
      }

      // Flatten into DB format and insert
      const questionsToInsert = []
      for (const [category, items] of Object.entries(parsed.questions)) {
        for (const text of items) {
          questionsToInsert.push({ text, category, source: 'jd_generated' })
        }
      }

      const saved = insertQuestions(sessionId, questionsToInsert)

      return {
        role: parsed.role,
        company: parsed.company,
        questions: saved
      }
    } catch (err) {
      console.error('Question generation failed:', err)
      return {
        error: "Couldn't generate questions. Check Ollama is running and try again."
      }
    }
  })

  ipcMain.handle('ollama:evaluate-answer', async (_event, data) => {
    const { questionId, question, transcript, durationSeconds, jobTitle, keyRequirements } = data

    try {
      // Save the answer first
      const answer = insertAnswer({
        questionId,
        transcript,
        duration: durationSeconds,
        audioPath: data.audioPath || null
      })

      const promptData = buildEvaluateAnswerPrompt({
        jobTitle,
        keyRequirements,
        question,
        transcript,
        durationSeconds
      })

      const raw = await generateCompletion(promptData)
      const parsed = parseJsonResponse(raw)

      if (!parsed.star) {
        throw new Error('Invalid response structure — missing STAR analysis')
      }

      updateAnswerFeedback(answer.id, parsed, parsed.star)

      return { answerId: answer.id, feedback: parsed }
    } catch (err) {
      console.error('Answer evaluation failed:', err)
      return {
        error: "Feedback couldn't be generated. Check Ollama is running and try again."
      }
    }
  })

  ipcMain.handle('ollama:analyse-interview', async (_event, data) => {
    const { realInterviewId, jobTitle, company, transcript } = data

    try {
      const promptData = buildAnalyseInterviewPrompt({ jobTitle, company, transcript })
      const raw = await generateCompletion(promptData)
      const parsed = parseJsonResponse(raw)

      if (!parsed.overallImpression) {
        throw new Error('Invalid response structure — missing overall impression')
      }

      if (realInterviewId) {
        updateAnalysis(realInterviewId, parsed)
      }

      return { analysis: parsed }
    } catch (err) {
      console.error('Interview analysis failed:', err)
      return {
        error: "Analysis couldn't be completed. Check Ollama is running and try again."
      }
    }
  })
}
