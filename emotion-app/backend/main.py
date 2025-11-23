import os
import io
import pypdf
import google.generativeai as genai
from fastapi import FastAPI, UploadFile, File, WebSocket
from fastapi.middleware.cors import CORSMiddleware

# NEW IMPORTS FOR TTS
import httpx
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import json

# Load ENV
load_dotenv()

# API KEYS
GOOGLE_API_KEY = os.environ.get("GEMINI_API_KEY")
FISH_AUDIO_KEY = os.environ.get("FISH_AUDIO_API_KEY")

# Configure Gemini
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# HEALTH CHECK
@app.get("/health")
async def health_check():
    if not GOOGLE_API_KEY:
        return {"status": "error", "message": "API Key missing"}

    try:
        model.generate_content(
            "Say 'Hello'",
            generation_config=genai.GenerationConfig(max_output_tokens=10),
        )
        return {"status": "ready", "api": "connected"}
    except Exception as e:
        return {"status": "error", "message": f"API error: {str(e)}"}


@app.get("/list-models")
async def list_models():
    try:
        models = []
        for m in genai.list_models():
            if "generateContent" in m.supported_generation_methods:
                models.append(
                    {
                        "name": m.name,
                        "display_name": m.display_name,
                        "supported_methods": m.supported_generation_methods,
                    }
                )
        return {"models": models}
    except Exception as e:
        return {"error": str(e)}


# PDF ANALYSIS
@app.post("/analyze-report")
async def analyze_report(file: UploadFile = File(...)):
    print(f"Receiving file: {file.filename}")

    try:
        file_bytes = await file.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        extracted_text = ""

        for page in pdf_reader.pages:
            text = page.extract_text()
            if text:
                extracted_text += text + "\n"

        print(f"Extracted {len(extracted_text)} characters.")

        prompt = (
            f"You are an expert medical assistant. Below is the raw text from a medical report. "
            f"Provide a comprehensive explanation in simple language.\n\n"
            f"CRITICAL FORMAT:\n"
            f"###SECTION### for EACH test result.\n"
            f"One test per section.\n"
            f"Format:\n"
            f"Test Name: Description\n"
            f"Patient's Result: X\n"
            f"Reference Range: Y\n"
            f"Explanation: ...\n\n"
            f"REPORT TEXT:\n{extracted_text}"
        )

        response = model.generate_content(prompt)
        return {"summary": response.text}

    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}


# SESSION STATE
session_state = {}


def strip_patient_identifiers(text):
    import re

    text = re.sub(
        r"\b(Mr\.|Mrs\.|Ms\.|Dr\.)\s+[A-Z][a-z]+(?:\s+[A-Z]\.)?(?:\s+[A-Z][a-z]+)+",
        "the patient",
        text,
        flags=re.IGNORECASE,
    )
    text = re.sub(r"\b[A-Z][a-z]+\s+[A-Z]\.\s+[A-Z][a-z]+", "the patient", text)
    text = re.sub(r"\b[A-Z][a-z]+'s\b", "your", text)
    return text


def parse_sections(summary_text):
    print(f"=== PARSING SUMMARY (length: {len(summary_text)}) ===")

    if "###SECTION###" in summary_text:
        raw_sections = summary_text.split("###SECTION###")
        sections = []

        for idx, raw in enumerate(raw_sections):
            content = raw.strip()
            if not content:
                continue

            lines = content.split("\n")
            title = "Medical Finding"

            if lines:
                first_line = lines[0].strip()
                if ":" in first_line:
                    title = first_line.split(":")[0]
                elif len(first_line) < 100:
                    title = first_line

            sections.append({"title": title, "content": content})

        print(f"Parsed {len(sections)} sections")
        return sections

    # FALLBACK
    lines = summary_text.split("\n")
    sections = []
    current = {"title": "Introduction", "content": ""}

    for line in lines:
        line = line.strip()
        if not line:
            continue

        is_header = (
            (len(line) < 100)
            and (
                line.endswith(":")
                or line.isupper()
                or any(
                    key in line.lower()
                    for key in ["panel", "test", "function", "results", "summary"]
                )
            )
            and not line.startswith("•")
            and not line.startswith("-")
        )

        if is_header and current["content"]:
            sections.append(current)
            current = {"title": line.rstrip(":"), "content": ""}
        else:
            current["content"] += line + "\n"

    if current["content"]:
        sections.append(current)

    print(f"Fallback parser created {len(sections)} sections")
    return sections


