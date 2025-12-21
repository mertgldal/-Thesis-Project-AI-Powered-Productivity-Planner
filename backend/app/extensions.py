from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager

# Initialize these here (not in __init__.py)
db = SQLAlchemy()
jwt = JWTManager()