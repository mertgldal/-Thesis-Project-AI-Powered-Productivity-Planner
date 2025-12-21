from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.ai import generate_suggestions
from app.models import Task, User
from datetime import datetime, timedelta
import requests

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

# --- HELPER: GET USER FROM DB ---
def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(user_id)

# --- HELPER: GET BUSY SLOTS ---
def get_google_calendar_busy_slots(user):
    """Fetches busy slots for the next 3 days from Google."""
    if not user.google_access_token:
        return []

    token = user.google_access_token
    now = datetime.utcnow()
    end = now + timedelta(days=3)
    
    headers = {'Authorization': f'Bearer {token}'}
    body = {
        "timeMin": now.isoformat() + 'Z',
        "timeMax": end.isoformat() + 'Z',
        "timeZone": "UTC",
        "items": [{"id": "primary"}]
    }

    try:
        response = requests.post(
            'https://www.googleapis.com/calendar/v3/freeBusy',
            headers=headers,
            json=body
        )
        if response.status_code == 200:
            data = response.json()
            return data.get('calendars', {}).get('primary', {}).get('busy', [])
    except Exception as e:
        print(f"Calendar Error: {e}")
    
    return []

@ai_bp.route('/suggest', methods=['POST'])
@jwt_required()
def suggest_task_time():
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    task_id = data.get('task_id')
    
    task = Task.query.get(task_id)
    if not task or task.user_id != current_user.id:
        return jsonify({"error": "Task not found"}), 404

    # 1. Get Real Busy Slots from Google
    busy_slots = get_google_calendar_busy_slots(current_user)
    
    # 2. Ask Gemini
    # (The generate_suggestions function in services/ai.py handles the logic)
    suggestion_json = generate_suggestions(task, busy_slots)
    
    if not suggestion_json:
        return jsonify({"error": "AI failed to generate suggestions"}), 500

    # 3. Return Raw JSON (Frontend will parse it)
    return jsonify({"suggestions": suggestion_json}), 200