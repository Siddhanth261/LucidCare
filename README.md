LucidCare — AI Medical Report & Billing Assistant

Medical bills and reports are scary. LucidCare makes them simple.
It explains your report warmly, understands your emotions, finds billing errors, drafts your dispute letter, and even practices a realistic phone call with you—using natural, consistent AI voices.


Make healthcare simple, human, and stress-free.


Our AI system can:

1. Analyze your medical bill

2. Explain your medical report in simple human language

3. Read your facial expression and adjust tone based on your emotion

4. Detect coding mistakes (unbundling, upcoding, unnecessary tests, etc.)

5. Draft a dispute/appeal letter using real billing standards

6. Simulate a realistic phone call with a billing department using consistent AI voices

7. Coach you on how to dispute charges with confidence

LucidCare brings clarity to a system most people feel scared of.

🧠 Why We Built This

Most people don’t understand medical reports—they’re full of complex terms.
Most people also feel anxious and powerless when they see a surprise bill.

We wanted to fix that.

We built LucidCare to:

Make medical information easy to understand

Detect unfair or incorrect billing

Help patients confidently dispute charges

Provide emotional support using real-time sentiment detection

Make healthcare communication feel human again

Healthcare shouldn’t be a puzzle. LucidCare makes it clear.

🌟 Key Features
✔️ 1. Medical Report Explainer

Upload your report →
AI explains every section in simple language.

Uses Gemini for detailed summaries

Detects sentiment (sad, anxious, confused)

Changes tone and explanation style based on your emotion

Speaks aloud using dynamic voice styles

✔️ 2. Smart Bill Analyzer

The AI scans your medical bill and identifies:

Upcoding

Unbundling

Duplicates

Clerical errors

Medically unnecessary tests

High-impact financial errors

Outputs clean structured JSON with all findings.

✔️ 3. Automatic Appeal Letter Generator

With one click, LucidCare writes:

A professional dispute letter

With correct formatting

Using your provider info, account number, codes, and issues

In a firm but polite tone

You can edit or send it via email.

✔️ 4. AI Phone-Call Practice (Roleplay)

This is the star feature.
LucidCare generates a full back-and-forth phone call:

AI billing agent speaks in a consistent male voice

AI patient voice responds in a different consistent voice

No lag, fully automated

Helps you practice disputing your bill

Each side speaks realistically

This helps users gain confidence before calling their real provider.

✔️ 5. Stable TTS Voices (FishAudio)

We use FishAudio speech-1.5 with fixed voice IDs:

Billing Agent Voice → permanent

Patient Voice → permanent

Report Explainer → dynamic emotional voice

This ensures the call sounds realistic and polished.

🛠️ Tech Stack
Frontend

React

Tailwind CSS

WebSockets

Custom TTS playback queue

Facial expression / sentiment detection (client-side)

Backend

FastAPI

Gemini 2.5 Flash (Google Generative AI)

FishAudio TTS

pypdf for text extraction

JSON parsing + prompt engineering

Call-script generator

📁 Project Structure
src/
  components/
    BillingCallSimulator.jsx
    ComfortAssistant.jsx
  hooks/
    useTTS.js
  App.jsx
  main.jsx

backend/
  main.py

🔧 Local Setup
1. Install frontend
cd frontend
npm install
npm run dev

2. Install backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

3. Add environment variables

Create .env file:

GEMINI_API_KEY=your_key_here
FISH_AUDIO_API_KEY=your_key_here

📞 Demo Workflow

Upload medical bill → AI extracts info

View issues → select which ones to dispute

Generate appeal letter

Start phone call simulation

AI plays both voices in a realistic roleplay

You walk away confident and prepared

Running Our Project:
1. Clone the repo
2. cd into the `emotion-app` directory.
3. Having installed docker desktop in windows/mac or running on linux, run `docker compose up`.
