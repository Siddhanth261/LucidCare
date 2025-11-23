# **LucidCare — AI Medical Report & Billing Assistant**

*Make healthcare simple, human, and stress-free.*

---

## 🚀 **Overview**

> Medical bills and reports are scary. LucidCare makes them simple.
> It explains your report warmly, understands your emotions, finds billing errors, drafts your dispute letter, and even practices a realistic phone call with you—using natural, consistent AI voices.

Our AI system can:

* **Analyze your medical bill**
* **Explain your medical report** in simple human language
* **Read your facial expression** and adjust tone based on your emotion
* **Detect coding mistakes** (unbundling, upcoding, unnecessary tests, etc.)
* **Draft a dispute/appeal letter** using real billing standards
* **Simulate a realistic phone call** with a billing department using **consistent AI voices**
* **Coach you** on how to dispute charges with confidence

LucidCare brings clarity to a system most people feel scared of.

---

## 🧠 **Why We Built This**

Most people don’t understand medical reports—they’re full of complex terms.
Most people also feel **anxious and powerless** when they see a surprise bill.

We wanted to fix that.

We built LucidCare to:

* Make medical information easy to understand
* Detect unfair or incorrect billing
* Help patients confidently dispute charges
* Provide emotional support using real-time sentiment detection
* Make healthcare communication feel human again

Healthcare shouldn’t be a puzzle. LucidCare makes it clear.

---

## **Key Features**

### ✔️ **1. Medical Report Explainer**

Upload your report →
AI explains every section in simple language.

* Uses **Gemini** for detailed summaries
* Detects sentiment (sad, anxious, confused)
* Changes tone and explanation style based on your emotion
* Speaks aloud using dynamic voice styles

---

### ✔️ **2. Smart Bill Analyzer**

The AI scans your medical bill and identifies:

* Upcoding
* Unbundling
* Duplicates
* Clerical errors
* Medically unnecessary tests
* High-impact financial errors

Outputs clean structured JSON with all findings.

---

### ✔️ **3. Automatic Appeal Letter Generator**

With one click, LucidCare writes:

* A professional dispute letter
* With correct formatting
* Using your provider info, account number, codes, and issues
* In a firm but polite tone

You can edit or send it via email.

---

### ✔️ **4. AI Phone-Call Practice (Roleplay)**

This is the star feature.
LucidCare generates a full back-and-forth phone call:

* AI billing agent speaks in a **consistent male voice**
* AI patient voice responds in a different consistent voice
* No lag, fully automated
* Helps you practice disputing your bill
* Each side speaks realistically

This helps users gain confidence before calling their real provider.

---

### ✔️ **5. Stable TTS Voices (FishAudio)**

We use **FishAudio speech-1.5** with **fixed voice IDs**:

* Billing Agent Voice → permanent
* Patient Voice → permanent
* Report Explainer → dynamic emotional voice

This ensures the call sounds realistic and polished.

---

## 🛠️ **Tech Stack**

### **Frontend**

* React
* Tailwind CSS
* WebSockets
* Custom TTS playback queue
* Facial expression / sentiment detection (client-side)

### **Backend**

* FastAPI
* Gemini 2.5 Flash (Google Generative AI)
* FishAudio TTS
* pypdf for text extraction
* JSON parsing + prompt engineering
* Call-script generator

---

## 📁 **Project Structure**

```
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
```

---

## 🔧 **Local Setup**

### **1. Install frontend**

```bash
cd frontend
npm install
npm run dev
```

### **2. Install backend**

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### **3. Add environment variables**

Create `.env` file:

```
GEMINI_API_KEY=your_key_here
FISH_AUDIO_API_KEY=your_key_here
```

---

## 📞 **Demo Workflow**

1. Upload medical bill → AI extracts info
2. View issues → select which ones to dispute
3. Generate appeal letter
4. Start phone call simulation
5. AI plays both voices in a realistic roleplay
6. You walk away confident and prepared


Running Our Project:
1. Clone the repo
2. cd into the `emotion-app` directory.
3. Having installed docker desktop in windows/mac or running on linux, run `docker compose up`.
