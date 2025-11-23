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
# Don't set generation_config globally - set per request for flexibility
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
    
    # Test API connection
    try:
        test_response = model.generate_content(
            "Say 'Hello'",
            generation_config=genai.GenerationConfig(max_output_tokens=10)
        )
        return {"status": "ready", "api": "connected"}
    except Exception as e:
        return {"status": "error", "message": f"API error: {str(e)}"}
    
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
            f"The explanation should be in simple language yet highly detailed.\n\n"
            f"CRITICAL FORMATTING INSTRUCTIONS:\n"
            f"- Separate EACH individual test/metric finding with the delimiter: ###SECTION###\n"
            f"- Each section should contain ONE specific test or metric with its result, reference range, and explanation\n"
            f"- Format each finding as: Test Name: Description\nPatient's Result: [value]\nReference Range: [range]\nExplanation: [detailed explanation]\n"
            f"- Start each new test/metric with ###SECTION### on its own line\n"
            f"- Do not include conversational filler (like 'Hello', 'Here is your report')\n"
            f"- If there is an anomaly/abnormality, explain it in more depth\n\n"
            f"Example format:\n"
            f"###SECTION###\n"
            f"Fasting Blood Glucose: This measures the amount of sugar in your blood after fasting.\n"
            f"Patient's Result: 156 mg/dL\n"
            f"Reference Range: 70-99 mg/dL\n"
            f"Explanation: The result is HIGH and indicates elevated blood sugar.\n"
            f"###SECTION###\n"
            f"[next test]\n\n"
            f"REPORT TEXT:\n{extracted_text}"
        )

        # Call Gemini API
        response = model.generate_content(prompt)
        
        return {"summary": response.text}

    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}

# Store session state for each websocket connection
session_state = {}

def strip_patient_identifiers(text):
    """Remove patient names and identifiers to prevent third-person references"""
    import re
    # Remove common patient name patterns
    text = re.sub(r'\b(Mr\.|Mrs\.|Ms\.|Dr\.)\s+[A-Z][a-z]+(?:\s+[A-Z]\.)?(?:\s+[A-Z][a-z]+)+', 'the patient', text, flags=re.IGNORECASE)
    # Remove standalone full names (e.g., "Robert M. Anderson")
    text = re.sub(r'\b[A-Z][a-z]+\s+[A-Z]\.\s+[A-Z][a-z]+', 'the patient', text)
    # Remove possessive forms like "Anderson's"
    text = re.sub(r"\b[A-Z][a-z]+'s\b", "your", text)
    return text

def parse_sections(summary_text):
    """Parse the medical summary into individual test/metric sections using the special delimiter"""
    # First try to split by the special delimiter
    if '###SECTION###' in summary_text:
        raw_sections = summary_text.split('###SECTION###')
        sections = []
        
        for raw_section in raw_sections:
            content = raw_section.strip()
            if not content:
                continue
            
            # Extract title from the first line (usually the test name)
            lines = content.split('\n')
            title = "Medical Finding"
            
            # Try to get a meaningful title from the first line
            if lines:
                first_line = lines[0].strip()
                if ':' in first_line:
                    title = first_line.split(':')[0].strip()
                elif len(first_line) < 100:
                    title = first_line
            
            sections.append({
                "title": title,
                "content": content
            })
        
        print(f"Parsed {len(sections)} sections using ###SECTION### delimiter")
        return sections
    
    # Fallback: Legacy parsing method if delimiter not found
    print("No ###SECTION### delimiter found, using legacy parsing")
    lines = summary_text.split('\n')
    sections = []
    current_section = {"title": "Introduction", "content": ""}
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Detect section headers
        is_header = (
            (len(line) < 100 and (
                line.endswith(':') or 
                line.isupper() or
                any(keyword in line.lower() for keyword in [
                    'panel', 'screening', 'test', 'function', 'count', 
                    'markers', 'findings', 'summary', 'recommendations'
                ])
            )) and not line.startswith('•') and not line.startswith('-')
        )
        
        if is_header and current_section["content"]:
            sections.append(current_section)
            current_section = {"title": line.rstrip(':'), "content": ""}
        else:
            current_section["content"] += line + "\n"
    
    if current_section["content"]:
        sections.append(current_section)
    
    return sections

