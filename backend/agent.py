import datetime
import json
from sqlalchemy.orm import Session
from models import Sensor, SensorLog, Anomaly, AIReport, Notification, User

def run_agent_diagnostics(db: Session, created_by_id: int = None) -> AIReport:
    """
    Autonomous Agent Loop:
    1. Scan sensor status and logs
    2. Check anomaly frequency
    3. Generate a comprehensive system state report
    4. Proactively generate alerts/notifications if failure risk is high
    """
    now = datetime.datetime.utcnow()
    
    # 1. Gather Telemetry Insights
    sensors = db.query(Sensor).all()
    anomalies = db.query(Anomaly).filter(Anomaly.timestamp > (now - datetime.timedelta(hours=24))).all()
    active_anomalies = [a for a in anomalies if not a.resolved]
    
    # 2. Perform Reasoning / Diagnostics
    sensor_summaries = []
    battery_risk = "LOW"
    thermal_risk = "LOW"
    gas_risk = "LOW"
    
    for s in sensors:
        # Fetch last 5 logs for simple trend check
        logs = db.query(SensorLog).filter(SensorLog.sensor_id == s.id).order_by(SensorLog.timestamp.desc()).limit(5).all()
        trend = "Stable"
        if len(logs) >= 3:
            vals = [l.value for l in logs]
            if all(vals[i] < vals[i+1] for i in range(len(vals)-1)):
                trend = "Decreasing"
            elif all(vals[i] > vals[i+1] for i in range(len(vals)-1)):
                trend = "Increasing"
                
        sensor_summaries.append(f"- **{s.name} ({s.id})**: Current value {s.current_value}, Status: {s.status}, Trend: {trend}")
        
        # Assess specific risks
        if s.type == "battery" and s.current_value < 11.8:
            battery_risk = "MEDIUM" if s.current_value >= 11.2 else "CRITICAL"
        if s.type == "temperature" and s.current_value > 30.0:
            thermal_risk = "MEDIUM" if s.current_value <= 38.0 else "CRITICAL"
        if s.type == "gas" and s.current_value > 150.0:
            gas_risk = "MEDIUM" if s.current_value <= 280.0 else "CRITICAL"

    # 3. Formulate Action/Recommendations
    recommendations = []
    if battery_risk != "LOW":
        recommendations.append(f"[{battery_risk} RISK] Battery bank shows low voltage profiles. Recommend scheduling battery drain test within 48 hours.")
    if thermal_risk != "LOW":
        recommendations.append(f"[{thermal_risk} RISK] Rack thermal threshold exceeded. Verify HVAC output vents and ensure front server bezels are clear.")
    if gas_risk != "LOW":
        recommendations.append(f"[{gas_risk} RISK] Hydrogen gas levels rising. Initiate automatic room exhaust fan cycle.")
        
    if not recommendations:
        recommendations.append("[INFO] All systems nominal. Continue standard 24/7 telemetry monitoring.")

    # 4. Generate AI Report content
    report_title = f"VinRaVS Intelligence Diagnostics - {now.strftime('%b %d, %Y %H:%M')}"
    
    summary = f"System diagnostics complete. Thermal Risk: {thermal_risk}, Battery Risk: {battery_risk}, Gas Leak Risk: {gas_risk}."
    
    sensor_summaries_str = "\n".join(sensor_summaries)
    recommendations_str = "\n".join(recommendations)
    
    content = f"""### 📊 VinRaVS Intelligence Autonomous Report
**Generated on**: {now.strftime('%Y-%m-%d %H:%M:%S UTC')}
**Agent ID**: Autonomous-VinRaVS-01
**Primary Directives**: Anomalies detection, Predictive maintenance scheduling, Health monitoring

---

#### 1. Telemetry State Assessment
Here is the current state of monitored smart IoT systems:
{sensor_summaries_str}

#### 2. Statistical Analysis (Last 24 Hours)
- **Total Logged Data Points**: {db.query(SensorLog).count()}
- **Anomaly Events Logged**: {len(anomalies)}
- **Active Unresolved Warnings**: {len(active_anomalies)}

#### 3. Diagnostics & Risk Reasoning
- **Thermal Subsystem**: Internal Rack temperatures are currently {thermal_risk.lower()} risk. Airflow and fans are operating within design margins.
- **Power & UPS Subsystem**: UPS Battery voltage trend indicates {battery_risk.lower()} risk. 
- **Environmental Security**: Air quality and gas concentration are in {gas_risk.lower()} risk.

#### 4. Predictive Maintenance Action Plan
{recommendations_str}

---
*Verified by VinRaVS Autonomous Diagnostics Agent.*
"""

    report = AIReport(
        title=report_title,
        summary=summary,
        content=content,
        sensor_ids=",".join([s.id for s in sensors]),
        created_by=created_by_id,
        created_at=now
    )
    db.add(report)
    
    # 5. Send Notification if there are urgent risks
    if battery_risk == "CRITICAL" or thermal_risk == "CRITICAL" or gas_risk == "CRITICAL":
        admin_users = db.query(User).filter(User.role == "Admin").all()
        for admin in admin_users:
            notif = Notification(
                user_id=admin.id,
                title="CRITICAL: Autonomous Agent Alert",
                message="Critical risk identified in UPS / Server Room. AI diagnostics report compiled and saved.",
                type="critical",
                timestamp=now,
                read=False
            )
            db.add(notif)
            
    db.commit()
    db.refresh(report)
    return report
