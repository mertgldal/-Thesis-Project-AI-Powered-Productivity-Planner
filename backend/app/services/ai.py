import requests
from flask import current_app
from datetime import datetime
import json

def generate_suggestions(task, busy_slots):
    """
    Debug version: Returns the raw error from Google if something goes wrong.
    """
    api_key = current_app.config.get('GEMINI_API_KEY')
    if not api_key:
        return json.dumps({"error": "Configuration Error: GEMINI_API_KEY is missing in config.py"})

    # 1. Endpoint
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    # 2. Prompt
    now = datetime.now()
    prompt_text = f"""
    Act as an expert Productivity Coach.
    
    CURRENT CONTEXT:
    - Today: {now.strftime('%Y-%m-%d')}
    - Working Hours: 09:00 to 17:00
    - Busy Slots: {busy_slots}
    
    TASK DETAILS:
    - Description: "{task.description}"
    - Priority: {task.priority} (High priority = Schedule in morning/deep focus hours)
    - Duration: {task.estimated_duration} mins
    - Deadline: {task.deadline if task.deadline else "None"}

    GOAL:
    Find 3 optimal start times for this task over the next 3 days.
    
    LOGIC:
    1. STRICTLY avoid the Busy Slots.
    2. If Priority is 'High', prefer morning slots (09:00-12:00) for "Deep Work".
    3. If Duration is short (<30m), try to fit it in small gaps.
    4. Provide a "Reason" that explains the productivity benefit (e.g., "Morning slot for peak focus", "Fits in gap before lunch").

    OUTPUT FORMAT:
    Return valid JSON only. No markdown. No comments.
    Structure:
    {{
        "suggestions": [
            {{ "start": "YYYY-MM-DDTHH:MM:SS", "reason": "Why this time works" }},
            {{ "start": "YYYY-MM-DDTHH:MM:SS", "reason": "Why this time works" }}
        ]
    }}
    """

    # 3. Request
    payload = { "contents": [{ "parts": [{"text": prompt_text}] }] }
    headers = {'Content-Type': 'application/json'}

    try:
        response = requests.post(url, headers=headers, json=payload)
        
        # --- ERROR HANDLING ---
        if response.status_code != 200:
            # Return the exact error message from Google
            return json.dumps({
                "error": f"Google API Error {response.status_code}",
                "details": response.text 
            })

        data = response.json()
        
        # Check if the AI was blocked by safety filters
        if "candidates" in data and not data["candidates"][0].get("content"):
            return json.dumps({
                "error": "Blocked by Safety Filters",
                "details": data["candidates"][0].get("finishReason")
            })

        # Success path
        text = data['candidates'][0]['content']['parts'][0]['text']
        
        # Clean markdown
        text = text.replace("```json", "").replace("```", "").strip()
        return text

    except Exception as e:
        return json.dumps({"error": "Python Exception", "details": str(e)})
    

    