@app.websocket("/comfort-stream")
async def comfort_stream(websocket: WebSocket):
    await websocket.accept()
    connection_id = id(websocket)
    
    # Validate API key immediately
    if not GOOGLE_API_KEY:
        await websocket.send_json({"error": "API key not configured. Please set GEMINI_API_KEY environment variable."})
        await websocket.close()
        return
    
    session_state[connection_id] = {
        "current_section": 0,
        "sections": [],
        "introduced": False
    }
    
    print(f"WebSocket connection {connection_id} accepted")
    
    try:
        while True:
            data = await websocket.receive_json()
            emotion = data.get("emotion", "neutral")
            summary = data.get("summary", "")
            action = data.get("action", "next")  # "next" or "init"
            
            session = session_state[connection_id]
            
            # Initialize sections when summary is first received
            if action == "init" and summary and not session["sections"]:
                session["sections"] = parse_sections(summary)
                session["current_section"] = 0
                session["introduced"] = False
                print(f"\n=== Parsed {len(session['sections'])} sections from summary ===")
                for idx, sec in enumerate(session["sections"][:3]):  # Log first 3 sections
                    print(f"Section {idx}: {sec['title'][:50]}")
                    print(f"Content preview: {sec['content'][:150]}...")
                    print("-" * 50)
            
            if not session["sections"]:
                await websocket.send_json({"error": "No report loaded"})
                continue
            
            # Introduction
            if not session["introduced"]:
                print(f"Generating introduction...")
                intro_prompt = (
                    "You are a compassionate AI medical assistant named 'LucidCare Assistant'. "
                    "Introduce yourself warmly and conversationally in 2-3 sentences. "
                    "Address the patient directly using 'you' and 'I'. For example: 'Hi! I'm LucidCare Assistant, and I'm here to help you understand your medical report.' "
                    "Explain that you'll walk them through their report section by section, adapting to how they're feeling. "
                    "Keep it warm, personal, and conversational - like a caring nurse speaking to them."
                )
                
                try:
                    print("Calling Gemini API for introduction...")
                    response = model.generate_content(
                        intro_prompt, 
                        stream=True,
                        generation_config=genai.GenerationConfig(
                            temperature=0.3,
                            max_output_tokens=150
                        )
                    )
                    print("Streaming introduction response...")
                    chunk_count = 0
                    for chunk in response:
                        if hasattr(chunk, 'text') and chunk.text:
                            chunk_count += 1
                            await websocket.send_json({"type": "message", "text": chunk.text})
                    
                    print(f"Introduction complete - sent {chunk_count} chunks")
                    session["introduced"] = True
                    await websocket.send_json({"type": "end", "section": "introduction"})
                except Exception as e:
                    import traceback
                    error_details = traceback.format_exc()
                    error_msg = str(e) if str(e) else "Unknown Gemini API error"
                    print(f"Error generating introduction: {error_msg}")
                    print(f"Full traceback:\n{error_details}")
                    await websocket.send_json({"error": f"Introduction error: {error_msg}"})
                continue
            
            # Check if we've finished all sections
            if session["current_section"] >= len(session["sections"]):
                conclusion_prompt = (
                    "You've finished explaining all sections of the medical report. "
                    "In 2-3 sentences, provide a warm, conversational conclusion. "
                    "Speak directly to the patient using 'you' and 'I'. For example: 'We've covered all your test results together.' "
                    "Remind them that their healthcare provider will discuss next steps, and encourage them to ask questions. "
                    "Be supportive and personal - like a caring nurse would speak."
                )
                
                try:
                    print("Generating conclusion...")
                    response = model.generate_content(
                        conclusion_prompt, 
                        stream=True,
                        generation_config=genai.GenerationConfig(
                            temperature=0.3,
                            max_output_tokens=150
                        )
                    )
                    chunk_count = 0
                    for chunk in response:
                        if hasattr(chunk, 'text') and chunk.text:
                            chunk_count += 1
                            await websocket.send_json({"type": "message", "text": chunk.text})
                    
                    print(f"Conclusion complete - sent {chunk_count} chunks")
                    await websocket.send_json({"type": "complete"})
                except Exception as e:
                    import traceback
                    error_details = traceback.format_exc()
                    error_msg = str(e) if str(e) else "Unknown Gemini API error"
                    print(f"Error generating conclusion: {error_msg}")
                    print(f"Full traceback:\n{error_details}")
                    await websocket.send_json({"error": f"Conclusion error: {error_msg}"})
                continue
            
            # Get current section
            section = session["sections"][session["current_section"]]
            
            # Strip patient identifiers to prevent third-person references
            clean_content = strip_patient_identifiers(section['content'][:3000])
            
            # Emotion-aware section explanation prompts
            emotion_context = {
                "sad": "I can see you might be feeling a bit sad or concerned right now. Let's look at this together. ",
                "fearful": "I sense this might be making you anxious. Don't worry, I'm here to help you understand this. ",
                "angry": "I understand you might be feeling frustrated. Let me explain this clearly for you. ",
                "surprised": "I see this information caught you off guard. Let me break it down for you. ",
                "happy": "I'm glad to see you're staying positive! That's a great attitude. ",
                "neutral": "",
                "disgusted": "I know some medical information can feel uncomfortable. Let's go through this together. "
            }
            
            emotion_prefix = emotion_context.get(emotion.lower(), "")
            
            section_prompt = (
                f"You are a caring nurse having a one-on-one conversation with a patient about ONE specific test result. "
                f"This is section {session['current_section'] + 1} of {len(session['sections'])}. "
                f"Patient's emotion: {emotion}. {emotion_prefix}"
                f"\n\n=== THIS TEST ONLY ==="
                f"\nTest: {section['title']}"
                f"\nData: {clean_content}"
                f"\n\n=== CRITICAL RULES (MUST FOLLOW) ==="
                f"\n1. NEVER use patient names, titles, or third person (NO 'Mr. Anderson', 'Robert', 'his', 'her', 'the patient')"
                f"\n2. ONLY use: 'you', 'your', 'I', 'we', 'let's'"
                f"\n3. Write EXACTLY 3-5 sentences - no more, no less"
                f"\n4. Explain ONLY this one specific test result - ignore all other tests/diagnoses mentioned in the data"
                f"\n5. Start with phrases like: 'Your [test name] came in at...' or 'Let's look at your [test]...' or 'Okay, your [test] shows...'"
                f"\n6. Include specific numbers from the result"
                f"\n7. Compare to normal range and explain what it means"
                f"\n8. If negative emotion, acknowledge warmly and find something positive/normal"
                f"\n9. DON'T repeat previous sections or give overall diagnoses"
                f"\n10. DON'T say 'next section', 'moving on', or ask if ready"
                f"\n11. Complete all sentences - don't cut off mid-thought"
                f"\n\nGOOD Example: 'Let's look at your glucose levels. Your result came in at 156 mg/dL. The normal range is 70-99 mg/dL, so yours is higher than we'd like to see. This tells us your blood sugar is elevated, which is something we'll want to address.'"
                f"\n\nBAD Example: 'Mr. Anderson's fasting blood glucose is elevated at 156 mg/dL. The patient shows signs of...' (WRONG: uses third person!)"
            )
            
            # Stream the section explanation with deterministic temperature and length control
            print(f"Generating explanation for section {session['current_section'] + 1}: {section['title']}")
            print(f"Emotion: {emotion}")
            
            try:
                print("Calling Gemini API for section explanation...")
                response = model.generate_content(
                    section_prompt, 
                    stream=True,
                    generation_config=genai.GenerationConfig(
                        temperature=0.3,
                        max_output_tokens=200,  # Ensure complete responses, not cutoff
                        top_p=0.95
                    )
                )
                print("Streaming section response...")
                chunk_count = 0
                for chunk in response:
                    if hasattr(chunk, 'text') and chunk.text:
                        chunk_count += 1
                        await websocket.send_json({"type": "message", "text": chunk.text})
                
                # Move to next section
                session["current_section"] += 1
                
                await websocket.send_json({
                    "type": "end",
                    "section": section['title'],
                    "progress": f"{session['current_section']}/{len(session['sections'])}"
                })
                print(f"Successfully generated section {session['current_section']}/{len(session['sections'])} - sent {chunk_count} chunks")
                
            except Exception as e:
                import traceback
                error_details = traceback.format_exc()
                error_msg = str(e) if str(e) else "Unknown Gemini API error"
                print(f"Error generating section explanation: {error_msg}")
                print(f"Full traceback:\n{error_details}")
                await websocket.send_json({"error": f"Section error: {error_msg}"})
                # Still increment to avoid getting stuck
                session["current_section"] += 1
            
    except Exception as e:
        print(f"WebSocket Error: {e}")
    finally:
        if connection_id in session_state:
            del session_state[connection_id]