from fastapi import APIRouter
from services.simulation_engine import engine
import random

router = APIRouter(prefix="/traffic", tags=["traffic"])

@router.get("/{location}")
def get_traffic(location: str):
    """
    Returns simulated traffic data for a given location.
    Reads from the global SimulationEngine state to reflect rerouting.
    """
    # Get congestion level from engine state or default to normal
    congestion = engine.traffic_levels.get(location, "normal")
    
    if congestion == "severe":
        avg_speed = random.randint(0, 10)
        delay_mins = random.randint(30, 120)
    elif congestion == "moderate":
        avg_speed = random.randint(15, 30)
        delay_mins = random.randint(10, 25)
    else:
        avg_speed = random.randint(40, 70)
        delay_mins = random.randint(0, 5)

    return {
        "location": location,
        "congestion_level": congestion,
        "average_speed_kmh": avg_speed,
        "estimated_delay_mins": delay_mins
    }

@router.post("/{location}/reroute")
def reroute_traffic(location: str):
    """
    Action endpoint to simulate rerouting traffic around a location.
    """
    return engine.reroute_traffic(location)
