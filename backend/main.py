from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import pandas as pd
from typing import List, Optional

app = FastAPI(title="HEATSHIELD AI - Geospatial and Climate Science API", version="1.0.0")

# Enable CORS for Next.js frontend local connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response validation
class SimulationRequest(BaseModel):
    block_id: str
    initial_temp: float
    tree_cover_percent: float
    roof_albedo: float
    pavement_albedo: float
    green_roofs_percent: float
    water_features_percent: float

class SimulationResponse(BaseModel):
    block_id: str
    initial_temp: float
    simulated_temp: float
    temperature_drop: float
    projected_cost: float
    carbon_sequestered_tons: float
    energy_savings_percent: float
    risk_level_before: str
    risk_level_after: str

class PredictionRequest(BaseModel):
    historical_temps: List[float]
    projected_years: int

class PredictionResponse(BaseModel):
    years: List[str]
    predicted_temps: List[float]
    confidence_scores: List[float]

@app.get("/")
def read_root():
    return {"status": "ONLINE", "message": "HEATSHIELD AI backend compiler running successfully."}

@app.post("/api/simulate", response_model=SimulationResponse)
def simulate_mitigation(req: SimulationRequest):
    try:
        # Physics-informed localized thermal budget model calculations
        # - Tree canopy cools via evapotranspiration and shade: ~0.11°C drop per 1% increase
        tree_cooling = (req.tree_cover_percent - 12.0) * 0.11
        # - High albedo roofs cool via reflectivity: ~5.8°C drop going from 0.15 to 0.85 albedo
        roof_cooling = (req.roof_albedo - 0.15) * 5.8
        # - High albedo pavement cools via reflectivity: ~3.4°C drop going from 0.08 to 0.45 albedo
        pavement_cooling = (req.pavement_albedo - 0.08) * 3.4
        # - Green roofs provide transpiration and insulation: ~0.06°C drop per 1% increase
        green_roof_cooling = req.green_roofs_percent * 0.06
        # - Water features act as heat sinks: ~0.22°C drop per 1% increase
        water_cooling = (req.water_features_percent - 2.0) * 0.22

        total_cooling = tree_cooling + roof_cooling + pavement_cooling + green_roof_cooling + water_cooling
        
        # Calculate final simulated temperature
        final_temp = max(24.5, req.initial_temp - total_cooling)
        temp_drop = req.initial_temp - final_temp

        # Budget Calculations
        sq_meters_block = 250000.0 # 250,000 sqm sector
        tree_cost = max(0.0, (req.tree_cover_percent - 12.0) * 15000.0)
        roof_cost = max(0.0, (req.roof_albedo - 0.15) * sq_meters_block * 0.3 * 8.0)
        pavement_cost = max(0.0, (req.pavement_albedo - 0.08) * sq_meters_block * 0.25 * 18.0)
        green_roof_cost = req.green_roofs_percent * sq_meters_block * 0.15 * 85.0
        water_cost = max(0.0, (req.water_features_percent - 2.0) * 95000.0)

        total_cost = tree_cost + roof_cost + pavement_cost + green_roof_cost + water_cost

        # Carbon Sequestration
        carbon_saved = max(0.0, (req.tree_cover_percent - 12.0) * 6.8 + (req.green_roofs_percent * 1.5))

        # Energy Savings
        cooling_energy_saved = max(0.0, temp_drop * 3.8)

        # Risk Classification
        risk_before = "EXTREME" if req.initial_temp > 45 else "CRITICAL" if req.initial_temp > 40 else "HIGH"
        risk_after = "CRITICAL" if final_temp > 42 else "HIGH" if final_temp > 37 else "MODERATE" if final_temp > 32 else "LOW"

        return SimulationResponse(
            block_id=req.block_id,
            initial_temp=round(req.initial_temp, 1),
            simulated_temp=round(final_temp, 1),
            temperature_drop=round(temp_drop, 1),
            projected_cost=round(total_cost, 2),
            carbon_sequestered_tons=round(carbon_saved, 1),
            energy_savings_percent=round(cooling_energy_saved, 1),
            risk_level_before=risk_before,
            risk_level_after=risk_after
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict", response_model=PredictionResponse)
def predict_temperatures(req: PredictionRequest):
    try:
        # Predict temperature trends using standard linear regression on history
        history_len = len(req.historical_temps)
        if history_len < 2:
            raise HTTPException(status_code=400, detail="Provide at least 2 historical temperature data points.")

        # X is time indices, Y is temperature
        X = np.arange(history_len).reshape(-1, 1)
        Y = np.array(req.historical_temps)

        # Fit a simple linear model
        slope, intercept = np.polyfit(X.flatten(), Y, 1)

        predicted_temps = []
        confidence_scores = []
        years = []

        current_year = 2026
        for i in range(1, req.projected_years + 1):
            next_idx = history_len + i - 1
            pred = slope * next_idx + intercept
            
            # Simulated variance and uncertainty growth over time
            uncertainty = 0.05 * i
            confidence = max(0.65, 0.98 - uncertainty)

            years.append(str(current_year + i * 2)) # every 2 years
            predicted_temps.append(float(round(pred, 1)))
            confidence_scores.append(float(round(confidence, 2)))

        return PredictionResponse(
            years=years,
            predicted_temps=predicted_temps,
            confidence_scores=confidence_scores
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