# COMFORT STREAM
@app.websocket("/comfort-stream")
async def comfort_stream(websocket: WebSocket):
    await websocket.accept()
    connection_id = id(websocket)

    if not GOOGLE_API_KEY:
        await websocket.send_json({"error": "Missing GEMINI_API_KEY"})
        await websocket.close()
        return

    session_state[connection_id] = {
        "current_section": 0,
        "sections": [],
        "introduced": False,
    }

    print(f"WebSocket {connection_id} connected")

    try:
        while True:
            data = await websocket.receive_json()
            emotion = data.get("emotion", "neutral")
            summary = data.get("summary", "")
            action = data.get("action", "next")

            session = session_state[connection_id]

            if action == "init" and summary and not session["sections"]:
                session["sections"] = parse_sections(summary)
                session["current_section"] = 0
                session["introduced"] = False

            if not session["sections"]:
                await websocket.send_json({"error": "No report loaded"})
                continue

            # INTRODUCTION
            if not session["introduced"]:
                intro_prompt = (
                    "You are a compassionate AI named LucidCare Assistant. "
                    "Gently introduce yourself in 2–3 sentences and explain "
                    "that you will help the patient understand their report."
                )

                try:
                    response = model.generate_content(intro_prompt)
                    await websocket.send_json(
                        {"type": "message", "text": response.text}
                    )

                    session["introduced"] = True
                    await websocket.send_json(
                        {"type": "end", "section": "introduction"}
                    )
                except Exception as e:
                    await websocket.send_json(
                        {"error": f"Introduction error: {str(e)}"}
                    )
                continue

            # COMPLETION
            if session["current_section"] >= len(session["sections"]):
                conclusion_prompt = (
                    "You have finished explaining all sections. Provide a warm, caring, "
                    "2–3 sentence closing message encouraging the patient."
                )

                try:
                    response = model.generate_content(conclusion_prompt)
                    await websocket.send_json(
                        {"type": "message", "text": response.text}
                    )
                    await websocket.send_json({"type": "complete"})
                except Exception as e:
                    await websocket.send_json(
                        {"error": f"Conclusion error: {str(e)}"}
                    )
                continue

            # SECTION PROCESSING
            section = session["sections"][session["current_section"]]
            clean_content = strip_patient_identifiers(
                section["content"][:3000]
            )

            emotion_context = {
                "sad": "I can see you might be feeling a bit sad.",
                "fearful": "I sense this might be making you anxious.",
                "angry": "I understand you might be feeling frustrated.",
                "surprised": "I see this caught you off guard.",
                "happy": "I'm glad to see you're feeling positive!",
                "neutral": "",
                "disgusted": "I know this information can feel uncomfortable.",
            }

            emotion_prefix = emotion_context.get(emotion.lower(), "")
            section_prompt = (
                f"You are a caring nurse explaining ONE specific test result.\n"
                f"Patient emotion: {emotion}. {emotion_prefix}\n\n"
                f"=== TEST ===\n{section['title']}\n"
                f"=== DATA ===\n{clean_content}\n\n"
                f"=== RULES ===\n"
                f"- NEVER use patient names\n"
                f"- Use only 'you', 'your', 'I', 'we'\n"
                f"- Exactly 3–5 sentences\n"
                f"- Include specific result values\n"
                f"- Compare to reference range\n"
                f"- Stay warm, supportive, and human\n"
            )

            try:
                response = model.generate_content(section_prompt, stream=False)
                full_response = response.text

                await websocket.send_json({
                    "type": "message",
                    "text": full_response
                })

                session["current_section"] += 1

                await websocket.send_json({
                    "type": "end",
                    "section": section["title"],
                    "progress": f"{session['current_section']}/{len(session['sections'])}"
                })

            except Exception as e:
                await websocket.send_json({
                    "error": f"Section error: {str(e)}"
                })
                session["current_section"] += 1

    except Exception as e:
        import traceback
        print(f"WebSocket Error: {e}")
        print(traceback.format_exc())

    finally:
        if connection_id in session_state:
            del session_state[connection_id]


###########################################################
# 6️⃣ NEW — FISHAUDIO TTS ENDPOINT (speech-1.5)
###########################################################

class TTSRequest(BaseModel):
    text: str
    mode: str = "THERAPIST"   # LAWYER (fast) / THERAPIST (slow)


