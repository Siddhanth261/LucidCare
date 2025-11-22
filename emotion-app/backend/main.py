import os
import io
import pypdf
import google.generativeai as genai
from fastapi import FastAPI, UploadFile, File, WebSocket
from fastapi.middleware.cors import CORSMiddleware

# 1. Setup Gemini
# We get the key from the Docker Environment variable
GOOGLE_API_KEY = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

# Use Gemini 2.5 Flash (Fastest & Cheapest, perfect for this)
model = genai.GenerativeModel('gemini-2.5-flash')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. New Health Check (Instant)
@app.get("/health")
async def health_check():
    if not GOOGLE_API_KEY:
        return {"status": "error", "message": "API Key missing"}
    return {"status": "ready"}

@app.get("/list-models")
async def list_models():
    """Debug endpoint to see available Gemini models"""
    try:
        models = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                models.append({
                    "name": m.name,
                    "display_name": m.display_name,
                    "supported_methods": m.supported_generation_methods
                })
        return {"models": models}
    except Exception as e:
        return {"error": str(e)}

@app.post("/analyze-report")
async def analyze_report(file: UploadFile = File(...)):
    print(f"Receiving file: {file.filename}")
    
    try:
        # Read and Extract PDF
        file_bytes = await file.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        extracted_text = ""
        
        for page in pdf_reader.pages:
            text = page.extract_text()
            if text:
                extracted_text += text + "\n"
        
        print(f"Extracted {len(extracted_text)} characters.")

        # Prompt for Gemini
        prompt = (
            f"You are an expert medical assistant. Below is the raw text from a medical report. "
            f"Please provide a comprehensive and detailed report explanation. "
            f"The explanation should be in simple language yet highly detailed. Each test result and metric should be explained clearly.\n\n"
            f"If there is an anomaly/abnormality, explain it in more depth. "
            f"Do not include conversational filler (like 'Hello', 'Here is your report'). "
            f"Just construct a structured, simple-language explanation of the findings.\n"
            f"REPORT TEXT:\n{extracted_text}"
        )

        # Call Gemini API
        response = model.generate_content(prompt)
        
        return {"summary": response.text}

    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}

@app.websocket("/comfort-stream")
async def comfort_stream(websocket: WebSocket):
    await websocket.accept()
    
    try:
        while True:
            data = await websocket.receive_json()
            emotion = data.get("emotion")
            summary = data.get("summary")
            
            if not emotion or not summary:
                continue

            # Emotion-specific prompt engineering
            emotion_prompts = {
                "sad": (
                    f"Medical Context: '{summary[:4000]}' "
                    f"The patient is feeling SAD right now. As a compassionate caregiver, provide 2-3 sentences of comfort. "
                    f"FIND and HIGHLIGHT specific positive findings or silver linings from the medical summary above. "
                    f"Acknowledge their sadness, then gently point out the encouraging aspects (normal ranges, good indicators, stable conditions). "
                    f"Be warm, specific, and reassuring. Use actual numbers/facts from the report."
                ),
                "fearful": (
                    f"Medical Context: '{summary[:4000]}' "
                    f"The patient is feeling FEARFUL/ANXIOUS. As a calming presence, provide 2-3 sentences. "
                    f"IDENTIFY and EMPHASIZE stable, normal, or reassuring findings from the summary. "
                    f"Acknowledge their fear is valid, then calmly explain what the positive indicators mean. "
                    f"Use specific data points to provide concrete reassurance."
                ),
                "neutral": (
                    f"Medical Context: '{summary[:4000]}' "
                    f"The patient appears CALM/NEUTRAL. In 2-3 sentences, provide clear, factual information. "
                    f"EXTRACT and PRESENT the most important findings from the summary in an educational tone. "
                    f"Focus on key metrics, what they indicate, and their significance. Be professional and informative."
                ),
                "angry": (
                    f"Medical Context: '{summary[:4000]}' "
                    f"The patient seems FRUSTRATED/ANGRY. In 2-3 sentences, validate their feelings while providing clarity. "
                    f"FIND specific information from the summary that might address common frustrations. "
                    f"Acknowledge the difficulty, then explain concrete facts that provide context or perspective. Be empathetic but direct."
                ),
                "surprised": (
                    f"Medical Context: '{summary[:4000]}' "
                    f"The patient looks SURPRISED. In 2-3 sentences, help them process the information. "
                    f"HIGHLIGHT key findings from the summary and explain what they mean in simple terms. "
                    f"Acknowledge unexpected results while providing balanced context about what the numbers indicate."
                ),
                "happy": (
                    f"Medical Context: '{summary[:4000]}' "
                    f"The patient seems HAPPY/RELIEVED! In 2-3 sentences, reinforce the positive. "
                    f"CELEBRATE specific good findings from the summary. "
                    f"Share their optimism while highlighting the encouraging metrics and what they signify for their health."
                ),
                "disgusted": (
                    f"Medical Context: '{summary[:4000]}' "
                    f"The patient appears UNCOMFORTABLE/DISGUSTED. In 2-3 sentences, provide gentle reassurance. "
                    f"FOCUS on normalizing aspects from the summary and providing context. "
                    f"Acknowledge discomfort, then explain relevant findings in a matter-of-fact, professional way."
                )
            }
            
            # Get emotion-specific prompt or default to neutral
            prompt = emotion_prompts.get(emotion.lower(), emotion_prompts["neutral"])

            # Stream response from Gemini
            response = model.generate_content(prompt, stream=True)
            
            for chunk in response:
                if chunk.text:
                    await websocket.send_text(chunk.text)
            
            await websocket.send_text(" [END]")
            
    except Exception as e:
        print(f"WebSocket Error: {e}")