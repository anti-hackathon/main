from fastapi import APIRouter
import random

router = APIRouter(prefix="/weather", tags=["weather"])

# Mock weather data generator
def get_mock_weather(location: str):
    # Simulated weather conditions that might cause crises
    conditions = ["Clear", "Heavy Rain", "Heatwave", "Thunderstorm", "Overcast"]
    
    # Force heavy rain or heatwave for specific locations to test Antigravity logic
    if location == "G-10":
        condition = "Heavy Rain"
        temperature = random.randint(20, 25)
        rainfall_mm = random.randint(50, 150)
    elif location == "I-8":
        condition = "Heatwave"
        temperature = random.randint(40, 48)
        rainfall_mm = 0
    else:
        condition = random.choice(conditions)
        temperature = random.randint(15, 38)
        rainfall_mm = random.randint(0, 20) if condition in ["Heavy Rain", "Thunderstorm"] else 0

    return {
        "location": location,
        "temperature_c": temperature,
        "condition": condition,
        "rainfall_mm": rainfall_mm,
        "wind_speed_kmh": random.randint(5, 60),
        "alerts": ["High risk of flooding"] if rainfall_mm > 50 else ["Extreme Heat Warning"] if temperature > 42 else []
    }

@router.get("/{location}")
def get_weather(location: str):
    """
    Returns simulated weather data for a given location.
    """
    return get_mock_weather(location)
