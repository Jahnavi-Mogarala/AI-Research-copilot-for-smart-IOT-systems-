import random
import datetime
import math
from sqlalchemy.orm import Session
from models import Sensor, SensorLog, Anomaly, Notification, SystemAnalytics

# Predefined sensor configurations
SENSOR_TEMPLATES = [
    {"id": "temp-01", "name": "Server Rack A Temperature", "type": "temperature", "location": "Server Room Alpha", "min": 20.0, "max": 28.0, "threshold": 40.0},
    {"id": "hum-01", "name": "Server Rack A Humidity", "type": "humidity", "location": "Server Room Alpha", "min": 40.0, "max": 55.0, "threshold": 70.0},
    {"id": "pres-01", "name": "HVAC Pressure", "type": "pressure", "location": "Main Hallway", "min": 980.0, "max": 1020.0, "threshold": 1050.0},
    {"id": "gas-01", "name": "Battery Room Gas Detector", "type": "gas", "location": "Battery Vault", "min": 50.0, "max": 120.0, "threshold": 300.0},
    {"id": "bat-01", "name": "UPS System Battery Voltage", "type": "battery", "location": "Power Distribution Room", "min": 11.5, "max": 13.8, "threshold": 11.0},
    {"id": "pwr-01", "name": "Main Server Bus Power", "type": "power", "location": "Power Distribution Room", "min": 2000.0, "max": 3500.0, "threshold": 4200.0}
]

# Trackers for random walks
_walk_states = {}

def seed_sensors(db: Session):
    for template in SENSOR_TEMPLATES:
        sensor = db.query(Sensor).filter(Sensor.id == template["id"]).first()
        if not sensor:
            sensor = Sensor(
                id=template["id"],
                name=template["name"],
                type=template["type"],
                location=template["location"],
                status="active",
                current_value=random.uniform(template["min"], template["max"])
            )
            db.add(sensor)
    db.commit()

def generate_sensor_step(db: Session, force_anomaly: bool = False):
    """
    Simulates a time-step of IoT sensor reading updates, creating sensor_logs and detecting anomalies.
    """
    now = datetime.datetime.utcnow()
    seed_sensors(db)
    
    # 1. Update/create SystemAnalytics for monitoring stats
    analytics = db.query(SystemAnalytics).order_by(SystemAnalytics.timestamp.desc()).first()
    if not analytics or (now - analytics.timestamp).seconds > 60:
        analytics = SystemAnalytics(
            timestamp=now,
            latency=random.uniform(12.4, 28.5),
            accuracy=random.uniform(0.985, 0.999),
            anomaly_count=db.query(Anomaly).filter(Anomaly.resolved == False).count(),
            api_usage=random.randint(150, 450),
            prediction_confidence=random.uniform(0.92, 0.98)
        )
        db.add(analytics)

    # 2. Iterate sensors and generate logs
    for template in SENSOR_TEMPLATES:
        sensor_id = template["id"]
        sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
        if not sensor:
            continue

        # Simple Random Walk
        if sensor_id not in _walk_states:
            _walk_states[sensor_id] = sensor.current_value

        current_val = _walk_states[sensor_id]
        
        # Periodic sine wave fluctuation + random noise
        hour_factor = math.sin(now.hour * math.pi / 12) * (template["max"] - template["min"]) * 0.15
        step = random.uniform(-1, 1) * (template["max"] - template["min"]) * 0.05
        new_val = current_val + step + hour_factor
        
        # Clip to reasonable boundaries unless an anomaly is forced
        if not force_anomaly:
            new_val = max(template["min"] * 0.8, min(new_val, template["max"] * 1.2))
        else:
            # Force values beyond limits
            if template["type"] == "temperature":
                new_val = random.uniform(42.0, 55.0)
            elif template["type"] == "gas":
                new_val = random.uniform(320.0, 450.0)
            elif template["type"] == "battery":
                new_val = random.uniform(9.5, 10.8)
            elif template["type"] == "power":
                new_val = random.uniform(4300.0, 4900.0)
            else:
                new_val = template["threshold"] * 1.2

        _walk_states[sensor_id] = new_val
        sensor.current_value = round(new_val, 2)
        
        # Create log record
        log = SensorLog(sensor_id=sensor_id, value=sensor.current_value, timestamp=now)
        db.add(log)

        # 3. Detect Anomalies
        is_anomaly = False
        description = ""
        severity = "warning"

        if template["type"] == "temperature" and new_val > template["threshold"]:
            is_anomaly = True
            severity = "critical" if new_val > (template["threshold"] * 1.15) else "warning"
            description = f"High temperature anomaly detected in {sensor.name} at {sensor.location}: {sensor.current_value}°C exceeds critical threshold of {template['threshold']}°C."
        
        elif template["type"] == "gas" and new_val > template["threshold"]:
            is_anomaly = True
            severity = "critical"
            description = f"Harmful gas concentration spike detected in {sensor.location}: {sensor.current_value} ppm exceeds safe threshold of {template['threshold']} ppm."

        elif template["type"] == "battery" and new_val < template["threshold"]:
            is_anomaly = True
            severity = "critical" if new_val < (template["threshold"] * 0.95) else "warning"
            description = f"Low battery voltage warning on {sensor.name}: Current voltage {sensor.current_value}V is below recommended minimum {template['threshold']}V."

        elif template["type"] == "power" and new_val > template["threshold"]:
            is_anomaly = True
            severity = "warning"
            description = f"Power surge on main line {sensor.name}: Draw of {sensor.current_value}W exceeds standard limits."

        if is_anomaly:
            # Avoid duplicate warnings in the last 2 minutes for the same sensor
            recent_anomaly = db.query(Anomaly).filter(
                Anomaly.sensor_id == sensor_id,
                Anomaly.resolved == False,
                Anomaly.timestamp > (now - datetime.timedelta(minutes=2))
            ).first()
            
            if not recent_anomaly:
                anomaly = Anomaly(
                    sensor_id=sensor_id,
                    metric=template["type"],
                    value=sensor.current_value,
                    threshold=template["threshold"],
                    severity=severity,
                    description=description,
                    timestamp=now,
                    resolved=False
                )
                db.add(anomaly)
                sensor.status = severity

                # Trigger real-time notifications for users
                users = db.query(Sensor.id).all() # Just to see users, actually let's broadcast to all users
                # We'll create notifications for active accounts
                from models import User
                all_users = db.query(User).all()
                for user in all_users:
                    notif = Notification(
                        user_id=user.id,
                        title=f"{severity.upper()}: IoT Anomaly Detected",
                        message=description,
                        type=severity,
                        timestamp=now,
                        read=False
                    )
                    db.add(notif)
        else:
            # Resolve sensor warning state if normal
            if sensor.status != "active":
                # Check if there are active anomalies in the last 5 minutes
                active = db.query(Anomaly).filter(
                    Anomaly.sensor_id == sensor_id,
                    Anomaly.resolved == False
                ).all()
                if not active:
                    sensor.status = "active"

    # Prune historical logs older than 24 hours to keep things fast
    cutoff = now - datetime.timedelta(hours=24)
    db.query(SensorLog).filter(SensorLog.timestamp < cutoff).delete()
    
    db.commit()
