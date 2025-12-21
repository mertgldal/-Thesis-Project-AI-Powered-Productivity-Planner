from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.extensions import db
from flask_jwt_extended import JWTManager

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize Plugins
    db.init_app(app)
    JWTManager(app)
    CORS(app, supports_credentials=True)

    with app.app_context():
        # This now works because of Step 3!
        from app.models import User
        db.create_all()

    from app.routes.auth import auth_bp
    from app.routes.tasks import tasks_bp
    from app.routes.calendar import calendar_bp
    from app.routes.ai import ai_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(calendar_bp)
    app.register_blueprint(ai_bp)
    
    return app