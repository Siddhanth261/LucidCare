# **LucidCare — AI Medical Report & Billing Assistant**

*Make healthcare simple, human, and stress-free.*

---

## 🚀 **Overview**

> Medical bills and reports are scary. **LucidCare makes them simple.**
> It explains your report warmly, understands your emotions anc changes its behavior based on that, finds billing errors, drafts your dispute letter, and even practices a realistic phone call with you—using natural, consistent AI voices.

LucidCare can:

* **Analyze your medical bill** for errors
* **Explain your medical report** in clear human language
* **Read your facial expression** and adjust tone based on emotion
* **Detect coding mistakes** (upcoding, unbundling, duplicates, etc.)
* **Draft a professional dispute letter**
* **Simulate a realistic phone call** with a billing department
* **Coach you** on what to say so you feel confident and prepared

LucidCare brings clarity to a system most people are afraid of.

---

## 🧠 **Why We Built This**

Most people don’t understand medical reports—they’re full of complex terminology.
Most people also feel **anxious, confused, or powerless** when they receive a medical bill.

We built LucidCare to:

* Make medical information **easy to understand**
* Detect unfair or incorrect charges
* Help patients dispute bills confidently
* Offer emotional support using **real-time sentiment detection**
* Make healthcare communication feel **human and compassionate**

Healthcare shouldn’t feel like a puzzle. LucidCare makes it clear.

---

## ✨ **Key Features**

### ✔️ **1. Medical Report Explainer**

Upload your report →
LucidCare breaks down every section using simple, friendly language.

Features:

* Uses **Gemini** for high-quality summarization
* Detects user emotion (sad, anxious, confused)
* Adjusts tone dynamically
* Supports natural voice-based explanations

---

### ✔️ **2. Smart Bill Analyzer**

LucidCare scans your medical bill and identifies:

* Upcoding
* Unbundling
* Duplicate charges
* Clerical mistakes
* Medically unnecessary services
* High-impact financial errors

Outputs clean, structured JSON with everything the user needs to know.

---

### ✔️ **3. Automatic Appeal Letter Generator**

With a single click, LucidCare generates:

* A professional dispute/appeal letter
* Correct provider + account info
* Detected billing problems
* A firm but respectful tone

Users can edit or send it directly.

---

### ✔️ **4. AI Phone-Call Practice (Roleplay Simulator)**

One of LucidCare’s most powerful features.

* A consistent, natural **billing agent voice**
* A separate consistent **patient voice**
* Fully automated conversation
* Users practice disputing charges in a no-stress environment
* Realistic call flow, back-and-forth dialogue

This turns a dreaded phone call into an empowering learning experience.

---

### ✔️ **5. Stable Voice Experience (FishAudio)**

Powered by **FishAudio speech-1.5** with **fixed voice IDs**:

* Billing Agent Voice → stable
* Patient Voice → stable
* Report Explainer → emotional adaptive voice

Every interaction feels polished and consistent.

---

## 🛠️ **Tech Stack**

### **Frontend**

* React
* Tailwind CSS
* WebSockets
* Custom TTS playback engine
* Client-side facial expression & sentiment detection

### **Backend**

* FastAPI
* Gemini 2.5 Flash (Google Generative AI)
* FishAudio TTS
* `pypdf` for text extraction
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

## 🔧 **Running Our Project**

LucidCare runs fully in Docker—no manual setup required.

### **1. Clone the repository**

```bash
git clone https://github.com/Siddhanth261/LucidCare.git
```

### **2. Navigate into the project**

```bash
cd emotion-app
```

### **3. Make sure Docker Desktop (Windows/Mac) or Docker Engine (Linux) is running**

### **4. Start the whole system**

```bash
docker compose up
```

Docker automatically launches both the frontend and backend.

---

## 📞 **Demo Workflow**

1. Upload your medical bill
2. AI extracts and identifies issues
3. Select which findings you want to dispute
4. Generate a professional appeal letter
5. Practice the phone call with the AI billing agent
