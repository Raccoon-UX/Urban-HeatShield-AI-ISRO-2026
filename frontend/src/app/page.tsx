"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Radio, Cpu, Thermometer, Globe, ArrowRight } from "lucide-react";
import GlobeCanvas from "@/components/globe/globe-canvas";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("CONNECTING TO ORBITAL GRID...");
  
  // Audio state (futuristic click/activation sounds can be toggled)
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    // Stage-based loading texts
    const textStages = [
      { max: 20, text: "ESTABLISHING SECURE SATELLITE CONNECTION..." },
      { max: 40, text: "RETRIEVING LAND SURFACE TEMPERATURE BANDS..." },
      { max: 60, text: "INITIALIZING NEURAL NETWORK MODEL..." },
      { max: 80, text: "GENERATING 3D URBAN DIGITAL TWIN MESH..." },
      { max: 95, text: "COMPILING THERMAL MITIGATION SIMULATORS..." },
      { max: 100, text: "DEVICES ARMED. DEPLOYING HEATSHIELD AI..." },
    ];

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 800); // Smooth fade transition
          return 100;
        }
        
        const nextVal = prev + Math.floor(Math.random() * 8) + 2;
        const boundedVal = Math.min(nextVal, 100);
        
        // Update text based on current value
        const stage = textStages.find((s) => boundedVal <= s.max);
        if (stage) setLoadingText(stage.text);
        
        return boundedVal;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  const handleLaunch = () => {
    // Play a futuristic activation sound if possible, then route
    if (typeof window !== "undefined") {
      router.push("/dashboard");
    }
  };

  return (
    <main className="relative min-h-screen bg-[#030712] overflow-hidden flex flex-col font-sans select-none" id="landing-page-main">
      {/* Background Animated Grid Overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 z-0 pointer-events-none"
      />

      {/* Futuristic Scanlines */}
      <div className="scan-line" />

      {/* Global Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      {/* LOADING SCREEN EXPERIENCE */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 bg-[#02050f] z-50 flex flex-col items-center justify-center p-6"
            id="loading-overlay"
          >
            {/* Holographic Logo Container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative flex flex-col items-center mb-12"
            >
              <div className="w-20 h-20 rounded-full border border-primary/30 flex items-center justify-center glass-panel-glow relative mb-4">
                <Shield className="w-10 h-10 text-primary animate-pulse" />
                {/* Orbital Rings */}
                <div className="absolute inset-0 rounded-full border-t border-accent/40 animate-spin" style={{ animationDuration: "3s" }} />
                <div className="absolute inset-[-4px] rounded-full border-b border-secondary/30 animate-spin" style={{ animationDuration: "6s", animationDirection: "reverse" }} />
              </div>
              <h1 className="text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-secondary glow-text-cyan font-mono">
                HEATSHIELD AI
              </h1>
              <div className="text-[10px] text-muted tracking-[0.25em] uppercase font-mono mt-1">
                SYSTEM LAUNCH INITIATED
              </div>
            </motion.div>

            {/* Load Data Box */}
            <div className="w-full max-w-md glass-panel p-6 rounded-lg relative overflow-hidden">
              <div className="flex justify-between items-center text-xs font-mono text-primary/80 mb-2">
                <span className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-accent" />
                  {loadingText}
                </span>
                <span>{progress}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-[#0b1329] rounded-full overflow-hidden border border-border/30">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary via-secondary to-accent"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "easeInOut" }}
                />
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-mono text-muted border-t border-border/30 pt-3">
                <div className="flex justify-between">
                  <span>TELEMETRY:</span>
                  <span className="text-secondary">CONNECTED</span>
                </div>
                <div className="flex justify-between">
                  <span>MODEL VER:</span>
                  <span className="text-primary">HS-v2.6</span>
                </div>
                <div className="flex justify-between">
                  <span>ORBIT:</span>
                  <span className="text-accent">GEO-STATIONARY</span>
                </div>
                <div className="flex justify-between">
                  <span>CALIBRATION:</span>
                  <span className="text-secondary">OPTIMAL</span>
                </div>
              </div>
            </div>

            {/* Subdued NASA Coordinates Footer */}
            <div className="absolute bottom-6 text-[9px] font-mono text-muted tracking-widest text-center">
              LAT: 28.6139° N, LON: 77.2090° E | SATELLITE: ISRO INSAT-3DR | SCAN RATE: 12.8 GHz
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER NAVIGATION */}
      <header className="relative z-10 flex justify-between items-center px-6 py-4 md:px-12 md:py-6 border-b border-border/20 glass-panel">
        <div className="flex items-center gap-2">
          <Shield className="w-7 h-7 text-primary" />
          <span className="font-mono text-lg font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-primary">
            HEATSHIELD <span className="text-secondary">AI</span>
          </span>
        </div>
        
        {/* Status Indicators (Visible on Desktop) */}
        <div className="hidden md:flex items-center gap-6 text-[10px] font-mono text-muted">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-secondary animate-pulse" />
            SATELLITE LINK: <span className="text-secondary font-bold">ONLINE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-primary animate-pulse" />
            AI COMPILER: <span className="text-primary font-bold">READY</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Thermometer className="w-3 h-3 text-accent animate-pulse" />
            GLOBAL TEMP: <span className="text-accent font-bold">CRITICAL</span>
          </div>
        </div>

        <button 
          onClick={handleLaunch}
          className="relative px-5 py-2 rounded-full font-mono text-xs text-primary border border-primary/30 hover:border-primary hover:bg-primary/10 transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-primary/10"
          id="btn-nav-launch"
        >
          LAUNCH PLATFORM
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* HERO SECTION */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 md:px-12 flex flex-col md:grid md:grid-cols-2 items-center gap-8 relative z-10">
        {/* Left Side Info */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: loading ? 0 : 1, x: loading ? -30 : 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col text-left space-y-6 max-w-xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] tracking-wider font-mono w-fit uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
            National Smart Cities Mission Standard
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            AI-Powered <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent glow-text-cyan">
              Urban Heat Intelligence
            </span>
          </h1>

          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            Transform high-resolution satellite imagery, Land Surface Temperature (LST) arrays, and spatial albedo matrices into actionable cooling actions. Predict climate stress and simulate digital twin interventions instantly.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={handleLaunch}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-primary via-sky-blue to-secondary text-white font-mono text-sm font-bold tracking-wider hover:opacity-90 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              id="btn-hero-launch"
            >
              LAUNCH PLATFORM
              <Shield className="w-4 h-4" />
            </button>
            <button
              onClick={handleLaunch}
              className="px-8 py-3.5 rounded-full bg-transparent border border-border hover:border-primary/50 text-white font-mono text-sm tracking-wider hover:bg-white/5 transition-all cursor-pointer"
              id="btn-hero-heatmap"
            >
              VIEW LIVE HEATMAP
            </button>
          </div>

          {/* Micro metrics dashboard mock */}
          <div className="grid grid-cols-3 gap-4 border-t border-border/30 pt-6 mt-4">
            <div>
              <div className="text-2xl font-bold text-white font-mono">0.05m</div>
              <div className="text-[10px] text-muted tracking-wider uppercase">SAT RESOLUTION</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent font-mono">-5.2°C</div>
              <div className="text-[10px] text-muted tracking-wider uppercase">SIMULATED COOLING</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary font-mono">98.4%</div>
              <div className="text-[10px] text-muted tracking-wider uppercase">MODEL ACCURACY</div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Interactive 3D Globe */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: loading ? 0 : 1, scale: loading ? 0.8 : 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="relative w-full h-[350px] md:h-[500px] lg:h-[600px] flex items-center justify-center cursor-grab active:cursor-grabbing"
          id="hero-3d-globe-container"
        >
          {/* Globe Canvas Component */}
          {!loading && <GlobeCanvas />}

          {/* Interactive instruction HUD */}
          <div className="absolute bottom-4 right-4 z-10 glass-panel px-3 py-1.5 rounded-md text-[9px] font-mono text-primary/80 border border-primary/20 pointer-events-none flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "10s" }} />
            DRAG TO ROTATE SATELLITE NODE
          </div>
        </motion.div>
      </div>

      {/* SUB-FOOTER BRANDING */}
      <footer className="relative z-10 py-6 border-t border-border/20 glass-panel text-center text-xs font-mono text-muted flex flex-col md:flex-row justify-between items-center px-12 gap-4">
        <div>
          © 2026 HEATSHIELD AI. ALL RIGHTS RESERVED.
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-primary transition-all">MINISTRY OF HOUSING & URBAN AFFAIRS</a>
          <span>|</span>
          <a href="#" className="hover:text-secondary transition-all">ISRO SATELLITE ARCHIVE</a>
          <span>|</span>
          <a href="#" className="hover:text-accent transition-all">SMART CITIES INITIATIVE</a>
        </div>
      </footer>
    </main>
  );
}
