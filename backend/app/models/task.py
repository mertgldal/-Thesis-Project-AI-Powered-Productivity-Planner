from app.extensions import db
from datetime import datetime

class Task(db.Model):
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    # Link to the User table
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Task Details
    description = db.Column(db.Text, nullable=False)
    priority = db.Column(db.String(50), default='Medium') # High, Medium, Low
    deadline = db.Column(db.DateTime, nullable=True)
    estimated_duration = db.Column(db.Integer, nullable=True) # In minutes
    status = db.Column(db.String(50), default='Pending') # Pending, Completed
    
    # Scheduling fields (for later phases)
    scheduled_start = db.Column(db.DateTime, nullable=True)
    scheduled_end = db.Column(db.DateTime, nullable=True)
    google_event_id = db.Column(db.String(255), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """Helper to convert the task to JSON"""
        return {
            'id': self.id,
            'description': self.description,
            'priority': self.priority,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'estimated_duration': self.estimated_duration,
            'status': self.status,
            'scheduled_start': self.scheduled_start.isoformat() if self.scheduled_start else None,
            'scheduled_end': self.scheduled_end.isoformat() if self.scheduled_end else None
        }