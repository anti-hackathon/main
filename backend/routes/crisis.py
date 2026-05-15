from fastapi import APIRouter, HTTPException
from models.crisis_model import CrisisReport
from services.simulation_engine import engine

router = APIRouter(prefix="/crisis", tags=["crisis"])

@router.post("/report")
def report_crisis(report: CrisisReport):
    """
    Endpoint for the Mobile App to report a crisis.
    This injects the signal into the Simulation Engine.
    """
    result = engine.report_crisis(report)
    return result

@router.get("/state")
def get_system_state():
    """
    Returns the full state of the simulation engine (crises, resources, traffic).
    Useful for the Dashboard.
    """
    return engine.get_state()

@router.post("/{crisis_id}/dispatch")
def dispatch_resource(crisis_id: str, resource_type: str):
    """
    Endpoint for the Antigravity Agent to dispatch resources.
    """
    result = engine.dispatch_resource(crisis_id, resource_type)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result