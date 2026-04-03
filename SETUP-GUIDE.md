# Interview Help — Complete Setup Guide

This guide walks you through everything you need to get Interview Help running on your Windows 11 machine, from scratch. No prior experience with any of these tools is assumed.

---

## What You're Setting Up

Interview Help is a desktop application that runs entirely on your machine. It uses:

- **Ollama** — runs an AI model locally on your GPU for generating questions and feedback
- **Whisper** — transcribes your voice recordings into text, also runs locally

Nothing ever leaves your machine. No accounts, no cloud, no subscriptions.

The app itself is a single installer — you install it like any normal Windows program. But it depends on Ollama and Whisper running separately on your machine, so those need to be set up first.

---

## Step 1: Install Ollama (the AI engine)

Ollama is what runs the AI model on your machine. It uses your GPU to generate interview questions and give you feedback.

1. Go to **https://ollama.com/download**
2. Click **"Download for Windows"**
3. Run the installer — just follow the prompts
4. Once installed, Ollama runs as a background service. You'll see a small llama icon in your system tray (bottom-right of your taskbar — you may need to click the ^ arrow to see it)

### Download the AI model

Ollama is the engine — you also need to download the actual brain. Open a terminal (search for "Terminal" or "PowerShell" in the Start menu) and run:

```
ollama pull mistral-small:22b
```

**This will download about 12 GB.** It's a one-time download. Go make a coffee.

### Verify it worked

Once the download finishes, test it:

```
ollama run mistral-small:22b "Say hello in one sentence"
```

You should see the model respond with a greeting. Type `/bye` to exit.

### GPU Requirements

This model needs a GPU with **at least 16 GB of VRAM** to run well:

- **NVIDIA RTX 3090 / 4080 / 4090** — you're good
- **NVIDIA RTX 3080 (10 GB)** — it will work but will be slower
- **NVIDIA RTX 3060 / 3070** — consider a smaller model: `ollama pull mistral-small:latest`
- **No dedicated GPU / integrated graphics** — it will still work but will be noticeably slow (runs on CPU)

To check your GPU: open Task Manager (Ctrl+Shift+Esc) → "Performance" → "GPU". It shows your GPU name and dedicated memory.

---

## Step 2: Install Whisper (the speech-to-text engine)

Whisper converts your spoken words into text. It runs locally using whisper.cpp.

### Download the binary

1. Go to **https://github.com/ggerganov/whisper.cpp/releases**
2. Scroll down to the latest release
3. Under "Assets", download the file that matches your setup:
   - For NVIDIA GPU: look for `whisper-cublas-bin-x64.zip` or `whisper-cuda-bin-x64.zip`
   - For CPU only: look for `whisper-bin-x64.zip`
4. Extract the zip file somewhere temporary — you'll find `whisper-cli.exe` inside. **Keep this file**, you'll need it in Step 4.

### Download the speech model

1. Go to **https://huggingface.co/ggerganov/whisper.cpp/tree/main**
2. Download **`ggml-base.en.bin`** (about 142 MB — the English base model)
3. **Keep this file** too, you'll need it in Step 4.

---

## Step 3: Install Interview Help

### Option A: Using the installer (recommended)

If you have the `InterviewHelp-Setup-1.0.0.exe` installer file:

1. Double-click the installer
2. Choose where to install (the default is fine)
3. Click through to finish
4. You'll get a desktop shortcut and Start menu entry

### Option B: Using the portable version

If you have `InterviewHelp-Portable-1.0.0.exe`:

1. Put it anywhere you like (Desktop, Documents, wherever)
2. Double-click to run — no installation needed
3. It runs directly from that file

### Option C: Building from source (advanced)

If you have the source code and want to build the installer yourself, see the **"Building From Source"** section at the bottom of this guide.

---

## Step 4: Place the Whisper Files

The app needs to know where Whisper lives. You need to put the two files from Step 2 into the right place.

### If you used the installer (Option A)

Navigate to where Interview Help was installed. The default is:

```
C:\Users\YourName\AppData\Local\Programs\interview-help\
```

