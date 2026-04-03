import { BrowserWindow } from 'electron'
import { getSessionById } from '../db/queries/sessions.js'
import { getQuestionsBySession } from '../db/queries/questions.js'
import { getAnswersByQuestion } from '../db/queries/answers.js'
import { getRealInterviewBySession } from '../db/queries/real-interviews.js'

export async function exportSessionToPdf(sessionId, outputPath) {
  const session = getSessionById(sessionId)
  if (!session) throw new Error(`Session ${sessionId} not found`)

  const html = buildSessionHtml(session)

  // Use a hidden BrowserWindow to render HTML and print to PDF
  const win = new BrowserWindow({
    show: false,
    width: 800,
    height: 600,
    webPreferences: { offscreen: true }
  })

  try {
    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)

    const pdfBuffer = await win.webContents.printToPDF({
      printBackground: true,
      preferCSSPageSize: true,
      margins: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 }
    })

    const { writeFileSync } = await import('fs')
    writeFileSync(outputPath, pdfBuffer)

    return { success: true, path: outputPath }
  } finally {
    win.destroy()
  }
}

function buildSessionHtml(session) {
  const isPractice = session.mode === 'practice'
  const title = [session.company, session.role].filter(Boolean).join(' — ') || 'Session'
  const date = new Date(session.date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  let content = ''

  if (isPractice) {
    content = buildPracticeContent(session.id)
  } else {
    content = buildInterviewContent(session.id)
  }

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; color: #222; max-width: 700px; margin: 0 auto; padding: 40px 20px; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .meta { color: #666; font-size: 13px; margin-bottom: 24px; }
    h2 { font-size: 16px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 28px; }
    h3 { font-size: 15px; margin-top: 16px; }
    .question { background: #f5f5f5; padding: 12px 16px; border-radius: 6px; margin: 8px 0; }
    .star { display: flex; gap: 20px; margin: 8px 0; }
    .star-item { font-size: 13px; }
    .pass { color: #2e7d51; }
    .miss { color: #c47a1a; }
    .strength { color: #2e7d51; }
    .opportunity { color: #c47a1a; }
    .transcript { font-family: monospace; font-size: 12px; color: #555; background: #fafafa; padding: 12px; border-radius: 6px; white-space: pre-wrap; }
    .section { margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p class="meta">${escapeHtml(date)} — ${isPractice ? 'Practice' : 'Real Interview'}</p>
  ${content}
</body>
</html>`
}

function buildPracticeContent(sessionId) {
  const questions = getQuestionsBySession(sessionId)
  if (questions.length === 0) return '<p>No questions in this session.</p>'

  return questions.map((q) => {
    const answers = getAnswersByQuestion(q.id)
    const latestAnswer = answers[0]

    let answerHtml = '<p style="color: #999;">No answer recorded</p>'
    if (latestAnswer) {
      const feedback = latestAnswer.feedback_json ? JSON.parse(latestAnswer.feedback_json) : null

      answerHtml = `
        ${latestAnswer.transcript ? `<div class="transcript">${escapeHtml(latestAnswer.transcript)}</div>` : ''}
        ${feedback ? buildFeedbackHtml(feedback) : ''}
      `
    }

    return `
      <div class="section">
        <div class="question">
          ${q.category ? `<small style="text-transform: uppercase; color: #888;">${escapeHtml(q.category)}</small><br>` : ''}
          <strong>${escapeHtml(q.text)}</strong>
        </div>
        ${answerHtml}
      </div>
    `
  }).join('')
}

function buildFeedbackHtml(feedback) {
  let html = ''

  if (feedback.star) {
    html += '<div class="star">'
    for (const [key, val] of Object.entries(feedback.star)) {
      const cls = val.pass ? 'pass' : 'miss'
      const icon = val.pass ? '●' : '○'
      html += `<span class="star-item ${cls}">${icon} ${key}</span>`
    }
    html += '</div>'
  }

  if (feedback.strengths?.length > 0) {
    html += '<h3>Strengths</h3>'
    feedback.strengths.forEach((s) => {
      html += `<p class="strength">+ ${escapeHtml(s)}</p>`
    })
  }

  if (feedback.opportunities?.length > 0) {
    html += '<h3>Opportunities</h3>'
    feedback.opportunities.forEach((o) => {
      html += `<p class="opportunity">→ ${escapeHtml(o)}</p>`
    })
  }

  if (feedback.suggestedImprovement) {
    html += `<h3>One Thing to Improve</h3><p>${escapeHtml(feedback.suggestedImprovement)}</p>`
  }

  return html
}

function buildInterviewContent(sessionId) {
  const interview = getRealInterviewBySession(sessionId)
  if (!interview) return '<p>No interview data found.</p>'

  let html = ''

  if (interview.transcript_json) {
    const transcript = JSON.parse(interview.transcript_json)
    html += `<h2>Transcript</h2><div class="transcript">${escapeHtml(
      typeof transcript === 'string' ? transcript : transcript.fullText || JSON.stringify(transcript)
    )}</div>`
  }

  if (interview.analysis_json) {
    const analysis = JSON.parse(interview.analysis_json)

    if (analysis.overallImpression) {
      html += `<h2>Overall</h2><p>${escapeHtml(analysis.overallImpression)}</p>`
    }

    if (analysis.strongestMoments?.length > 0) {
      html += '<h2>Strongest Moments</h2>'
      analysis.strongestMoments.forEach((m) => {
        html += `<p class="strength">● ${m.timestamp} — ${escapeHtml(m.observation)}</p>`
      })
    }

    if (analysis.areasToDevlop?.length > 0) {
      html += '<h2>Areas to Develop</h2>'
      analysis.areasToDevlop.forEach((m) => {
        html += `<p class="opportunity">→ ${m.timestamp} — ${escapeHtml(m.observation)}</p>`
      })
    }
  }

  return html
}

function escapeHtml(str) {
  if (!str) return ''
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
