from flask import Blueprint, redirect, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests
from app.extensions import db
from app.models import User, Task
from datetime import datetime, timedelta

calendar_bp = Blueprint('calendar', __name__, url_prefix='/api/calendar')

# --- HELPER: GET USER FROM DB ---
def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(user_id)

# --- HELPER: REFRESH GOOGLE TOKEN ---
def refresh_google_token(user):
    """Uses the long-lived refresh token to get a new access token."""
    if not user.google_refresh_token:
        return None

    payload = {
        'client_id': current_app.config['GOOGLE_CLIENT_ID'],
        'client_secret': current_app.config['GOOGLE_CLIENT_SECRET'],
        'refresh_token': user.google_refresh_token,
        'grant_type': 'refresh_token'
    }
    
    try:
        response = requests.post(current_app.config['GOOGLE_TOKEN_URL'], data=payload)
        tokens = response.json()
        
        if 'access_token' in tokens:
            user.google_access_token = tokens['access_token']
            db.session.commit()
            return tokens['access_token']
    except Exception as e:
        print(f"Error refreshing token: {e}")
    
    return None



@calendar_bp.route('/status', methods=['GET'])
@jwt_required()
def get_connection_status():
    """Checks if the user has a valid Google Refresh Token."""
    user = get_current_user()
    if not user:
        return jsonify({"connected": False}), 404
        
    # If they have a refresh token, they are permanently connected
    is_connected = bool(user.google_refresh_token)
    return jsonify({"connected": is_connected})


# --- HELPER: GET VALID TOKEN ---
def get_valid_token(user):
    """Checks if access token exists, attempts refresh if needed."""
    # 1. Check if user has any token
    if not user.google_access_token:
        return None
    
    # 2. In a real app, we check expiry time here.
    # For now, we return the current token. If it fails (401),
    # the calling function should handle the refresh logic or we do it proactively.
    return user.google_access_token


# 1. GENERATE LOGIN URL
@calendar_bp.route('/auth/url', methods=['GET'])
@jwt_required()
def get_google_auth_url():
    scope = "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events"
    
    redirect_uri = current_app.config['GOOGLE_REDIRECT_URI']
    
    params = {
        "client_id": current_app.config['GOOGLE_CLIENT_ID'],
        "redirect_uri": redirect_uri, 
        "response_type": "code",
        "scope": scope,
        "access_type": "offline", 
        "prompt": "consent"
    }
    
    url = f"{current_app.config['GOOGLE_AUTH_URL']}?" + "&".join(f"{k}={v}" for k, v in params.items())
    return jsonify({"auth_url": url})


# 2. HANDLE THE CALLBACK
@calendar_bp.route('/auth/exchange', methods=['POST'])
@jwt_required()
def exchange_google_code():
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "User not found"}), 404

    # React sends the code in the JSON body now
    data = request.get_json()
    code = data.get('code')
    
    if not code:
        return jsonify({"error": "No code provided"}), 400

    token_data = {
        "code": code,
        "client_id": current_app.config['GOOGLE_CLIENT_ID'],
        "client_secret": current_app.config['GOOGLE_CLIENT_SECRET'],
        "redirect_uri": current_app.config['GOOGLE_REDIRECT_URI'], # Must match the one in Step 1
        "grant_type": "authorization_code"
    }

    try:
        response = requests.post(current_app.config['GOOGLE_TOKEN_URL'], data=token_data)
        tokens = response.json()

        if "error" in tokens:
            return jsonify({"error": tokens.get("error_description")}), 400

        # Save tokens
        current_user.google_access_token = tokens.get('access_token')
        if tokens.get('refresh_token'):
            current_user.google_refresh_token = tokens.get('refresh_token')
        
        db.session.commit()

        return jsonify({"message": "Google Calendar connected successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 3. CHECK AVAILABILITY (Used by AI)
@calendar_bp.route('/availability', methods=['GET'])
@jwt_required()
def get_availability():
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "User not found"}), 404

    token = get_valid_token(current_user)
    if not token:
        return jsonify({"error": "Google Calendar not connected"}), 400

    # Range: Now to +3 Days (Matches AI logic)
    now = datetime.utcnow()
    end = now + timedelta(days=3)
    
    time_min = now.isoformat() + 'Z'
    time_max = end.isoformat() + 'Z'

    headers = {'Authorization': f'Bearer {token}'}
    body = {
        "timeMin": time_min,
        "timeMax": time_max,
        "timeZone": "UTC",
        "items": [{"id": "primary"}]
    }

    # First Attempt
    response = requests.post(
        'https://www.googleapis.com/calendar/v3/freeBusy',
        headers=headers,
        json=body
    )

    # Retry if Unauthorized (Token Expired)
    if response.status_code == 401:
        new_token = refresh_google_token(current_user)
        if new_token:
            headers['Authorization'] = f'Bearer {new_token}'
            response = requests.post(
                'https://www.googleapis.com/calendar/v3/freeBusy',
                headers=headers,
                json=body
            )
        else:
             return jsonify({"error": "Token expired, please reconnect calendar"}), 401

    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch calendar data"}), 400

    data = response.json()
    busy_slots = data.get('calendars', {}).get('primary', {}).get('busy', [])
    
    return jsonify({
        "time_range": {"start": time_min, "end": time_max},
        "busy_slots": busy_slots
    })


# 4. SCHEDULE TASK
@calendar_bp.route('/schedule', methods=['POST'])
@jwt_required()
def schedule_task():
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    task_id = data.get('task_id')
    start_time = data.get('start_time')
    end_time = data.get('end_time')

    if not all([task_id, start_time, end_time]):
        return jsonify({"error": "Missing required fields"}), 400

    # Verify Task Ownership
    task = Task.query.get(task_id)
    if not task or task.user_id != current_user.id:
        return jsonify({"error": "Task not found or unauthorized"}), 404

    token = get_valid_token(current_user)
    if not token:
        return jsonify({"error": "Google Calendar not connected"}), 401

    # Formatting
    if not start_time.endswith('Z'): start_time += 'Z'
    if not end_time.endswith('Z'): end_time += 'Z'

    event_body = {
        "summary": task.description,
        "description": "Scheduled via Productivity Planner",
        "start": {"dateTime": start_time},
        "end": {"dateTime": end_time}
    }

    # Send to Google
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.post(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        headers=headers,
        json=event_body
    )

    # Retry Logic
    if response.status_code == 401:
        new_token = refresh_google_token(current_user)
        if new_token:
            headers['Authorization'] = f'Bearer {new_token}'
            response = requests.post(
                'https://www.googleapis.com/calendar/v3/calendars/primary/events',
                headers=headers,
                json=event_body
            )
        else:
            return jsonify({"error": "Token expired"}), 401

    if response.status_code != 200:
        return jsonify({"error": "Google Error", "details": response.text}), 400

    google_event = response.json()

    # Update DB
    task.status = 'Scheduled'
    task.scheduled_start = datetime.fromisoformat(start_time.replace('Z', ''))
    task.scheduled_end = datetime.fromisoformat(end_time.replace('Z', ''))
    task.google_event_id = google_event.get('id')
    
    db.session.commit()

    return jsonify({
        "message": "Task scheduled successfully", 
        "google_event_id": task.google_event_id,
        "link": google_event.get('htmlLink')
    }), 200