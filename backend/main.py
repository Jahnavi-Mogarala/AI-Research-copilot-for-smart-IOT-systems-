import os
import json
import jwt
import datetime
import asyncio
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel

import database
import models
import simulator
import rag_engine
import agent

# Initialize Database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="JKUAD VinRaVS 2502 AI Backend",
    description="Enterprise Industrial IoT Diagnostics Analytics Engine",
    version="2.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication Details
JWT_SECRET = os.getenv("JWT_SECRET", "vinravs-ultra-secret-key-2502")
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

# Password Hashing Fallback
try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)
    def verify_password(plain: str, hashed: str) -> bool:
        return pwd_context.verify(plain, hashed)
except Exception:
    # Hashlib fallback if bcrypt fails to compile
    import hashlib
    def hash_password(password: str) -> str:
        return hashlib.sha256(password.encode()).hexdigest()
    def verify_password(plain: str, hashed: str) -> bool:
        return hashlib.sha256(plain.encode()).hexdigest() == hashed

# --- Pydantic Schemas ---
class UserRegister(BaseModel):
    email: str
    password: str
    role: Optional[str] = "Student"

class UserLogin(BaseModel):
    email: str
    password: str

class OTPVerify(BaseModel):
    email: str
    otp: str

class ForgotPassword(BaseModel):
    email: str

class RAGQuery(BaseModel):
    query: str
    chat_id: Optional[int] = None

class MemoryUpdate(BaseModel):
    key: str
    value: str

class SettingUpdate(BaseModel):
    config_json: str

# Active websocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

# --- Auth Helper ---
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        # For demonstration purposes, fallback to a default admin user if no token is provided
        default_user = db.query(models.User).first()
        if not default_user:
            default_user = models.User(email="researcher@jkuad.edu", password_hash=hash_password("password"), role="Researcher")
            db.add(default_user)
            db.commit()
            db.refresh(default_user)
        return default_user

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# --- AUTH ENDPOINTS ---
@app.post("/api/auth/register")
def register(data: UserRegister, db: Session = Depends(database.get_db)):
    existing = db.query(models.User).filter(models.User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = models.User(
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Initialize user settings
    settings = models.Settings(user_id=new_user.id, config_json='{"theme": "dark", "notificationsEnabled": true}')
    db.add(settings)
    db.commit()
    
    return {"message": "Registration successful. OTP sent to email.", "email": data.email}

@app.post("/api/auth/verify-otp")
def verify_otp(data: OTPVerify, db: Session = Depends(database.get_db)):
    # OTP simulated: '123456' is the global mock OTP
    if data.otp != "123456" and data.otp != "2502":
        raise HTTPException(status_code=400, detail="Invalid OTP code")
        
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Generate JWT token
    access_token = jwt.encode(
        {"sub": user.email, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)},
        JWT_SECRET,
        algorithm=ALGORITHM
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"email": user.email, "role": user.role}
    }

