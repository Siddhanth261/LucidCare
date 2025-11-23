import os
import io
import pypdf
import google.generativeai as genai
from fastapi import FastAPI, UploadFile, File, WebSocket, WebSocketDisconnect
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
    
    # Store session data
    session_data = {
        "summary": None,
        "emotion": None,
        "section_count": 0
    }
    
    # Define report sections to explain progressively
    sections = [
        "Overview and Key Findings",
        "Lab Results and Metrics",
        "Clinical Implications",
        "Next Steps and Recommendations"
    ]
    
    try:
        while True:
            data = await websocket.receive_json()
            action = data.get("action")
            
            print(f"Received WebSocket message - action: {action}")
            
            if action == "init":
                # Initialize session
                session_data["summary"] = data.get("summary")
                session_data["emotion"] = data.get("emotion", "neutral")
                session_data["section_count"] = 0
                
                print(f"WebSocket initialized with emotion: {session_data['emotion']}, summary length: {len(session_data['summary']) if session_data['summary'] else 0}")
                
                # Send first section automatically
                await send_comfort_section(websocket, session_data, sections)
                
            elif action == "next":
                # Update emotion if provided
                if "emotion" in data:
                    session_data["emotion"] = data.get("emotion", "neutral")
                
                print(f"Next section requested, emotion: {session_data['emotion']}")
                
                # Send next section
                await send_comfort_section(websocket, session_data, sections)
            
    except WebSocketDisconnect:
        print("WebSocket disconnected normally")
    except Exception as e:
        print(f"WebSocket Error: {e}")
        try:
            await websocket.send_json({"type": "error", "error": str(e)})
        except:
            pass


async def send_comfort_section(websocket: WebSocket, session_data: dict, sections: list):
    """Generate and stream a comfort message for the current section"""
    
    summary = session_data.get("summary")
    emotion = session_data.get("emotion", "neutral")
    section_idx = session_data["section_count"]
    
    if not summary:
        await websocket.send_json({"type": "error", "error": "No summary available"})
        return
    
    if section_idx >= len(sections):
        await websocket.send_json({"type": "complete"})
        return
    
    section_name = sections[section_idx]
    
    # Emotion-specific prompt engineering
    emotion_context = {
        "sad": "The patient is feeling SAD. Be compassionate and highlight positive findings.",
        "fearful": "The patient is feeling FEARFUL/ANXIOUS. Provide calm, reassuring explanations.",
        "neutral": "The patient appears CALM. Provide clear, factual information.",
        "angry": "The patient seems FRUSTRATED. Validate feelings while providing clarity.",
        "surprised": "The patient looks SURPRISED. Help them process the information.",
        "happy": "The patient seems HAPPY/RELIEVED. Reinforce the positive.",
        "disgusted": "The patient appears UNCOMFORTABLE. Normalize and provide context."
    }
    
    emotion_instruction = emotion_context.get(emotion.lower(), emotion_context["neutral"])
    
    prompt = (
        f"Medical Report Summary: '{summary[:4000]}'"
        f"\n\nYou are a compassionate medical assistant. {emotion_instruction}"
        f"\n\nExplain the '{section_name}' section of this medical report in 2-4 sentences. "
        f"Use simple language. Reference specific findings from the report. "
        f"Be warm and reassuring while being accurate. Do NOT use greetings or sign-offs."
    )
    
    try:
        # Stream response from Gemini
        response = model.generate_content(prompt, stream=True)
        
        for chunk in response:
            if chunk.text:
                await websocket.send_json({
                    "type": "message",
                    "text": chunk.text
                })
        
        # Section complete
        session_data["section_count"] += 1
        
        await websocket.send_json({
            "type": "end",
            "progress": f"{session_data['section_count']}/{len(sections)}"
        })
        
        # Check if all sections done
        if session_data["section_count"] >= len(sections):
            await websocket.send_json({"type": "complete"})
            
    except Exception as e:
        print(f"Error generating section: {e}")
        await websocket.send_json({"type": "error", "error": str(e)})
