import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="Student")  # Student, Researcher, Admin
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    chats = relationship("Chat", back_populates="user", cascade="all, delete-orphan")
    memories = relationship("Memory", back_populates="user", cascade="all, delete-orphan")
    settings = relationship("Settings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(String, primary_key=True, index=True) # e.g. "temp-01"
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # temperature, humidity, pressure, power, gas, battery
    location = Column(String, nullable=False)
    status = Column(String, default="active") # active, warning, critical, offline
    current_value = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    logs = relationship("SensorLog", back_populates="sensor", cascade="all, delete-orphan")
    anomalies = relationship("Anomaly", back_populates="sensor", cascade="all, delete-orphan")

class SensorLog(Base):
    __tablename__ = "sensor_logs"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String, ForeignKey("sensors.id", ondelete="CASCADE"), nullable=False, index=True)
    value = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    sensor = relationship("Sensor", back_populates="logs")

# Add composite index on sensor_id and timestamp for faster analytics queries
Index("ix_sensor_logs_sensor_id_timestamp", SensorLog.sensor_id, SensorLog.timestamp)

class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String, ForeignKey("sensors.id", ondelete="CASCADE"), nullable=False, index=True)
    metric = Column(String, nullable=False) # e.g. "temperature"
    value = Column(Float, nullable=False)
    threshold = Column(Float, nullable=False)
    severity = Column(String, nullable=False) # warning, critical
    description = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    resolved = Column(Boolean, default=False)

    sensor = relationship("Sensor", back_populates="anomalies")

class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False, default="New Conversation")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="chats")
    messages = relationship("ChatMessage", back_populates="chat", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String, nullable=False) # user, assistant
    content = Column(Text, nullable=False)
    reasoning = Column(Text, nullable=True) # AI reasoning path
    citations = Column(Text, nullable=True) # JSON or text indicating RAG citations
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    chat = relationship("Chat", back_populates="messages")

class AIReport(Base):
    __tablename__ = "ai_reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    sensor_ids = Column(String, nullable=True) # Comma-separated list of sensors
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Memory(Base):
    __tablename__ = "memories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    key = Column(String, nullable=False, index=True)
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="memories")

class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    config_json = Column(Text, nullable=False, default="{}")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="settings")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info") # info, warning, critical, success
    read = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User", back_populates="notifications")

class SystemAnalytics(Base):
    __tablename__ = "system_analytics"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    latency = Column(Float, default=0.0) # in ms
    accuracy = Column(Float, default=1.0) # percentage or ratio
    anomaly_count = Column(Integer, default=0)
    api_usage = Column(Integer, default=0) # count of requests
    prediction_confidence = Column(Float, default=0.95)
