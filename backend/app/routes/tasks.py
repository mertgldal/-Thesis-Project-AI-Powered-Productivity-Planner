from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Task
from datetime import datetime

tasks_bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')

# 1. GET ALL TASKS
@tasks_bp.route('', methods=['GET'])
@jwt_required()
def get_tasks():
    # Only fetch tasks belonging to the logged-in user
    tasks = Task.query.filter_by(user_id=get_jwt_identity()).all()
    return jsonify([task.to_dict() for task in tasks]), 200

# 2. CREATE A TASK
@tasks_bp.route('', methods=['POST'])
@jwt_required()
def create_task():
    data = request.get_json()
    
    if not data.get('description'):
        return jsonify({'error': 'Description is required'}), 400

    # Parse deadline if provided (assumes ISO format "YYYY-MM-DDTHH:MM:SS")
    deadline_dt = None
    if data.get('deadline'):
        try:
            deadline_dt = datetime.fromisoformat(data.get('deadline'))
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400

    new_task = Task(
        user_id=get_jwt_identity(),
        description=data.get('description'),
        priority=data.get('priority', 'Medium'),
        estimated_duration=data.get('estimated_duration'), # e.g., 60 minutes
        deadline=deadline_dt
    )

    db.session.add(new_task)
    db.session.commit()

    return jsonify(new_task.to_dict()), 201

# 3. UPDATE TASK
@tasks_bp.route('/<int:task_id>', methods=['PUT'])
@jwt_required() 
def update_task(task_id):
    task = Task.query.get_or_404(task_id)

    # Security: Ensure user owns this task
    if task.user_id != get_jwt_identity():
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    
    task.description = data.get('description', task.description)
    task.priority = data.get('priority', task.priority)
    task.estimated_duration = data.get('estimated_duration', task.estimated_duration)
    task.status = data.get('status', task.status)
    
    db.session.commit()
    return jsonify(task.to_dict()), 200

# 4. DELETE TASK
@tasks_bp.route('/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)

    if task.user_id != get_jwt_identity():
        return jsonify({'error': 'Unauthorized'}), 403

    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted'}), 200