@app.post("/tts")
async def tts_endpoint(body: TTSRequest):
    """
    Convert text to speech using FishAudio's speech-1.5 model.
    This endpoint returns an MP3 audio stream.
    """

    if not FISH_AUDIO_KEY:
        return {"error": "Missing FISH_AUDIO_API_KEY in environment"}

    # Emotion → speaking style
    speed = 1.1 if body.mode == "LAWYER" else 0.85

    headers = {
        "Authorization": f"Bearer {FISH_AUDIO_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "text": body.text,
        "model": "speech-1.5",
        "format": "mp3",
        "prosody": {
            "speed": speed,
            "volume": 0
        }
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.fish.audio/v1/tts",
                headers=headers,
                json=payload
            )

        if response.status_code != 200:
            print(f"TTS Error: {response.status_code} - {response.text}")
            return {
                "error": "FishAudio TTS failed",
                "status": response.status_code,
                "detail": response.text
            }

        audio_bytes = response.content
        
        if len(audio_bytes) == 0:
            print("TTS returned empty audio")
            return {"error": "Empty audio response"}

        print(f"TTS Success: {len(audio_bytes)} bytes")
        
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers={
                "Content-Length": str(len(audio_bytes)),
                "Accept-Ranges": "bytes"
            }
        )
    except Exception as e:
        print(f"TTS Exception: {str(e)}")
        return {"error": f"TTS failed: {str(e)}"}

import json

@app.post("/analyze-bill")
async def analyze_bill(file: UploadFile = File(...)):
    """
    Upload a US medical bill (PDF).
    We extract text and ask Gemini to:
    - identify CPT / ICD-10 / HCPCS / Revenue codes
    - detect duplicate charges
    - check for upcoding or unbundling
    - find clerical mistakes or coverage errors
    - generate structured JSON
    """

    if not GOOGLE_API_KEY:
        return {"error": "GEMINI_API_KEY missing"}

    if not file.filename.lower().endswith(".pdf"):
        return {"error": "Only PDF files allowed"}

    try:
        pdf_bytes = await file.read()
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        text = ""

        for p in reader.pages:
            part = p.extract_text()
            if part:
                text += part + "\n"

        text = text[:15000]  # safety limit

        prompt = f"""
You are a US medical billing expert.
Analyze the bill text below.

Your job:
- Identify CPT, ICD-10, HCPCS, revenue codes.
- Detect any:
  - duplicate charges
  - unbundling
  - upcoding
  - clerical mistakes
  - medically unnecessary charges
- Return ONLY JSON in this exact format:

{{
  "high_level_summary": "string",
  "potential_issues": [
    {{
      "line_snippet": "string from bill",
      "codes": ["CPT/ICD/HCPCS"],
      "issue_type": "duplicate | upcoding | unbundling | clerical | unnecessary | other",
      "patient_impact": "why this matters financially",
      "can_patient_dispute": true,
      "dispute_rationale": "why disputable"
    }}
  ]
}}

Bill text:
{text}
"""

        response = model.generate_content(prompt)
        raw = response.text

        # Try to parse JSON safely
        try:
            parsed = json.loads(raw)
            return {"structured": True, "analysis": parsed}
        except:
            import re
            match = re.search(r"{[\s\S]*}", raw)
            if match:
                parsed = json.loads(match.group(0))
                return {"structured": True, "analysis": parsed}

        return {"structured": False, "raw": raw}

    except Exception as e:
        return {"error": str(e)}
    
    ###############################################
# 8️⃣ APPEAL LETTER GENERATOR
###############################################

from pydantic import BaseModel

class AppealRequest(BaseModel):
    patient_name: str | None = None
    provider_name: str | None = None
    bill_date: str | None = None
    account_number: str | None = None
    analysis: dict | None = None
    issues_summary: str | None = None
    tone: str = "firm-but-polite"

@app.post("/draft-appeal-letter")
async def draft_appeal_letter(body: AppealRequest):
    """
    Generates a professional medical bill dispute letter.
    Uses the structured output from /analyze-bill.
    """

    if not GOOGLE_API_KEY:
        return {"error": "Gemini key missing"}

    prompt = f"""
Write a formal, firm-but-polite dispute letter for incorrect medical billing.

Patient: {body.patient_name}
Provider: {body.provider_name}
Bill date: {body.bill_date}
Account number: {body.account_number}

Here is the analysis of the billing issues to reference:
{json.dumps(body.analysis, indent=2)}

Extra notes from the patient:
{body.issues_summary}

Tone: {body.tone}

Write 4–6 paragraphs.  
Be factual, respectful, and not emotional.  
"""

    try:
        response = model.generate_content(prompt)
        return {"letter": response.text}
    except Exception as e:
        return {"error": str(e)}