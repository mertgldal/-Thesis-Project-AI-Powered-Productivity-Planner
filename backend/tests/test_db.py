from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
# Replace 'password123' with the one you typed in the installer!
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:password123@localhost/productivity_planner'

db = SQLAlchemy(app)

class TestTable(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))

with app.app_context():
    try:
        db.create_all()
        print("✅ SUCCESS: Connected to MySQL and created table!")
    except Exception as e:
        print(f"❌ ERROR: Could not connect. Reason: {e}")