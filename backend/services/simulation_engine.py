import uuid
from datetime import datetime
from models.crisis_model import CrisisState, Resource, CrisisReport

class SimulationEngine:
    def __init__(self):
        # Simulated databases
        self.crises = {} # dict of crisis_id: CrisisState
        self.resources = {
            "amb-1": Resource(id="amb-1", type="ambulance", location="HQ", status="available"),
            "amb-2": Resource(id="amb-2", type="ambulance", location="HQ", status="available"),
            "pol-1": Resource(id="pol-1", type="police", location="HQ", status="available"),
            "pol-2": Resource(id="pol-2", type="police", location="HQ", status="available"),
            "fire-1": Resource(id="fire-1", type="fire_truck", location="HQ", status="available"),
            "res-1": Resource(id="res-1", type="rescue_team", location="HQ", status="available")
        }
        
        # Simulated city state
        self.traffic_levels = {
            "G-10": "normal",
            "F-8": "normal",
            "I-8": "normal",
            "Blue Area": "normal"
        }

    def report_crisis(self, report: CrisisReport) -> dict:
        # Simple heuristic to determine if it belongs to an existing active crisis
        # For simplicity, if there's an active crisis in the same location, append it
        existing_crisis = next((c for c in self.crises.values() if c.location == report.location and c.status != "resolved"), None)
        
        if existing_crisis:
            existing_crisis.reports.append(report)
            existing_crisis.updated_at = datetime.now()
            # If traffic was normal, mock an escalation
            if self.traffic_levels.get(report.location, "normal") == "normal":
                self.traffic_levels[report.location] = "moderate"
            return {"status": "updated", "crisis_id": existing_crisis.id}
        else:
            # Create a new crisis state
            crisis_id = f"CR-{uuid.uuid4().hex[:6].upper()}"
            new_crisis = CrisisState(
                id=crisis_id,
                type="unknown", # Will be classified by the Agent later
                location=report.location,
                severity="unknown",
                status="investigating",
                affected_population=0,
                reports=[report],
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            self.crises[crisis_id] = new_crisis
            # Traffic increases at new incident
            self.traffic_levels[report.location] = "severe"
            return {"status": "created", "crisis_id": crisis_id}

    def dispatch_resource(self, crisis_id: str, resource_type: str) -> dict:
        crisis = self.crises.get(crisis_id)
        if not crisis:
            return {"error": "Crisis not found"}
            
        # Find an available resource of the given type
        available_resource = next((r for r in self.resources.values() if r.type == resource_type and r.status == "available"), None)
        
        if available_resource:
            available_resource.status = "dispatched"
            available_resource.current_assignment = crisis_id
            available_resource.location = crisis.location
            return {"status": "success", "resource_id": available_resource.id, "message": f"Dispatched {resource_type} to {crisis.location}"}
        else:
            return {"status": "failed", "error": f"No available {resource_type}"}

    def reroute_traffic(self, location: str) -> dict:
        if location in self.traffic_levels:
            # Rerouting effectively clears local congestion
            self.traffic_levels[location] = "normal"
            return {"status": "success", "message": f"Traffic rerouted around {location}. Congestion cleared."}
        return {"error": "Location not found"}

    def get_state(self):
        return {
            "crises": [c.dict() for c in self.crises.values()],
            "resources": [r.dict() for r in self.resources.values()],
            "traffic": self.traffic_levels
        }

# Global instance to be used across routes
engine = SimulationEngine()
