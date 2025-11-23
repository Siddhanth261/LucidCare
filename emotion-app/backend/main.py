import os
import io
import json
import re

import pypdf
import google.generativeai as genai
from fastapi import FastAPI, UploadFile, File, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import httpx

load_dotenv()

GOOGLE_API_KEY = os.environ.get("GEMINI_API_KEY")
FISH_AUDIO_KEY = os.environ.get("FISH_AUDIO_API_KEY")

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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


session_state = {}


def strip_patient_identifiers(text: str) -> str:
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


def parse_sections(summary_text: str):
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


# ---------------------------------------------------
# FISHAUDIO TTS (multi-voice)
# ---------------------------------------------------
class TTSRequest(BaseModel):
  text: str
  mode: str = "COMFORT"


VOICE_PRESETS = {
  # ComfortAssistant - consistent therapeutic voice
  "COMFORT": {"voice_id": "d1f6f1777c824ba59b1df3064fc3393e", "speed": 1.0},  # user/comfort assistant
  "BILLING_REP": {"voice_id": "b545c585f631496c914815291da4e893", "speed": 1.0},  # rep
}


@app.post("/tts")
async def tts_endpoint(body: TTSRequest):
  """
  Convert text to speech using FishAudio's speech-1.5 model.
  This endpoint returns an MP3 audio stream.
  """

  if not FISH_AUDIO_KEY:
      return {"error": "Missing FISH_AUDIO_API_KEY in environment"}

  preset = VOICE_PRESETS.get(body.mode, VOICE_PRESETS["COMFORT"])
  speed = preset["speed"]
  voice_id = preset["voice_id"]

  headers = {
      "Authorization": f"Bearer {FISH_AUDIO_KEY}",
      "Content-Type": "application/json"
  }

  # NOTE: If FishAudio uses a different field name than "voice_id"
  # (e.g. "voice" or "speaker"), change it here according to their docs.
  payload = {
      "text": body.text,
      "model": "speech-1.5",
      "format": "mp3",
      "reference_id": voice_id,
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


# ---------------------------------------------------
# BILL ANALYZER (Gemini)
# ---------------------------------------------------
@app.post("/analyze-bill")
async def analyze_bill(file: UploadFile = File(...)):
  """
  Upload a US medical bill (PDF).
  We extract text and ask Gemini to:
  - identify CPT / ICD-10 / HCPCS / Revenue codes
  - detect duplicate charges
  - check for upcoding or unbundling
  - find clerical mistakes or coverage errors
  - extract contact details
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

      text = text[:15000]

      prompt = f"""
You are a US medical billing expert.
Analyze the bill text below.

Your job:
- Identify CPT, ICD-10, HCPCS, revenue codes.
- Extract contact information for both patient and provider
- Detect any:
  - duplicate charges
  - unbundling
  - upcoding
  - clerical mistakes
  - medically unnecessary charges
- Return ONLY JSON in this exact format:

{{
  "high_level_summary": "string",
  "patient_info": {{
    "name": "extracted patient name or null",
    "address": "extracted patient address or null", 
    "city_state_zip": "extracted patient city, state, zip or null",
    "phone": "extracted patient phone or null",
    "email": "extracted patient email or null",
    "account_number": "extracted account/patient ID or null",
    "dob": "extracted date of birth or null"
  }},
  "provider_info": {{
    "name": "extracted provider/facility name or null",
    "billing_dept": "billing department name or 'Billing Department'",
    "address": "extracted provider address or null",
    "city_state_zip": "extracted provider city, state, zip or null",
    "phone": "extracted provider phone or null"
  }},
  "bill_info": {{
    "bill_date": "extracted bill/service date or null",
    "due_date": "extracted due date or null",
    "total_amount": "extracted total amount or null"
  }},
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
      except Exception:
          match = re.search(r"{[\s\S]*}", raw)
          if match:
              parsed = json.loads(match.group(0))
              return {"structured": True, "analysis": parsed}

      return {"structured": False, "raw": raw}

  except Exception as e:
      return {"error": str(e)}


# ---------------------------------------------------
# APPEAL LETTER GENERATOR
# ---------------------------------------------------
class AppealRequest(BaseModel):
  patient_info: dict | None = None
  provider_info: dict | None = None
  bill_info: dict | None = None
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
Write a formal, professional medical bill dispute letter with proper business letter formatting.

Use the following information to create a complete, professional dispute letter:

PATIENT INFORMATION (use this for the letter header and signature):
{json.dumps(body.patient_info, indent=2) if body.patient_info else "No patient info extracted - use placeholders"}

PROVIDER INFORMATION (use this for the recipient address):
{json.dumps(body.provider_info, indent=2) if body.provider_info else "No provider info extracted - use placeholders"}

BILL INFORMATION (reference these details in the letter):
{json.dumps(body.bill_info, indent=2) if body.bill_info else "No bill info extracted - use placeholders"}

BILLING ISSUES TO DISPUTE:
{json.dumps(body.analysis, indent=2)}

ADDITIONAL CONTEXT:
{body.issues_summary}

INSTRUCTIONS:
1. Create a proper business letter format with:
   - Patient's name and address at top (from patient_info)
   - Current date
   - Provider's name and billing department address (from provider_info)
   - Professional subject line with account number
   
2. Write 4-6 professional paragraphs that:
   - Clearly identify the billing errors from the analysis
   - Reference specific medical codes and charges
   - Request itemized review and correction
   - Use a {body.tone} tone
   - Request written response within 30 days
   
3. End with professional closing and patient signature

4. If any contact information is missing, use appropriate placeholders like [Your Name], [Provider Name], etc.

Generate the complete letter ready to send.
"""

  try:
      response = model.generate_content(prompt)
      return {"letter": response.text}
  except Exception as e:
      return {"error": str(e)}


# ---------------------------------------------------
# BILLING CALL SIMULATOR – GEMINI SCRIPT
# ---------------------------------------------------
class BillingIssue(BaseModel):
  line_snippet: str | None = None
  codes: list[str] | None = None
  issue_type: str | None = None
  patient_impact: str | None = None
  can_patient_dispute: bool | None = None
  dispute_rationale: str | None = None


class BillingCallRequest(BaseModel):
  patient_info: dict | None = None
  provider_info: dict | None = None
  bill_info: dict | None = None
  issues: list[BillingIssue] = []
  max_turns: int = 10


@app.post("/simulate-billing-call")
async def simulate_billing_call(body: BillingCallRequest):
  """
  Generate a *full scripted call* between:
  - 'rep'  (billing representative)
  - 'user' (patient)

  Returns JSON:
  {
    "turns": [
      { "speaker": "rep", "text": "..." },
      { "speaker": "user", "text": "..." },
      ...
    ]
  }
  """

  if not GOOGLE_API_KEY:
      return {"error": "Gemini key missing"}

  prompt = f"""
You are roleplaying a phone call between a US hospital billing department and a patient who is disputing potential billing errors.

You MUST output ONLY valid JSON with this exact shape:

{{
  "turns": [
    {{"speaker": "rep", "text": "string"}},
    {{"speaker": "user", "text": "string"}}
  ]
}}

Rules:
- "speaker" is always EXACTLY "rep" or "user".
- Start with a friendly greeting from the billing "rep".
- Alternate between "rep" and "user" as much as possible.
- Keep responses short and natural, like real phone dialogue (1–2 sentences per turn).
- Total turns: between 8 and {body.max_turns} turns.
- Be realistic but concise.
- Patient is disputing specific line items and codes.

PATIENT INFO (for context only, do NOT say DOB or sensitive data out loud):
{json.dumps(body.patient_info, indent=2) if body.patient_info else "None"}

PROVIDER INFO (use only the provider/facility name in dialogue):
{json.dumps(body.provider_info, indent=2) if body.provider_info else "None"}

BILL INFO (for context):
{json.dumps(body.bill_info, indent=2) if body.bill_info else "None"}

KEY ISSUES THE PATIENT IS DISPUTING:
{json.dumps([issue.dict() for issue in body.issues], indent=2)}

The patient is polite but firm and wants:
- clarification on why certain codes/charges appear (upcoding, unbundling, unnecessary tests, etc.)
- the bill to be reviewed and adjusted if incorrect
- to mention that they have a written appeal letter as backup

Remember: OUTPUT ONLY JSON.
"""

  try:
      response = model.generate_content(prompt)
      raw = response.text

      try:
          data = json.loads(raw)
      except Exception:
          m = re.search(r"{[\s\S]*}", raw)
          if not m:
              return {"error": "Could not parse JSON from model", "raw": raw}
          data = json.loads(m.group(0))

      turns = data.get("turns", [])
      # Light clean-up: ensure only rep/user
      clean_turns = []
      for t in turns:
          speaker = t.get("speaker", "").strip().lower()
          if speaker not in ["rep", "user"]:
              continue
          text = str(t.get("text", "")).strip()
          if not text:
              continue
          clean_turns.append({"speaker": speaker, "text": text})

      if not clean_turns:
          return {"error": "No valid turns in script", "raw": data}

      return {"turns": clean_turns}

  except Exception as e:
      return {"error": str(e)}