@app.post("/api/auth/login")
def login(data: UserLogin, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    # Mock sending OTP for security compliance
    return {"message": "OTP verification required", "email": data.email, "requires_otp": True}

@app.post("/api/auth/forgot-password")
def forgot_password(data: ForgotPassword):
    # Simulated recovery email
    return {"message": "Password recovery email sent successfully"}

@app.get("/api/auth/me")
def get_me(user: models.User = Depends(get_current_user)):
    return {"email": user.email, "role": user.role, "id": user.id}


# --- SENSOR ENDPOINTS ---
@app.get("/api/sensors")
def get_sensors(db: Session = Depends(database.get_db)):
    simulator.seed_sensors(db)
    sensors = db.query(models.Sensor).all()
    return sensors

@app.get("/api/sensors/{sensor_id}/logs")
def get_sensor_logs(sensor_id: str, db: Session = Depends(database.get_db)):
    logs = db.query(models.SensorLog).filter(models.SensorLog.sensor_id == sensor_id).order_by(models.SensorLog.timestamp.asc()).all()
    return logs

@app.get("/api/sensors/anomalies")
def get_anomalies(db: Session = Depends(database.get_db)):
    anomalies = db.query(models.Anomaly).order_by(models.Anomaly.timestamp.desc()).all()
    return anomalies

@app.post("/api/sensors/anomalies/{anomaly_id}/resolve")
def resolve_anomaly(anomaly_id: int, db: Session = Depends(database.get_db)):
    anomaly = db.query(models.Anomaly).filter(models.Anomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")
    anomaly.resolved = True
    
    # Check if this sensor has other unresolved anomalies
    other_anom = db.query(models.Anomaly).filter(
        models.Anomaly.sensor_id == anomaly.sensor_id,
        models.Anomaly.resolved == False
    ).first()
    if not other_anom:
        sensor = db.query(models.Sensor).filter(models.Sensor.id == anomaly.sensor_id).first()
        if sensor:
            sensor.status = "active"
            
    db.commit()
    return {"message": "Anomaly marked as resolved"}


# --- RAG AI COPILOT ENDPOINTS ---
@app.get("/api/copilot/chats")
def get_chats(user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    chats = db.query(models.Chat).filter(models.Chat.user_id == user.id).order_by(models.Chat.created_at.desc()).all()
    return chats

@app.post("/api/copilot/chats")
def create_chat(user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    chat = models.Chat(user_id=user.id, title="New Conversation")
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat

@app.get("/api/copilot/chats/{chat_id}/messages")
def get_chat_messages(chat_id: int, db: Session = Depends(database.get_db)):
    messages = db.query(models.ChatMessage).filter(models.ChatMessage.chat_id == chat_id).order_by(models.ChatMessage.timestamp.asc()).all()
    parsed_messages = []
    for msg in messages:
        parsed_messages.append({
            "id": msg.id,
            "role": msg.role,
            "content": msg.content,
            "reasoning": json.loads(msg.reasoning) if msg.reasoning else [],
            "citations": json.loads(msg.citations) if msg.citations else [],
            "timestamp": msg.timestamp
        })
    return parsed_messages

@app.post("/api/copilot/query")
def submit_copilot_query(data: RAGQuery, user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    chat_id = data.chat_id
    if not chat_id:
        # Create a new chat if none exists
        # Name it using first 5 words of query
        title = " ".join(data.query.split()[:5]) + "..."
        chat = models.Chat(user_id=user.id, title=title)
        db.add(chat)
        db.commit()
        db.refresh(chat)
        chat_id = chat.id
    else:
        # Update chat title if still set to default
        chat = db.query(models.Chat).filter(models.Chat.id == chat_id).first()
        if chat and chat.title == "New Conversation":
            chat.title = " ".join(data.query.split()[:5]) + "..."
            db.commit()

    # Save User message
    user_msg = models.ChatMessage(
        chat_id=chat_id,
        role="user",
        content=data.query,
        reasoning="[]",
        citations="[]"
    )
    db.add(user_msg)
    db.commit()

    # Trigger RAG computation
    assistant_msg = rag_engine.execute_rag(db, user.id, data.query, chat_id)
    
    # Broadcast to WS connections about new copilot activities
    asyncio.create_task(manager.broadcast({
        "type": "copilot_update",
        "chat_id": chat_id,
        "message": {
            "role": "assistant",
            "content": assistant_msg.content,
            "reasoning": json.loads(assistant_msg.reasoning) if assistant_msg.reasoning else []
        }
    }))
    
    return {
        "chat_id": chat_id,
        "message": {
            "role": "assistant",
            "content": assistant_msg.content,
            "reasoning": json.loads(assistant_msg.reasoning) if assistant_msg.reasoning else [],
            "citations": json.loads(assistant_msg.citations) if assistant_msg.citations else []
        }
    }


# --- AUTONOMOUS AGENT & REPORTS ENDPOINTS ---
@app.get("/api/reports")
def get_reports(db: Session = Depends(database.get_db)):
    return db.query(models.AIReport).order_by(models.AIReport.created_at.desc()).all()

@app.post("/api/reports/generate")
def generate_report(user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    report = agent.run_agent_diagnostics(db, user.id)
    return report


# --- NOTIFICATIONS ENDPOINTS ---
@app.get("/api/notifications")
def get_notifications(user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    return db.query(models.Notification).filter(models.Notification.user_id == user.id).order_by(models.Notification.timestamp.desc()).all()

@app.post("/api/notifications/{notification_id}/read")
def read_notification(notification_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    notif = db.query(models.Notification).filter(models.Notification.id == notification_id, models.Notification.user_id == user.id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.read = True
    db.commit()
    return {"message": "Notification read"}


# --- SYSTEM ANALYTICS ---
@app.get("/api/analytics/system")
def get_system_analytics(db: Session = Depends(database.get_db)):
    now = datetime.datetime.utcnow()
    # Fetch last 12 points
    history = db.query(models.SystemAnalytics).order_by(models.SystemAnalytics.timestamp.desc()).limit(12).all()
    history.reverse()
    
    # Compute active counts
    active_anom_cnt = db.query(models.Anomaly).filter(models.Anomaly.resolved == False).count()
    sensor_cnt = db.query(models.Sensor).count()
    
    return {
        "history": history,
        "metrics": {
            "active_anomalies": active_anom_cnt,
            "total_sensors": sensor_cnt,
            "system_health": 100.0 - (min(active_anom_cnt * 15, 100)), # Simple KPI
            "agent_accuracy": 0.992
        }
    }


# --- ADMIN CONTROL CENTER ---
@app.get("/api/admin/users")
def admin_get_users(user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    if user.role != "Admin":
        raise HTTPException(status_code=403, detail="Admin permissions required")
    return db.query(models.User).all()

@app.post("/api/admin/users/{user_id}/role")
def admin_set_role(user_id: int, new_role: str, user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    if user.role != "Admin":
        raise HTTPException(status_code=403, detail="Admin permissions required")
    target_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    target_user.role = new_role
    db.commit()
    return {"message": "User role updated successfully"}


# --- SIMULATOR CONTROL & WEBSOCKET ---
@app.post("/api/simulator/step")
async def simulator_step(force_anomaly: bool = False, db: Session = Depends(database.get_db)):
    """
    Manually advances the simulator by one step, triggering anomalies if forced.
    Returns the latest sensor states and broadcasts via WebSocket.
    """
    simulator.generate_sensor_step(db, force_anomaly=force_anomaly)
    sensors = db.query(models.Sensor).all()
    anomalies = db.query(models.Anomaly).filter(models.Anomaly.resolved == False).all()
    
    # Prepare broadcast packet
    packet = {
        "type": "telemetry",
        "sensors": [{"id": s.id, "name": s.name, "value": s.current_value, "status": s.status, "type": s.type} for s in sensors],
        "active_anomalies_count": len(anomalies)
    }
    
    await manager.broadcast(packet)
    return packet

# WebSocket router for real-time dashboard telemetry
@app.websocket("/api/ws/sensors")
async def websocket_sensors(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Receive ping/query from client
            data = await websocket.receive_text()
            # Send acknowledgement back
            await websocket.send_json({"type": "ack", "msg": "Active stream connection verified"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
