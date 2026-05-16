from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

class CrisisReport(BaseModel):
    source: str  # e.g., 'social_media', 'emergency_call', 'sensor'
    location: str # e.g., 'G-10', 'F-8'
    description: str
    confidence: float
    timestamp: Optional[datetime] = None

class ActionPlan(BaseModel):
    action_type: str # e.g., 'dispatch', 'reroute', 'alert'
    target: str
    details: str

class CrisisState(BaseModel):
    id: str
    type: str # e.g., 'flood', 'accident', 'fire'
    location: str
    severity: str # e.g., 'low', 'medium', 'high', 'critical'
    status: str # e.g., 'investigating', 'active', 'resolved'
    affected_population: int
    reports: List[CrisisReport] = []
    actions_taken: List[ActionPlan] = []
    created_at: datetime
    updated_at: datetime

class Resource(BaseModel):
    id: str
    type: str # e.g., 'ambulance', 'police', 'fire_truck', 'rescue_team'
    location: str
    status: str # e.g., 'available', 'dispatched', 'maintenance'
    current_assignment: Optional[str] = None # crisis_id if dispatched
