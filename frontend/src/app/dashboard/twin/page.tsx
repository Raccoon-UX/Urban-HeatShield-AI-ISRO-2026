"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useDashboardState } from "../layout";
import { 
  Sliders, 
  Trees, 
  Sparkles, 
  HelpCircle, 
  ArrowRight,
  TrendingDown,
  DollarSign,
  Leaf,
  Thermometer,
  Layers
} from "lucide-react";
import { motion } from "framer-motion";

function DigitalTwinContent() {
  const searchParams = useSearchParams();
  const { role } = useDashboardState();

  // Get initial values from query parameters if available
  const initialBlockId = searchParams.get("block") || "block-3-3";
  const initialTemp = parseFloat(searchParams.get("temp") || "46.8");

  // State for user configuration sliders
  const [treeCover, setTreeCover] = useState(12); // in %
  const [roofAlbedo, setRoofAlbedo] = useState(0.15); // albedo factor
  const [pavementAlbedo, setPavementAlbedo] = useState(0.08); // albedo factor
  const [greenRoofs, setGreenRoofs] = useState(0); // in %
  const [waterFeatures, setWaterFeatures] = useState(2); // in %

  // Simulated metrics recalculated based on sliders
  const [simulatedTemp, setSimulatedTemp] = useState(initialTemp);
  const [cost, setCost] = useState(0);
  const [co2Saved, setCo2Saved] = useState(0);
  const [energySaved, setEnergySaved] = useState(0);

  // Recalculator physics-informed model
  useEffect(() => {
    // Basic thermal budget simulation
    // - Tree canopy cools via evapotranspiration and shade: ~0.11°C drop per 1% increase
    const treeCooling = (treeCover - 12) * 0.11;
    // - High albedo roofs cool via reflectivity: ~5.5°C drop going from 0.15 to 0.85 albedo
    const roofCooling = (roofAlbedo - 0.15) * 5.8;
    // - High albedo pavement cools via reflectivity: ~3.8°C drop going from 0.08 to 0.45 albedo
    const pavementCooling = (pavementAlbedo - 0.08) * 3.4;
    // - Green roofs provide transpiration and insulation: ~0.06°C drop per 1% increase
    const greenRoofCooling = greenRoofs * 0.06;
    // - Water features act as heat sinks: ~0.25°C drop per 1% increase
    const waterCooling = (waterFeatures - 2) * 0.22;

    const totalCooling = treeCooling + roofCooling + pavementCooling + greenRoofCooling + waterCooling;
    
    // Calculate final simulated temperature
    const finalTemp = Math.max(24.5, initialTemp - totalCooling);
    setSimulatedTemp(parseFloat(finalTemp.toFixed(1)));

    // Budget Calculations (Mock numbers based on typical urban construction costs)
    // Cool Roof: $10 per sqm, Green Roof: $90 per sqm, Tree: $250 each (approx $15k per 1% canopy coverage), Reflective pavement: $25 per sqm, Water: $120k per 1%
    const sqMetersBlock = 250000; // 250,000 sqm sector
    const treeCost = (treeCover - 12) * 15000;
    const roofCost = (roofAlbedo - 0.15) * sqMetersBlock * 0.3 * 8; // 30% area is roof
    const pavementCost = (pavementAlbedo - 0.08) * sqMetersBlock * 0.25 * 18; // 25% area is pavement
    const greenRoofCost = greenRoofs * sqMetersBlock * 0.15 * 85; // 15% roof area converted
    const waterCost = (waterFeatures - 2) * 95000;

    const totalCost = Math.max(0, treeCost + roofCost + pavementCost + greenRoofCost + waterCost);
    setCost(Math.round(totalCost));

    // CO2 Sequestration (Trees capture ~22kg CO2/year each. 1% cover = ~300 trees = 6.6 tons CO2/year)
    const carbonSaved = (treeCover - 12) * 6.8 + (greenRoofs * 1.5);
    setCo2Saved(parseFloat(Math.max(0, carbonSaved).toFixed(1)));

    // Energy Savings (Air conditioning drop: ~3.5% energy bill drop per 1°C ambient cooling)
    const tempDiff = initialTemp - finalTemp;
    const coolingEnergySaved = Math.max(0, tempDiff * 3.8); // % savings
    setEnergySaved(parseFloat(coolingEnergySaved.toFixed(1)));

  }, [treeCover, roofAlbedo, pavementAlbedo, greenRoofs, waterFeatures, initialTemp]);

  const tempDrop = parseFloat((initialTemp - simulatedTemp).toFixed(1));
  const riskIndexBefore = initialTemp > 45 ? "EXTREME" : initialTemp > 40 ? "CRITICAL" : "HIGH";
  const riskIndexAfter = simulatedTemp > 42 ? "CRITICAL" : simulatedTemp > 37 ? "HIGH" : simulatedTemp > 32 ? "MODERATE" : "LOW";

  // Reset sliders to default values
  const handleReset = () => {
    setTreeCover(12);
    setRoofAlbedo(0.15);
    setPavementAlbedo(0.08);
    setGreenRoofs(0);
    setWaterFeatures(2);
  };

  return (
    <div className="flex-1 flex flex-col space-y-6" id="digital-twin-page">
      {/* Title Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-wider font-mono text-transparent bg-clip-text bg-gradient-to-r from-white to-primary">
            URBAN DIGITAL TWIN SANDBOX
          </h2>
          <p className="text-xs text-muted-foreground font-mono uppercase mt-1">
            ACTIVE BLOCK SECTOR ID: {initialBlockId.toUpperCase()} | TARGET TEMP: {initialTemp}°C
          </p>
        </div>
        <button
          onClick={handleReset}
          className="px-3 py-1 text-[10px] font-mono border border-border/30 hover:border-primary hover:text-white rounded cursor-pointer transition-colors"
        >
          RESET MODEL
        </button>
      </div>

      {/* Grid Layout: Config Sliders on Left, Interactive Simulation on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* CONFIG SLIDERS (Left side) */}
        <div className="glass-panel p-6 rounded-lg lg:col-span-1 flex flex-col justify-between space-y-6">
          <div>
            <div className="pb-3 border-b border-border/20 mb-4 flex justify-between items-center">
              <span className="font-mono text-xs font-bold text-foreground tracking-widest flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-primary" />
                SIMULATION VARIABLES
              </span>
              <span className="text-[9px] font-mono text-muted uppercase">REAL-TIME PHYSICS</span>
            </div>

            <div className="space-y-5 font-mono text-xs">
              {/* Tree canopy */}
              <div className="space-y-2">
                <div className="flex justify-between text-foreground">
                  <span className="flex items-center gap-1.5 text-muted">
                    <Trees className="w-4 h-4 text-secondary" />
                    Tree Canopy Coverage
                  </span>
                  <span className="font-bold text-secondary">{treeCover}%</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="60"
                  value={treeCover}
                  onChange={(e) => setTreeCover(parseInt(e.target.value))}
                  className="w-full h-1 bg-graphite rounded-lg appearance-none cursor-pointer accent-secondary"
                />
                <div className="flex justify-between text-[9px] text-muted">
                  <span>Current: 12%</span>
                  <span>Max: 60%</span>
                </div>
              </div>

              {/* Roof Albedo */}
              <div className="space-y-2">
                <div className="flex justify-between text-foreground">
                  <span className="flex items-center gap-1.5 text-muted">
                    <Layers className="w-4 h-4 text-primary" />
                    Roof Albedo coating
                  </span>
                  <span className="font-bold text-primary">{roofAlbedo} α</span>
                </div>
                <input
                  type="range"
                  min="0.15"
                  max="0.85"
                  step="0.05"
                  value={roofAlbedo}
                  onChange={(e) => setRoofAlbedo(parseFloat(e.target.value))}
                  className="w-full h-1 bg-graphite rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[9px] text-muted">
                  <span>Asphalt: 0.15 α</span>
                  <span>Cool Roof: 0.85 α</span>
                </div>
              </div>

              {/* Pavement Albedo */}
              <div className="space-y-2">
                <div className="flex justify-between text-foreground">
                  <span className="text-muted">Pavement Albedo</span>
                  <span className="font-bold text-primary">{pavementAlbedo} α</span>
                </div>
                <input
                  type="range"
                  min="0.08"
                  max="0.45"
                  step="0.01"
                  value={pavementAlbedo}
                  onChange={(e) => setPavementAlbedo(parseFloat(e.target.value))}
                  className="w-full h-1 bg-graphite rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[9px] text-muted">
                  <span>Blacktop: 0.08 α</span>
                  <span>Concrete: 0.45 α</span>
                </div>
              </div>

              {/* Green Roofs */}
              <div className="space-y-2">
                <div className="flex justify-between text-foreground">
                  <span className="text-muted">Green Roof Area Conversion</span>
                  <span className="font-bold text-secondary">{greenRoofs}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={greenRoofs}
                  onChange={(e) => setGreenRoofs(parseInt(e.target.value))}
                  className="w-full h-1 bg-graphite rounded-lg appearance-none cursor-pointer accent-secondary"
                />
                <div className="flex justify-between text-[9px] text-muted">
                  <span>Standard: 0%</span>
                  <span>Max Limit: 80%</span>
                </div>
              </div>

              {/* Water bodies */}
              <div className="space-y-2">
                <div className="flex justify-between text-foreground">
                  <span className="text-muted">Water Features & Ponds</span>
                  <span className="font-bold text-sky-blue">{waterFeatures}%</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="12"
                  value={waterFeatures}
                  onChange={(e) => setWaterFeatures(parseInt(e.target.value))}
                  className="w-full h-1 bg-graphite rounded-lg appearance-none cursor-pointer accent-sky-blue"
                />
                <div className="flex justify-between text-[9px] text-muted">
                  <span>Standard: 2%</span>
                  <span>Target: 12%</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Advisor Card */}
          <div className="p-3 bg-primary/5 border border-primary/20 rounded font-mono text-[9px] text-muted-foreground leading-relaxed">
            <div className="flex items-center gap-1 text-primary font-bold mb-1">
              <Sparkles className="w-3 h-3" />
              AI TWIN ADVISOR:
            </div>
            Applying cool roofs yields the fastest temperature drop for this building density layout. Adding trees lowers surrounding ambient temperature via shading by an additional 1.2°C.
          </div>
        </div>

        {/* COMPARISON RESULTS (Right side) */}
        <div className="glass-panel p-6 rounded-lg lg:col-span-2 flex flex-col justify-between space-y-6">
          {/* Comparison Title */}
          <div className="pb-3 border-b border-border/20 flex justify-between items-center">
            <span className="font-mono text-xs font-bold text-foreground tracking-widest uppercase">
              RECALCULATING THERMAL MODEL SHIELD
            </span>
            <span className="px-2 py-0.5 rounded bg-secondary/10 border border-secondary/30 text-secondary font-mono text-[9px] font-bold">
              LIVE SHIELDING
            </span>
          </div>

          {/* Core Temperature Shift Meter */}
          <div className="grid grid-cols-2 gap-4 items-center bg-card border border-border/40 p-6 rounded-lg text-center font-mono">
            {/* Before */}
            <div className="border-r border-border/20">
              <div className="text-[10px] text-muted uppercase">INITIAL SURFACE TEMP</div>
              <div className="text-4xl font-bold text-heat-red mt-2">{initialTemp}°C</div>
              <span className="inline-block mt-2 px-2 py-0.5 rounded bg-heat-red/10 border border-heat-red/30 text-heat-red text-[9px] font-bold">
                {riskIndexBefore} RISK
              </span>
            </div>

            {/* After */}
            <div>
              <div className="text-[10px] text-muted uppercase">SIMULATED SURFACE TEMP</div>
              <div className="text-4xl font-bold text-secondary mt-2 glow-text-green">{simulatedTemp}°C</div>
              <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-bold ${
                riskIndexAfter === "CRITICAL"
                  ? "bg-heat-red/10 border border-heat-red/30 text-heat-red"
                  : riskIndexAfter === "HIGH"
                  ? "bg-accent/10 border border-accent/30 text-accent"
                  : riskIndexAfter === "MODERATE"
                  ? "bg-primary/10 border border-primary/30 text-primary"
                  : "bg-secondary/10 border border-secondary/30 text-secondary"
              }`}>
                {riskIndexAfter} RISK
              </span>
            </div>

            {/* Float Overlay Temperature Change indicator */}
            {tempDrop > 0 && (
              <div className="col-span-2 mt-4 pt-4 border-t border-border/20 flex justify-center items-center gap-2">
                <TrendingDown className="w-5 h-5 text-secondary animate-bounce" />
                <span className="text-xs text-foreground">
                  COOLING EFFECT DETECTED: <span className="text-secondary font-bold">-{tempDrop}°C REDUCTION</span>
                </span>
              </div>
            )}
          </div>

          {/* SIMULATED IMPACT CARDS (Billion-dollar dashboard detail) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            {/* Cost card */}
            <div className="glass-card p-4 rounded border border-border/40 space-y-1">
              <div className="flex justify-between items-center text-muted">
                <span>EST BUDGET</span>
                <DollarSign className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="text-lg font-bold text-foreground">
                {cost === 0 ? "STABLE" : `$${(cost / 1000).toFixed(0)}k`}
              </div>
              <div className="text-[8px] text-muted-foreground uppercase">
                {role === "government" ? "CAPEX APPROVAL REQ" : "MOCK DEVELOPMENT COST"}
              </div>
            </div>

            {/* CO2 Saved card */}
            <div className="glass-card p-4 rounded border border-border/40 space-y-1">
              <div className="flex justify-between items-center text-muted">
                <span>CARBON DECR.</span>
                <Leaf className="w-3.5 h-3.5 text-secondary" />
              </div>
              <div className="text-lg font-bold text-secondary">
                +{co2Saved} tons
              </div>
              <div className="text-[8px] text-muted-foreground uppercase">
                CO2 SEQUEST. / YEAR
              </div>
            </div>

            {/* Energy Savings card */}
            <div className="glass-card p-4 rounded border border-border/40 space-y-1">
              <div className="flex justify-between items-center text-muted">
                <span>ENERGY SHIELD</span>
                <Thermometer className="w-3.5 h-3.5 text-accent" />
              </div>
              <div className="text-lg font-bold text-accent">
                -{energySaved}%
              </div>
              <div className="text-[8px] text-muted-foreground uppercase">
                AC POWER USAGE DROP
              </div>
            </div>
          </div>

          {/* Action to Cooling Simulator */}
          <div className="pt-4 border-t border-border/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono">
            <span className="text-muted text-center sm:text-left">
              Satisfied with the simulated parameters? Run comprehensive ROI scenarios.
            </span>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = `/dashboard/simulator?cost=${cost}&tempDrop=${tempDrop}&co2=${co2Saved}&energy=${energySaved}`;
                }
              }}
              className="px-6 py-2.5 rounded bg-primary text-primary-foreground font-bold tracking-wider hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              GENERATE ROADMAP
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function DigitalTwinPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center font-mono text-xs text-muted">
        LOADING DIGITAL TWIN MESH...
      </div>
    }>
      <DigitalTwinContent />
    </Suspense>
  );
}