Inside that folder, find the `resources\whisper\` directory. If a `whisper` folder doesn't exist inside `resources`, create it. Then:

1. Put `whisper-cli.exe` directly inside `resources\whisper\`
2. Create a `models` folder inside `resources\whisper\`
3. Put `ggml-base.en.bin` inside `resources\whisper\models\`

It should look like this:

```
resources/
└── whisper/
    ├── whisper-cli.exe
    └── models/
        └── ggml-base.en.bin
```

### If you used the portable version (Option B)

The portable version looks for Whisper on your system PATH. The easiest approach:

1. Create a folder like `C:\whisper`
2. Put `whisper-cli.exe` in it
3. Create a `models` subfolder and put `ggml-base.en.bin` in it
4. Add `C:\whisper` to your system PATH:
   - Press Win+S, search for **"Environment Variables"**
   - Click **"Edit the system environment variables"**
   - Click **"Environment Variables..."**
   - Under "User variables", find **Path**, click **Edit**
   - Click **New**, type `C:\whisper`
   - Click OK on all dialogs

---

## Step 5: Verify Everything Before First Launch

### Check Ollama is running

Look for the llama icon in your system tray (bottom-right of taskbar). If it's not there, open the Start menu and search for "Ollama" to launch it.

You can also verify in a terminal:

```powershell
Invoke-RestMethod http://localhost:11434/api/tags
```

You should see a response listing your models.

### Check Whisper is accessible

Open a terminal and run:

```powershell
whisper-cli.exe --help
```

If it shows usage information, you're set. If you get "not recognized", the file isn't on your PATH — go back to Step 4.

---

## Step 6: Launch the App

- **If you installed it:** Double-click the "Interview Help" shortcut on your desktop, or find it in the Start menu
- **If portable:** Double-click the `.exe` file

### First launch — Setup Wizard

The first time you open the app, you'll see a setup wizard:

1. **Welcome screen** — click **"Get Started"**
2. **Voice Profile** — the app needs to learn your voice so it can tell you apart from an interviewer in recordings:
   - You'll see a sentence on screen
   - Click **Record**, read the sentence out loud in your normal voice, then click **Stop**
   - Do this three times (normal voice, slightly faster, slightly quieter)
   - Click **Save Profile** when done
3. **Ollama Check** — the app checks if Ollama is running and the model is available
   - Green checkmark = good, click **Continue**
   - Red X = Ollama isn't running — check Step 1, make sure the llama icon is in your system tray
   - You can click **Skip for now** if you want to set up Ollama later

After setup, you'll see the main three-panel interface. You're in.

---

## Using the App

### Practice Mode (default)

1. You start in **Practice Mode** — shown in the left panel toggle
2. Paste a **job description** into the text area — copy it from a real job listing
3. Click **"Generate Questions"** — the AI reads the JD and creates tailored interview questions across five categories (Technical, Behavioural, Situational, Motivation, Culture)
4. Click any question to select it
5. Click **"Start Recording"** — speak your answer out loud as if you're in a real interview
6. Click **"Stop"** when you're done
7. Wait for transcription (your words appear in the right panel) and then AI feedback
8. Review your **STAR analysis** (Situation, Task, Action, Result), strengths, and opportunities
9. Try again or move to the next question

### Real Interview Mode

1. Click **"Interview"** in the left panel toggle
2. Enter the **company name** and **role**
3. Upload an **MP4 recording** from OBS (or any audio/video file)
4. Wait for transcription and analysis (this takes a few minutes for longer recordings)
5. Review the full breakdown: strongest moments, areas to develop, energy/tone patterns
6. Click **"Practise"** on any flagged question to jump straight into Practice Mode with that question

### Reviewing Past Sessions

- All sessions appear in the **left panel**, grouped by date
- Click any session to review it
- Click **"Export PDF"** to save a printable copy

---

## Troubleshooting

### "Can't connect to Ollama"

Ollama isn't running. Check for the llama icon in your system tray. If it's not there:

1. Search for "Ollama" in the Start menu and open it
2. Or open a terminal and run: `ollama serve`

### "Mistral Small model not found"

The model hasn't been downloaded. Open a terminal and run:

```
ollama pull mistral-small:22b
```

### Questions take a long time to generate

The first request after starting Ollama is always slower — it needs to load the model into GPU memory. After that it's faster.

If it's consistently slow:

- Check Task Manager → Performance → GPU. If VRAM is maxed out, the model is too large
- Try a smaller model: `ollama pull mistral-small:latest`

### "Transcription failed" / Whisper doesn't work

1. Make sure `whisper-cli.exe` is where the app can find it (see Step 4)
2. Make sure `ggml-base.en.bin` is in the `models` folder
3. Test Whisper manually in a terminal:

```
whisper-cli.exe -m C:\path\to\models\ggml-base.en.bin -f C:\path\to\any\audio.wav
```

If you get a DLL error about CUDA:
- Install the [NVIDIA CUDA Toolkit](https://developer.nvidia.com/cuda-downloads)
- Or download the CPU-only version of whisper.cpp instead

### "Could not access microphone"

Windows may be blocking mic access:

1. Open **Settings** → **Privacy & Security** → **Microphone**
2. Make sure **"Let apps access your microphone"** is turned on
3. Scroll down and make sure the app isn't blocked

### The app opens but shows a blank white screen

This usually means the build didn't complete properly. If you built from source, try:

```
rmdir /s /q node_modules
rmdir /s /q out
npm install --legacy-peer-deps
npm run dist
```

---

## Where Your Data Lives

All your data is stored locally on your machine and never deleted automatically.

| What | Location |
|---|---|
| Database (sessions, feedback, scores) | `C:\Users\YourName\AppData\Roaming\interview-help\interview-help.db` |
| Audio recordings | `C:\Users\YourName\AppData\Roaming\interview-help\recordings\` |
| Voice profile | `C:\Users\YourName\AppData\Roaming\interview-help\voice-profiles\` |

To find this folder: press Win+R, type `%APPDATA%\interview-help`, press Enter.

**Uninstalling the app does not delete your data.** If you want to start completely fresh, delete that folder manually.

---

## Building From Source (Advanced)

If you have the source code and want to build the installer yourself — or want to run in development mode.

### Prerequisites

1. **Node.js 20+** — download from https://nodejs.org (click the LTS button)
2. **Git** — download from https://git-scm.com/download/win

Verify both are installed by opening a terminal:

```
node --version
npm --version
git --version
```

### Setup

```powershell
cd C:\Users\YourName\Documents
git clone <repository-url> interview-help
cd interview-help
npm install --legacy-peer-deps
```

If you see errors about "node-gyp" or "build tools", run this in an **Administrator** PowerShell first:

```
npm install -g windows-build-tools
```

Then retry `npm install --legacy-peer-deps`.

### Run in development mode

```
npm run dev
```

This launches the app with hot-reload — changes to the code update instantly.

### Build the Windows installer

```
npm run dist
```

This creates the installer in the `release/` folder. You'll find:

- `InterviewHelp-Setup-1.0.0.exe` — the installer (share this file)

### Build a portable version (no install needed)

```
npm run dist:portable
```

This creates a single `.exe` in `release/` that runs without installation.

### Place Whisper files for development mode

When running with `npm run dev`, put the Whisper files in the project's `whisper/` folder:

```
interview-help/
└── whisper/
    ├── whisper-cli.exe
    ├── models/
    │   └── ggml-base.en.bin
    └── transcribe.js        (already exists)
```

---

## Quick Reference

| What you want to do | How |
|---|---|
| Launch the app | Desktop shortcut, or Start menu → "Interview Help" |
| Start Ollama | Start menu → "Ollama", or terminal: `ollama serve` |
| Check Ollama is running | Look for llama icon in system tray |
| Download the AI model | Terminal: `ollama pull mistral-small:22b` |
| Check what models you have | Terminal: `ollama list` |
| Find your saved data | Win+R → `%APPDATA%\interview-help` |
| Export a session | Open the session → click "Export PDF" |
| Run from source (dev) | Terminal in project folder: `npm run dev` |
| Build the installer | Terminal in project folder: `npm run dist` |
