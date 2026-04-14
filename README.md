# Interview Help

A local-first desktop app for interview preparation and analysis. Generates practice questions, records your answers, transcribes them, and gives you feedback — all running on your own machine. No accounts, no cloud, no subscriptions.

## Download

Grab the latest installer from the [Releases page](https://github.com/charliegdeburiatte-hub/interview-help/releases/latest):

- **`Interview Help Setup 1.0.0.exe`** — Windows installer (recommended). Creates shortcuts, supports auto-update.
- **`InterviewHelp-Portable-v1.0.0-win-x64.zip`** — portable zip if you'd rather not install.

## Before you run it

Interview Help depends on two tools running locally on your machine:

- **[Ollama](https://ollama.com/download)** — runs the AI model on your GPU.
- **Whisper** — transcribes your voice. Bundled with the app.

Read [`SETUP-GUIDE.md`](./SETUP-GUIDE.md) for step-by-step setup instructions. You need Ollama installed and the AI model pulled before the app will work.

## How it works

Everything runs on your machine:

- **Ollama** generates questions and feedback using a local LLM.
- **Whisper** transcribes your spoken answers to text.
- **SQLite** stores your session history locally.

Nothing is ever sent to an external server.

## Auto-update

The installed app checks GitHub Releases on launch and prompts to install new versions automatically. The portable zip does not auto-update — you'll need to re-download manually.

## Building from source

```bash
npm install
npm run dev        # run in development
npm run dist       # build Windows installer (requires wine on Linux)
```

## Tech stack

Electron · React · Vite · better-sqlite3 · electron-builder · electron-updater
