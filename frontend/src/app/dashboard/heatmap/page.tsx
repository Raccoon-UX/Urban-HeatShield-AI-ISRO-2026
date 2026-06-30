"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useDashboardState } from "../layout";
import { 
  Layers, 
  Thermometer, 
  Trees, 
  Sparkles, 
  MapPin, 
  Info,
  Layers3,
  Search,
  SlidersHorizontal,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  Compass,
  Download,
  Eye,
  EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/global-client-container";

interface CityBlock {
  id: string;
  name: string;
  temperature: number;
  ndvi: number;
  albedo: number;
  populationDensity: number;
  material: string;
  waterBody: boolean;
  row: number;
  col: number;
}

export default function HeatmapPage() {
  const { role } = useDashboardState();
  const { showToast } = useToast();
  const [selectedLayer, setSelectedLayer] = useState<"lst" | "ndvi" | "albedo" | "pop">("lst");
  const [selectedBlock, setSelectedBlock] = useState<CityBlock | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // New GIS Controls State
  const [mapOpacity, setMapOpacity] = useState(80); // 0 to 100
  const [timelineIndex, setTimelineIndex] = useState(1); // 0: 08:00 AM, 1: 12:00 PM, 2: 04:00 PM, 3: 08:00 PM
  const [isPlaying, setIsPlaying] = useState(false);
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<CityBlock[]>([]);

  const times = ["08:00 AM", "12:00 PM", "04:00 PM", "08:00 PM"];

  // Play timeline simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setTimelineIndex((prev) => (prev < 3 ? prev + 1 : 0));
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Generate mock blocks data and recalculate based on timelineIndex (Daily solar path)
  const blocks: CityBlock[] = useMemo(() => {
    const arr: CityBlock[] = [];
    const materials = ["Asphalt", "Concrete", "Reflective Gravel", "Cool Roof Coat", "Clay Tiles"];
    
    // Day cycle temperature modifiers
    // 08:00 AM -> cool, 12:00 PM -> hot, 04:00 PM -> critical, 08:00 PM -> warm
    const timeModifiers = [-4.5, 0.0, 3.2, -2.1];
    const activeMod = timeModifiers[timelineIndex];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const id = `block-${r}-${c}`;
        const distFromCenter = Math.sqrt(Math.pow(r - 3.5, 2) + Math.pow(c - 3.5, 2));
        
        const isWater = (r === 2 && c >= 4 && c <= 7) || (r === 3 && c === 4);
        
        // Apply daily solar heating modifier to temperature
        const baseTemp = isWater 
          ? 26.4 + Math.random() * 1.5 
          : 44.8 - (distFromCenter * 2.8) + (Math.random() * 2.0);
        
        const temperature = baseTemp + (isWater ? activeMod * 0.3 : activeMod);
        
        const ndvi = isWater 
          ? 0.1 
          : Math.max(0.05, 0.65 - (baseTemp - 30) * 0.02 + Math.random() * 0.1);
        
        const albedo = isWater 
          ? 0.08 
          : Math.max(0.05, 0.45 - (baseTemp - 30) * 0.015 + Math.random() * 0.15);
        
        const popDensity = Math.floor(isWater ? 0 : 25000 * (1.2 - distFromCenter / 6) + Math.random() * 2000);

        let name = `Sector-${r}${c}`;
        if (distFromCenter < 1.5) name = `Downtown Block ${r + 1}`;
        else if (isWater) name = `Yarmuna River Bend ${c - 3}`;
        else if (r < 3 && c < 3) name = `Northview Plaza ${r + c}`;
        else if (r > 5 && c > 5) name = `Eastwood Suburb ${r - c}`;
        else if (r > 5 && c < 3) name = `Lakeside Factory ${r}`;
        else if (r < 3 && c > 5) name = `Southpark Residential`;

        const material = isWater 
          ? "Water" 
          : temperature > 44 
          ? "Asphalt" 
          : temperature > 38 
          ? "Concrete" 
          : materials[Math.floor(Math.random() * materials.length)];

        arr.push({
          id,
          name,
          temperature: parseFloat(temperature.toFixed(1)),
          ndvi: parseFloat(Math.min(1, Math.max(0, ndvi)).toFixed(2)),
          albedo: parseFloat(Math.min(1, Math.max(0, albedo)).toFixed(2)),
          populationDensity: Math.max(0, popDensity),
          material,
          waterBody: isWater,
          row: r,
          col: c
        });
      }
    }
    return arr;
  }, [timelineIndex]);

  // Keep selected block in sync with updated data
  const updatedSelectedBlock = useMemo(() => {
    if (!selectedBlock) return null;
    return blocks.find((b) => b.id === selectedBlock.id) || null;
  }, [blocks, selectedBlock]);

  // Filter blocks based on search
  const filteredBlocks = useMemo(() => {
    if (!searchQuery) return blocks;
    return blocks.filter((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [blocks, searchQuery]);

  // Color mapper based on selected layer values
  const getBlockColor = (block: CityBlock) => {
    if (block.waterBody) return `rgba(14, 165, 233, ${mapOpacity / 100})`;

    if (selectedLayer === "lst") {
      const ratio = (block.temperature - 30) / 20; // 30C to 50C
      if (ratio > 0.8) return `rgba(239, 68, 68, ${mapOpacity / 100})`; // Red
      if (ratio > 0.5) return `rgba(249, 115, 22, ${mapOpacity / 100})`; // Orange
      if (ratio > 0.2) return `rgba(245, 158, 11, ${mapOpacity / 100})`; // Yellow
      return `rgba(16, 185, 129, ${mapOpacity / 100})`; // Green (Cool)
    }

    if (selectedLayer === "ndvi") {
      if (block.ndvi > 0.5) return `rgba(16, 185, 129, ${mapOpacity / 100})`;
      if (block.ndvi > 0.3) return `rgba(52, 211, 153, ${mapOpacity / 100})`;
      if (block.ndvi > 0.15) return `rgba(245, 158, 11, ${mapOpacity / 100})`;
      return `rgba(239, 68, 68, ${mapOpacity / 100})`;
    }

    if (selectedLayer === "albedo") {
      if (block.albedo > 0.4) return `rgba(6, 182, 212, ${mapOpacity / 100})`;
      if (block.albedo > 0.25) return `rgba(14, 165, 233, ${mapOpacity / 100})`;
      if (block.albedo > 0.15) return `rgba(99, 102, 241, ${mapOpacity / 100})`;
      return `rgba(59, 130, 246, ${mapOpacity / 100})`;
    }

    const popRatio = block.populationDensity / 30000;
    if (popRatio > 0.75) return `rgba(220, 38, 38, ${mapOpacity / 100})`;
    if (popRatio > 0.45) return `rgba(249, 115, 22, ${mapOpacity / 100})`;
    if (popRatio > 0.2) return `rgba(245, 158, 11, ${mapOpacity / 100})`;
    return `rgba(16, 185, 129, ${mapOpacity / 100})`;
  };

  // Click handler on map cells (Measure tool logic vs selection logic)
  const handleBlockClick = (block: CityBlock) => {
    if (measureMode) {
      if (measurePoints.length === 2) {
        setMeasurePoints([block]);
      } else {
        const nextPoints = [...measurePoints, block];
        setMeasurePoints(nextPoints);
        if (nextPoints.length === 2) {
          showToast("Distance & temperature gradient calculated!", "success");
        }
      }
    } else {
      setSelectedBlock(block);
    }
  };

  // Measure calculation values
  const measureResults = useMemo(() => {
    if (measurePoints.length !== 2) return null;
    const p1 = measurePoints[0];
    const p2 = measurePoints[1];
    
    // Grid distance: Row and Col difference (Assume 400m per grid cell)
    const cellDistanceKM = 0.4;
    const gridDist = Math.sqrt(Math.pow(p1.row - p2.row, 2) + Math.pow(p1.col - p2.col, 2));
    const distance = parseFloat((gridDist * cellDistanceKM).toFixed(2));
    const tempDelta = parseFloat(Math.abs(p1.temperature - p2.temperature).toFixed(1));

    return { distance, tempDelta };
  }, [measurePoints]);

  const activeLayerLabel = {
    lst: "Land Surface Temperature (°C)",
    ndvi: "NDVI (Vegetation Index)",
    albedo: "Albedo (Surface Reflectivity)",
    pop: "Population Density (pop/km²)"
  }[selectedLayer];

  // Download map details as CSV/Text summary report
  const downloadMapData = () => {
    let content = "HEATSHIELD AI - SATELLITE TELEMETRY SECTOR REPORT\n";
    content += `TIMELINE STATUS: ${times[timelineIndex]}\n`;
    content += `ACTIVE OVERLAY LAYER: ${selectedLayer.toUpperCase()}\n`;
    content += "==================================================\n\n";
    content += "BLOCK_ID,SECTOR_NAME,TEMP_C,NDVI,ALBEDO,POP_DENSITY,SURFACE_MATERIAL\n";
    
    blocks.forEach((b) => {
      content += `${b.id},${b.name},${b.temperature},${b.ndvi},${b.albedo},${b.populationDensity},${b.material}\n`;
    });

    const fileBlob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(fileBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `HEATSHIELD-Satellite-Telemetry-Sector-Report-${times[timelineIndex].replace(":", "")}.txt`;
    link.click();
    showToast("Map dataset report exported successfully!", "success");
  };

  return (
    <div className="flex-1 flex flex-col space-y-6" id="heatmap-page">
      {/* Title Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-wider font-mono text-transparent bg-clip-text bg-gradient-to-r from-foreground to-primary">
            AI-POWERED SATELLITE GIS HEATMAP
          </h2>
          <p className="text-xs text-muted-foreground font-mono uppercase mt-1">
            L7 TELEMETRY BAND CLASSIFIER | SENSORS STABLE
          </p>
        </div>

        {/* Measure Tool & Download Toggles */}
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <button
            onClick={() => {
              setMeasureMode(!measureMode);
              setMeasurePoints([]);
              showToast(measureMode ? "Selection mode active" : "Measure tool active. Click two sectors.", "info");
            }}
            className={`px-3 py-1.5 rounded border transition-colors cursor-pointer ${
              measureMode ? "border-primary text-primary bg-primary/5" : "border-border/40 hover:border-primary text-muted hover:text-foreground"
            }`}
          >
            <Compass className="w-3.5 h-3.5 inline mr-1" />
            {measureMode ? "EXIT MEASURE" : "MEASURE DISTANCE"}
          </button>
          
          <button
            onClick={downloadMapData}
            className="px-3 py-1.5 rounded border border-border/40 hover:border-primary text-muted hover:text-foreground cursor-pointer transition-colors flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            EXPORT DATA
          </button>
        </div>
      </div>

      {/* Layer selector & Opacity slider bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-border/20 rounded-lg glass-panel">
        <div className="flex flex-wrap items-center gap-3">
          <Layers className="w-5 h-5 text-primary" />
          <span className="font-mono text-xs font-bold text-foreground tracking-widest uppercase">
            Map Overlay:
          </span>
          <div className="flex bg-card border border-border/40 rounded-lg p-0.5 text-xs font-mono">
            {["lst", "ndvi", "albedo", "pop"].map((layer) => (
              <button
                key={layer}
                onClick={() => setSelectedLayer(layer as any)}
                className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                  selectedLayer === layer ? "bg-primary text-black font-bold" : "text-muted hover:text-foreground"
                }`}
              >
                {layer === "lst" ? "Temp (LST)" : layer === "ndvi" ? "Vegetation" : layer === "albedo" ? "Albedo" : "Density"}
              </button>
            ))}
          </div>
        </div>

        {/* Opacity Slider */}
        <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground w-48 sm:w-64">
          <span>Opacity:</span>
          <input
            type="range"
            min="20"
            max="100"
            value={mapOpacity}
            onChange={(e) => setMapOpacity(parseInt(e.target.value))}
            className="flex-1 h-1 bg-graphite rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <span className="w-8 text-right text-foreground">{mapOpacity}%</span>
        </div>
      </div>

      {/* Main Map + Details Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* MAP CONTAINER */}
        <div className="glass-panel p-6 rounded-lg lg:col-span-3 flex flex-col justify-between min-h-[500px]">
          {/* Map Header HUD */}
          <div className="flex justify-between items-center pb-3 border-b border-border/20 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
              <span className="font-mono text-xs font-bold text-foreground tracking-widest">
                RESOLVED SATELLITE GRID
              </span>
            </div>
            <span className="text-[10px] text-muted font-mono uppercase">
              {times[timelineIndex]} | DIURNAL HEATING
            </span>
          </div>

          {/* Interactive Map Grid */}
          <div className="flex-1 flex items-center justify-center p-4 relative">
            {measureMode && (
              <div className="absolute top-2 left-2 z-10 p-2 bg-card border border-primary/20 rounded font-mono text-[9px] text-foreground">
                CLICK TWO BLOCKS TO MEASURE DISTANCE GRADIENTS
              </div>
            )}
            
            <div className="grid grid-cols-8 gap-2 w-full max-w-lg aspect-square border border-border/30 p-2 bg-[#040914] rounded">
              {filteredBlocks.map((block) => {
                const color = getBlockColor(block);
                const isSelected = !measureMode && updatedSelectedBlock?.id === block.id;
                const isPoint1 = measureMode && measurePoints[0]?.id === block.id;
                const isPoint2 = measureMode && measurePoints[1]?.id === block.id;

                return (
                  <motion.button
                    key={block.id}
                    onClick={() => handleBlockClick(block)}
                    className="relative w-full h-full rounded transition-all cursor-pointer group flex items-center justify-center"
                    style={{ backgroundColor: color }}
                    whileHover={{ scale: 1.08, zIndex: 10 }}
                    animate={{ 
                      boxShadow: isSelected || isPoint1 || isPoint2 ? "0 0 15px rgba(255,255,255,0.7)" : "none",
                      border: isSelected || isPoint1 || isPoint2 ? "2px solid #ffffff" : "1px solid rgba(255,255,255,0.1)"
                    }}
                  >
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity rounded" />
                    
                    {selectedLayer === "lst" && !block.waterBody && (
                      <span className="text-[8px] font-mono text-black font-bold opacity-75 hidden sm:inline">
                        {Math.round(block.temperature)}°
                      </span>
                    )}

                    {isPoint1 && <span className="text-[9px] font-mono text-black font-bold">P1</span>}
                    {isPoint2 && <span className="text-[9px] font-mono text-black font-bold">P2</span>}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Timeline Playback Slider Bar */}
          <div className="mt-4 pt-4 border-t border-border/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono">
            {/* Play/Pause controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2 rounded border cursor-pointer transition-colors ${
                  isPlaying ? "border-primary text-primary bg-primary/5" : "border-border/40 text-muted hover:text-foreground"
                }`}
                title="Play Solar diurnal heat timeline simulation"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <div className="flex bg-card border border-border/30 rounded p-0.5">
                {times.map((t, idx) => (
                  <button
                    key={t}
                    onClick={() => { setTimelineIndex(idx); setIsPlaying(false); }}
                    className={`px-3 py-1 rounded transition-colors text-[9px] cursor-pointer ${
                      timelineIndex === idx ? "bg-primary text-primary-foreground font-bold" : "text-muted hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Scale Legends */}
            <div className="flex items-center gap-3 text-[10px]">
              <span className="text-muted">MIN</span>
              <div className="w-36 h-3 rounded overflow-hidden border border-border/20 flex">
                <div className="flex-1 bg-secondary" />
                <div className="flex-1 bg-thermal-yellow" />
                <div className="flex-1 bg-accent" />
                <div className="flex-1 bg-heat-red" />
              </div>
              <span className="text-muted">MAX</span>
            </div>
          </div>
        </div>

        {/* REGION ANALYSIS & MEASURE PANEL */}
        <div className="glass-panel p-6 rounded-lg flex flex-col justify-between lg:col-span-1">
          {measureMode ? (
            /* Measure Mode readout panel */
            <div className="space-y-6 font-mono text-xs">
              <div className="pb-3 border-b border-border/20">
                <h3 className="font-bold text-white uppercase tracking-wider">
                  MEASUREMENT MODE
                </h3>
                <span className="text-[9px] text-muted uppercase mt-1 block">Telemetry Ruler</span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted">Point 1 (P1):</span>
                  <span className="text-white font-bold">{measurePoints[0]?.name || "Select sector"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Point 2 (P2):</span>
                  <span className="text-white font-bold">{measurePoints[1]?.name || "Select sector"}</span>
                </div>

                {measureResults ? (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded space-y-3 mt-4 text-[10px]">
                    <div className="flex justify-between items-center">
                      <span className="text-muted">Simulated Distance:</span>
                      <span className="text-white font-bold text-xs">{measureResults.distance} km</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted">Temperature Delta:</span>
                      <span className="text-accent font-bold text-xs">+{measureResults.tempDelta}°C</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-normal mt-2 border-t border-border/20 pt-2">
                      Thermal gradient rates are computed based on density of impervious surfaces between points.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-border/40 rounded text-center text-[10px] text-muted">
                    Click two block nodes on the grid to calculate local thermal variance and distance.
                  </div>
                )}
              </div>
            </div>
          ) : updatedSelectedBlock ? (
            /* Standard selected block details */
            <div className="space-y-6">
              <div className="pb-3 border-b border-border/20 flex justify-between items-start">
                <div>
                  <h3 className="font-mono text-sm font-bold text-foreground uppercase tracking-wider">
                    {updatedSelectedBlock.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono text-muted">
                    <MapPin className="w-3 h-3 text-primary" />
                    GRID: R{updatedSelectedBlock.row + 1}, C{updatedSelectedBlock.col + 1}
                  </div>
                </div>
                {updatedSelectedBlock.waterBody && (
                  <span className="px-2 py-0.5 rounded bg-sky-blue/10 border border-sky-blue/30 text-sky-blue font-mono text-[9px] font-bold">
                    HYDRO
                  </span>
                )}
              </div>

              {/* Data readouts */}
              <div className="space-y-4 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4 text-accent" />
                    SURFACE TEMP:
                  </span>
                  <span className={`text-lg font-bold ${
                    updatedSelectedBlock.temperature > 44 
                      ? "text-heat-red glow-text-orange" 
                      : updatedSelectedBlock.temperature > 37 
                      ? "text-accent" 
                      : "text-secondary"
                  }`}>
                    {updatedSelectedBlock.temperature}°C
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted flex items-center gap-1.5">
                    <Trees className="w-4 h-4 text-secondary" />
                    VEGETATION (NDVI):
                  </span>
                  <span className={`font-bold ${updatedSelectedBlock.ndvi > 0.4 ? "text-secondary" : "text-heat-red"}`}>
                    {updatedSelectedBlock.ndvi}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted flex items-center gap-1.5">
                    <Layers3 className="w-4 h-4 text-primary" />
                    ALBEDO:
                  </span>
                  <span className="font-bold text-foreground">
                    {updatedSelectedBlock.albedo}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted">POP DENSITY:</span>
                  <span className="font-bold text-foreground">
                    {updatedSelectedBlock.populationDensity.toLocaleString()} pop/km²
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted">DOMINANT SURFACE:</span>
                  <span className="font-bold text-foreground uppercase text-[10px]">
                    {updatedSelectedBlock.material}
                  </span>
                </div>
              </div>

              {/* AI suggestion box */}
              <div className="p-3 bg-primary/5 border border-primary/20 rounded font-mono text-[10px] space-y-2 text-muted-foreground leading-relaxed">
                <div className="flex items-center gap-1.5 text-primary font-bold">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  AI MITIGATION REC:
                </div>
                {updatedSelectedBlock.temperature > 44 ? (
                  <p>
                    CRITICAL HOTSPOT: Surface contains heavy {updatedSelectedBlock.material}. Recommend immediate retrofitting with cool roof coatings (Albedo &gt; 0.65) and 35% urban canopy reforestation.
                  </p>
                ) : updatedSelectedBlock.ndvi < 0.2 ? (
                  <p>
                    VEGETATION DEFICIT: Low NDVI detected. Recommend greening corridors or pocket parks to increase transpiration cooling by up to 2.4°C.
                  </p>
                ) : (
                  <p>
                    THERMALLY STABLE: High vegetation keeps local temperature stable. Maintain current park coverage and enforce cooling codes for future developments.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3 font-mono text-muted">
              <Info className="w-8 h-8 text-primary animate-pulse" />
              <div className="text-xs font-bold text-foreground tracking-widest">
                NO SECTOR SELECTED
              </div>
              <p className="text-[10px] max-w-[200px] leading-relaxed">
                Click any sector block in the satellite grid to perform real-time thermal analysis and view AI recommendations.
              </p>
            </div>
          )}

          {/* Action button to Sandbox */}
          {updatedSelectedBlock && !measureMode && (
            <div className="pt-6 border-t border-border/20">
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.href = `/dashboard/twin?block=${updatedSelectedBlock.id}&temp=${updatedSelectedBlock.temperature}`;
                  }
                }}
                className="w-full py-2.5 rounded bg-primary text-primary-foreground font-mono text-xs font-bold tracking-wider text-center hover:bg-primary/90 transition-all cursor-pointer shadow-lg"
              >
                SIMULATE INTERVENTIONS
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
