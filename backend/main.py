from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.crisis import router as crisis_router
from routes.weather import router as weather_router
from routes.traffic import router as traffic_router

app = FastAPI(title="CIRO Backend", description="Crisis Intelligence & Response Orchestrator API")

# Add CORS so React Native Mobile App can connect easily
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(crisis_router)
app.include_router(weather_router)
app.include_router(traffic_router)

@app.get("/")
def home():
    return {"message": "CIRO Backend is up and running. Use /docs to view the API documentation."}