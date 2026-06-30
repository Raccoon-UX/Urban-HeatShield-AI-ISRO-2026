"use client";

import React, { useState, useEffect } from "react";
import { useDashboardState } from "./layout";
import { 
  TrendingUp, 
  Thermometer, 
  Activity, 
  AlertTriangle, 
  Wind,
  Droplets,
  ChevronRight,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  X,
  RefreshCw,
  HelpCircle,
  Eye,
  EyeOff
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/global-client-container";

// Onboarding Step Interface
interface TourStep {
  target: string;
  title: string;
  content: string;
}

// Widget Layout configuration
interface Widget {
  id: string;
  title: string;
  visible: boolean;
  size: "half" | "full";
}

export default function DashboardOverview() {
  const { role } = useDashboardState();
  const { showToast } = useToast();

  // 1. Counter Animation State
  const [tempCount, setTempCount] = useState(0.0);
  const [hotspotCount, setHotspotCount] = useState(0);
  const [canopyCount, setCanopyCount] = useState(0.0);

  // 2. Widget configuration state
  const [customizing, setCustomizing] = useState(false);
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: "metrics-panel", title: "Metrics Overview Cards", visible: true, size: "full" },
    { id: "priority-matrix", title: "Neighborhood Priority Matrix", visible: true, size: "half" },
    { id: "ai-insights", title: "AI Model Insights", visible: true, size: "half" },
    { id: "weather-strip", title: "Meteorological Sensor Strip", visible: true, size: "full" }
  ]);

  // 3. Onboarding Tour State
  const [tourStep, setTourStep] = useState<number>(-1); // -1 means closed
  const tourSteps: TourStep[] = [
    {
      target: "hud-bar",
      title: "1. Global HUD controls",
      content: "Switch between Government, Researcher, and Citizen roles in the top bar to adjust dashboard insights."
    },
    {
      target: "metrics-cards",
      title: "2. Key Climate Indicators",
      content: "View average land surface temperature, active hotspots, and vegetation canopy index in real-time."
    },
    {
      target: "priority-matrix",
      title: "3. Heat Stress Priority Matrix",
      content: "Track which neighborhoods are critical and require immediate retrofitting intervention."
    },
    {
      target: "digital-twin-action",
      title: "4. Digital Twin Simulation",
      content: "Click 'Simulate' to enter the Sandbox and forecast thermal cooling effects instantly."
    }
  ];

  // Trigger onboarding tour on first mount (if not shown before)
  useEffect(() => {
    const tourShown = localStorage.getItem("heatshield-tour-completed");
    if (!tourShown) {
      setTourStep(0);
    }

    // Smooth counter ticks (Microanimation)
    const duration = 1200; // ms
    const stepTime = 30; // ms
    const steps = duration / stepTime;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setTempCount(41.8);
        setHotspotCount(14);
        setCanopyCount(16.4);
        clearInterval(interval);
      } else {
        const ratio = currentStep / steps;
        setTempCount(parseFloat((ratio * 41.8).toFixed(1)));
        setHotspotCount(Math.round(ratio * 14));
        setCanopyCount(parseFloat((ratio * 16.4).toFixed(1)));
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, []);

  const handleStartTour = () => {
    setTourStep(0);
    showToast("Launching interactive guide...", "info");
  };

  const handleNextTourStep = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep((prev) => prev + 1);
    } else {
      setTourStep(-1);
      localStorage.setItem("heatshield-tour-completed", "true");
      showToast("Interactive tour completed!", "success");
    }
  };

  const handleSkipTour = () => {
    setTourStep(-1);
    localStorage.setItem("heatshield-tour-completed", "true");
    showToast("Tour skipped. Click help icon to launch again.", "info");
  };

  const toggleWidgetVisibility = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w))
    );
  };

  const toggleWidgetSize = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, size: w.size === "half" ? "full" : "half" } : w
      )
    );
  };

  const resetWidgets = () => {
    setWidgets([
      { id: "metrics-panel", title: "Metrics Overview Cards", visible: true, size: "full" },
      { id: "priority-matrix", title: "Neighborhood Priority Matrix", visible: true, size: "half" },
      { id: "ai-insights", title: "AI Model Insights", visible: true, size: "half" },
      { id: "weather-strip", title: "Meteorological Sensor Strip", visible: true, size: "full" }
    ]);
    showToast("Dashboard widgets layout reset", "info");
  };

  const isWidgetVisible = (id: string) => {
    const w = widgets.find((x) => x.id === id);
    return w ? w.visible : false;
  };

  const getWidgetSizeClass = (id: string) => {
    const w = widgets.find((x) => x.id === id);
    if (!w) return "";
    return w.size === "full" ? "lg:col-span-3" : "lg:col-span-2";
  };

  const neighborhoods = [
    { name: "Downtown Sector 4", temp: "48.2°C", risk: "CRITICAL", index: 9.4, exposed: "124,500" },
    { name: "Northview Commercial", temp: "45.7°C", risk: "HIGH", index: 8.2, exposed: "82,100" },
    { name: "Eastwood Residential", temp: "43.1°C", risk: "MEDIUM", index: 6.8, exposed: "64,000" },
    { name: "Lakeside Industrial", temp: "41.5°C", risk: "MEDIUM", index: 5.9, exposed: "41,500" },
    { name: "Southpark Greens", temp: "38.6°C", risk: "LOW", index: 3.4, exposed: "12,800" },
  ];

  return (
    <div className="space-y-8 flex-1 relative" id="dashboard-overview-page">
      {/* 1. ONBOARDING TOUR MODAL OVERLAY */}
      <AnimatePresence>
        {tourStep >= 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#000000]"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm glass-panel-glow p-6 rounded-lg shadow-2xl border border-primary/30 z-10 font-mono text-xs flex flex-col gap-4 text-left"
            >
              <div className="flex justify-between items-center pb-2 border-b border-border/20">
                <span className="font-bold text-primary flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-primary animate-bounce" />
                  {tourSteps[tourStep].title}
                </span>
                <span className="text-[10px] text-muted">{tourStep + 1}/{tourSteps.length}</span>
              </div>
              <p className="text-slate-200 leading-relaxed">
                {tourSteps[tourStep].content}
              </p>
              <div className="flex justify-between items-center pt-2">
                <button 
                  onClick={handleSkipTour}
                  className="text-muted hover:text-white cursor-pointer"
                >
                  Skip Tour
                </button>
                <button
                  onClick={handleNextTourStep}
                  className="px-4 py-1.5 rounded bg-primary text-black font-bold flex items-center gap-1 hover:opacity-90 cursor-pointer"
                >
                  {tourStep === tourSteps.length - 1 ? "Finish" : "Next"}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-wider font-mono text-transparent bg-clip-text bg-gradient-to-r from-foreground to-primary">
            HEAT INTELLIGENCE OVERVIEW
          </h2>
          <p className="text-xs text-muted-foreground font-mono uppercase mt-1">
            SATELLITE SECTOR: NCR-DELHI-01 | TELEMETRY LIVE
          </p>
        </div>
        
        {/* Customizer controls and tour triggers */}
        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={handleStartTour}
            className="px-3 py-1.5 rounded border border-border/40 hover:border-primary text-muted hover:text-foreground text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
            title="Launch step-by-step tour"
          >
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            HELP TOUR
          </button>
          
          <button
            onClick={() => setCustomizing(!customizing)}
            className={`px-3 py-1.5 rounded border text-[10px] flex items-center gap-1 cursor-pointer transition-colors ${
              customizing ? "border-primary text-primary bg-primary/5" : "border-border/40 hover:border-primary text-muted hover:text-foreground"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            CUSTOMIZE LAYOUT
          </button>
        </div>
      </div>

      {/* 2. CUSTOMIZER PANEL WIDGET DRAWER */}
      <AnimatePresence>
        {customizing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel p-5 rounded-lg border border-primary/20 space-y-4 font-mono text-xs overflow-hidden"
          >
            <div className="flex justify-between items-center pb-2 border-b border-border/20">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                DASHBOARD PANEL CONFIGURATOR
              </span>
              <div className="flex items-center gap-4">
                <button onClick={resetWidgets} className="text-primary hover:text-foreground flex items-center gap-1 cursor-pointer">
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
                <button onClick={() => setCustomizing(false)} className="text-muted hover:text-foreground cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {widgets.map((w) => (
                <div key={w.id} className="p-3 bg-card border border-border rounded flex flex-col justify-between gap-3">
                  <div>
                    <div className="font-bold text-foreground">{w.title}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 uppercase">ID: {w.id}</div>
                  </div>
                  <div className="flex justify-between items-center border-t border-border/20 pt-2 text-[10px]">
                    {/* Toggle Visible */}
                    <button
                      onClick={() => toggleWidgetVisibility(w.id)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer transition-colors ${
                        w.visible ? "bg-secondary/10 text-secondary" : "bg-graphite text-muted"
                      }`}
                    >
                      {w.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {w.visible ? "Shown" : "Hidden"}
                    </button>
                    {/* Toggle Size */}
                    <button
                      onClick={() => toggleWidgetSize(w.id)}
                      className="px-2 py-1 rounded border border-border/40 hover:border-primary text-muted hover:text-foreground cursor-pointer"
                    >
                      Size: {w.size.toUpperCase()}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* METRIC CARD GRID */}
      {isWidgetVisible("metrics-panel") && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="metrics-cards">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 rounded-lg relative overflow-hidden"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] font-mono text-muted tracking-widest uppercase">Average Land Temp</div>
                <div className="text-3xl font-bold font-mono mt-2 text-heat-red glow-text-orange">
                  {tempCount.toFixed(1)}°C
                </div>
              </div>
              <div className="p-2.5 rounded bg-card border border-border/40 text-heat-red">
                <Thermometer className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-[10px] font-mono">
              <ArrowUpRight className="w-3.5 h-3.5 text-heat-red" />
              <span className="text-heat-red">+2.4°C vs last week</span>
            </div>
            <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-heat-red to-transparent opacity-60" />
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6 rounded-lg relative overflow-hidden"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] font-mono text-muted tracking-widest uppercase">Active Hotspots</div>
                <div className="text-3xl font-bold font-mono mt-2 text-accent glow-text-orange">
                  {hotspotCount} Districts
                </div>
              </div>
              <div className="p-2.5 rounded bg-card border border-border/40 text-accent">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-[10px] font-mono">
              <ArrowUpRight className="w-3.5 h-3.5 text-accent" />
              <span className="text-accent">4 critical alerts</span>
            </div>
            <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-accent to-transparent opacity-60" />
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-6 rounded-lg relative overflow-hidden"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] font-mono text-muted tracking-widest uppercase">Canopy Cover</div>
                <div className="text-3xl font-bold font-mono mt-2 text-secondary glow-text-green">
                  {canopyCount.toFixed(1)}%
                </div>
              </div>
              <div className="p-2.5 rounded bg-card border border-border/40 text-secondary">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-[10px] font-mono">
              <ArrowDownRight className="w-3.5 h-3.5 text-secondary" />
              <span className="text-secondary">+0.8% YoY growth</span>
            </div>
            <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-secondary to-transparent opacity-60" />
          </motion.div>
        </div>
      )}

      {/* Split Cards: Priority matrix & AI insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Priority Zones Table */}
        {isWidgetVisible("priority-matrix") && (
          <div className={`glass-panel p-6 rounded-lg space-y-4 ${getWidgetSizeClass("priority-matrix")}`} id="priority-matrix">
            <div className="flex justify-between items-center pb-2 border-b border-border/20">
              <h3 className="font-mono text-sm font-bold text-foreground tracking-widest">
                NEIGHBORHOOD PRIORITIZATION MATRIX
              </h3>
              <span className="text-[9px] font-mono text-muted uppercase">Ranked by Heat Risk</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-border/20 text-muted text-[10px] pb-2">
                    <th className="py-2">NEIGHBORHOOD</th>
                    <th className="py-2">SURFACE TEMP</th>
                    <th className="py-2">RISK LEVEL</th>
                    <th className="py-2 text-right">EXPOSED POP</th>
                    <th className="py-2 text-right">PRIORITY INDEX</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {neighborhoods.map((n, idx) => (
                    <tr key={idx} className="hover:bg-primary/5 transition-colors">
                      <td className="py-3 font-semibold text-foreground">{n.name}</td>
                      <td className="py-3 text-accent">{n.temp}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          n.risk === "CRITICAL" 
                            ? "bg-heat-red/10 border border-heat-red/30 text-heat-red"
                            : n.risk === "HIGH"
                            ? "bg-accent/10 border border-accent/30 text-accent"
                            : "bg-secondary/10 border border-secondary/30 text-secondary"
                        }`}>
                          {n.risk}
                        </span>
                      </td>
                      <td className="py-3 text-right text-muted-foreground">{n.exposed}</td>
                      <td className="py-3 text-right font-bold text-primary">{n.index}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Right Side: Quick Action AI Insights */}
        {isWidgetVisible("ai-insights") && (
          <div className="glass-panel p-6 rounded-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-border/20">
                <h3 className="font-mono text-sm font-bold text-foreground tracking-widest">
                  AI MODEL INSIGHTS
                </h3>
                <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                AI analysis detects a <span className="text-heat-red font-bold">8.4°C thermal variance</span> between downtown concrete and surrounding green parklands. 
              </p>

              <ul className="space-y-2 text-[11px] font-mono text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">1.</span>
                  Downtown surface temperatures driven by low albedo asphalt.
                </li>
                <li className="flex gap-2">
                  <span className="text-secondary font-bold">2.</span>
                  Cool roofs implementation could reduce local ambient heat by 1.8°C.
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold">3.</span>
                  High priority action identified for Northview Sector.
                </li>
              </ul>
            </div>

            <div className="pt-6" id="digital-twin-action">
              <Link 
                href="/dashboard/twin"
                className="w-full py-2.5 rounded border border-primary/30 hover:border-primary bg-primary/5 hover:bg-primary hover:text-primary-foreground text-primary font-mono text-xs text-center transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
              >
                SIMULATE INTERVENTIONS
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
      
      {/* METEOROLOGICAL SENSOR STRIP */}
      {isWidgetVisible("weather-strip") && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-card/40 border border-border/20 p-4 rounded-lg font-mono text-xs text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <Wind className="w-4 h-4 text-primary" />
            <div>
              <div className="text-[10px] text-muted uppercase">Wind Speed</div>
              <div className="text-foreground font-bold">14.8 km/h</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Droplets className="w-4 h-4 text-sky-blue" />
            <div>
              <div className="text-[10px] text-muted uppercase">Humidity</div>
              <div className="text-foreground font-bold">42%</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Thermometer className="w-4 h-4 text-accent" />
            <div>
              <div className="text-[10px] text-muted uppercase">Heat Index</div>
              <div className="text-foreground font-bold">44.6°C</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-secondary" />
            <div>
              <div className="text-[10px] text-muted uppercase">PM 2.5 Index</div>
              <div className="text-foreground font-bold">182 (Poor)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
