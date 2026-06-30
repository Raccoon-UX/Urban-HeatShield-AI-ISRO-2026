"use client";

import React, { useState } from "react";
import { useDashboardState } from "../layout";
import { useTheme } from "next-themes";
import { 
  Settings, 
  User, 
  Sliders, 
  Map, 
  Bell, 
  Database, 
  Languages, 
  Accessibility, 
  Volume2,
  Check,
  ShieldAlert,
  Save,
  Globe
} from "lucide-react";
import { useToast } from "@/components/global-client-container";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { role, setRole, tempUnit, setTempUnit, voiceActive, setVoiceActive } = useDashboardState();
  const { showToast } = useToast();

  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Local settings states
  const [accentColor, setAccentColor] = useState<"cyan" | "green" | "orange">("cyan");
  const [language, setLanguage] = useState("en");
  const [allowAnimations, setAllowAnimations] = useState(true);
  const [showGridOverlay, setShowGridOverlay] = useState(true);
  const [enableSatellite, setEnableSatellite] = useState(true);
  
  const [notifCritical, setNotifCritical] = useState(true);
  const [notifSatellite, setNotifSatellite] = useState(true);
  
  const [userName, setUserName] = useState("Vikram Sarabhai");
  const [userEmail, setUserEmail] = useState("v.sarabhai@isro.gov.in");

  const saveSettings = () => {
    // Simulate auto-save or click-save toast
    showToast("Settings profiles compiled & saved!", "success");
  };

  const accents = [
    { id: "cyan", name: "Electric Cyan", color: "bg-[#06b6d4]" },
    { id: "green", name: "Aurora Green", color: "bg-[#10b981]" },
    { id: "orange", name: "Solar Orange", color: "bg-[#f97316]" }
  ];

  const apis = [
    { name: "Supabase DB", status: "CONNECTED", type: "success" },
    { name: "Gemini AI API", status: "CONNECTED", type: "success" },
    { name: "Mapbox Tiles", status: "STABLE", type: "success" },
    { name: "ISRO Satellite Feed", status: "LIVE (10.4 GHz)", type: "success" }
  ];

  return (
    <div className="flex-1 flex flex-col space-y-6" id="settings-page">
      {/* Title Header */}
      <div className="flex justify-between items-start pb-2 border-b border-border/20">
        <div>
          <h2 className="text-2xl font-bold tracking-wider font-mono text-transparent bg-clip-text bg-gradient-to-r from-foreground to-primary">
            SYSTEM SETTINGS
          </h2>
          <p className="text-xs text-muted-foreground font-mono uppercase mt-1">
            LOCAL CONTROL INTERFACE | CALIBRATION MODE
          </p>
        </div>
        
        <button
          onClick={saveSettings}
          className="px-4 py-2 rounded bg-primary text-primary-foreground font-mono text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-all cursor-pointer shadow-lg"
        >
          <Save className="w-4 h-4" />
          SAVE CHANGES
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch font-mono text-xs">
        
        {/* LEFT COLUMN: Profile & API Status */}
        <div className="space-y-6 lg:col-span-1">
          {/* Profile Card */}
          <div className="glass-panel p-5 rounded-lg space-y-4">
            <div className="pb-3 border-b border-border/20 font-bold text-foreground flex items-center gap-1.5 uppercase">
              <User className="w-4 h-4 text-primary" />
              User Profile
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-muted text-[10px] uppercase">Node Identity</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-card border border-border/40 rounded px-3 py-2 text-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-muted text-[10px] uppercase">Secure Email</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-card border border-border/40 rounded px-3 py-2 text-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <div className="pt-2">
                <span className="text-[10px] text-muted uppercase">Permission Rank:</span>
                <span className="text-secondary font-bold ml-1.5">ISRO_CHIEF_ADMIN</span>
              </div>
            </div>
          </div>

          {/* API Linkages Card */}
          <div className="glass-panel p-5 rounded-lg space-y-4">
            <div className="pb-3 border-b border-border/20 font-bold text-foreground flex items-center gap-1.5 uppercase">
              <Database className="w-4 h-4 text-primary" />
              API Connectivity
            </div>

            <div className="space-y-2 text-[10px]">
              {apis.map((api, idx) => (
                <div key={idx} className="p-2.5 rounded bg-card border border-border/30 flex justify-between items-center">
                  <span className="text-muted-foreground">{api.name}</span>
                  <span className="text-secondary font-bold">{api.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: Global Theme & Accent controls */}
        <div className="space-y-6 lg:col-span-1">
          {/* General Theme & units */}
          <div className="glass-panel p-5 rounded-lg space-y-4">
            <div className="pb-3 border-b border-border/20 font-bold text-foreground flex items-center gap-1.5 uppercase">
              <Sliders className="w-4 h-4 text-primary" />
              Theme Configuration
            </div>

            <div className="space-y-4">
              {/* Theme toggles */}
              <div className="space-y-1">
                <label className="text-muted text-[10px] uppercase">Active theme mode</label>
                <div className="flex gap-2 bg-card border border-border/40 rounded p-1">
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex-1 py-1.5 rounded text-[10px] text-center transition-colors cursor-pointer ${
                      mounted && theme === "dark" ? "bg-primary text-primary-foreground font-bold" : "text-muted hover:text-foreground"
                    }`}
                  >
                    DARK SPACE
                  </button>
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex-1 py-1.5 rounded text-[10px] text-center transition-colors cursor-pointer ${
                      mounted && theme === "light" ? "bg-primary text-primary-foreground font-bold" : "text-muted hover:text-foreground"
                    }`}
                  >
                    FROSTED LIGHT
                  </button>
                </div>
              </div>

              {/* Accent Color picker */}
              <div className="space-y-1">
                <label className="text-muted text-[10px] uppercase">Accent Theme color</label>
                <div className="flex gap-3 pt-1">
                  {accents.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => {
                        setAccentColor(acc.id as any);
                        showToast(`Accent color shifted to ${acc.name}`, "info");
                      }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-transform ${acc.color} ${
                        accentColor === acc.id ? "scale-110 ring-2 ring-white" : "hover:scale-105"
                      }`}
                      title={acc.name}
                    >
                      {accentColor === acc.id && <Check className="w-4 h-4 text-black font-bold" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temp Units */}
              <div className="space-y-1">
                <label className="text-muted text-[10px] uppercase">Temperature Unit</label>
                <div className="flex bg-card border border-border/40 rounded p-0.5 w-32">
                  <button
                    onClick={() => { setTempUnit("C"); showToast("Temperature units: Celsius", "info"); }}
                    className={`flex-1 py-1 rounded text-center cursor-pointer ${
                      tempUnit === "C" ? "bg-primary text-primary-foreground font-bold" : "text-muted hover:text-foreground"
                    }`}
                  >
                    °C
                  </button>
                  <button
                    onClick={() => { setTempUnit("F"); showToast("Temperature units: Fahrenheit", "info"); }}
                    className={`flex-1 py-1 rounded text-center cursor-pointer ${
                      tempUnit === "F" ? "bg-primary text-primary-foreground font-bold" : "text-muted hover:text-foreground"
                    }`}
                  >
                    °F
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Languages & Accessibilities */}
          <div className="glass-panel p-5 rounded-lg space-y-4">
            <div className="pb-3 border-b border-border/20 font-bold text-foreground flex items-center gap-1.5 uppercase">
              <Languages className="w-4 h-4 text-primary" />
              Language & Accessibility
            </div>

            <div className="space-y-3">
              {/* Language selection dropdown */}
              <div className="space-y-1">
                <label className="text-muted text-[10px] uppercase">Platform Language</label>
                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    showToast(`Language shifted to ${e.target.value === "hi" ? "Hindi" : "English"}`, "info");
                  }}
                  className="w-full bg-card border border-border/40 rounded px-3 py-2 text-foreground font-mono focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="en">English (US)</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="es">Spanish (Español)</option>
                  <option value="de">German (Deutsch)</option>
                </select>
              </div>

              {/* Reduced Motion Switch */}
              <div className="flex justify-between items-center pt-2">
                <div>
                  <div className="font-bold text-foreground">Fluid Animations</div>
                  <div className="text-[9px] text-muted">Toggle Framer Motion effects</div>
                </div>
                <button
                  onClick={() => {
                    setAllowAnimations(!allowAnimations);
                    showToast(allowAnimations ? "Reduced motion active" : "Fluid transitions enabled", "info");
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    allowAnimations ? "bg-primary" : "bg-graphite"
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-black rounded-full transition-all ${
                    allowAnimations ? "right-1" : "left-1"
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Map preferences & alerts config */}
        <div className="space-y-6 lg:col-span-1">
          {/* Map preferences */}
          <div className="glass-panel p-5 rounded-lg space-y-4">
            <div className="pb-3 border-b border-border/20 font-bold text-foreground flex items-center gap-1.5 uppercase">
              <Map className="w-4 h-4 text-primary" />
              Map Preferences
            </div>

            <div className="space-y-3">
              {/* Grid overlay toggle */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-foreground">GIS Grid lines</div>
                  <div className="text-[9px] text-muted">Show row/col sectors on map</div>
                </div>
                <button
                  onClick={() => setShowGridOverlay(!showGridOverlay)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    showGridOverlay ? "bg-primary" : "bg-graphite"
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-black rounded-full transition-all ${
                    showGridOverlay ? "right-1" : "left-1"
                  }`} />
                </button>
              </div>

              {/* Satellite feed toggle */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-foreground">Satellite Tiles Feed</div>
                  <div className="text-[9px] text-muted">Download raw GIS imagery</div>
                </div>
                <button
                  onClick={() => setEnableSatellite(!enableSatellite)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    enableSatellite ? "bg-primary" : "bg-graphite"
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-black rounded-full transition-all ${
                    enableSatellite ? "right-1" : "left-1"
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Notification config */}
          <div className="glass-panel p-5 rounded-lg space-y-4">
            <div className="pb-3 border-b border-border/20 font-bold text-foreground flex items-center gap-1.5 uppercase">
              <Bell className="w-4 h-4 text-primary" />
              Alert Preferences
            </div>

            <div className="space-y-3">
              {/* Critical alerts */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-foreground">Critical Heat Warnings</div>
                  <div className="text-[9px] text-muted">Delhi/NCR exceed alerts</div>
                </div>
                <button
                  onClick={() => setNotifCritical(!notifCritical)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    notifCritical ? "bg-primary" : "bg-graphite"
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-black rounded-full transition-all ${
                    notifCritical ? "right-1" : "left-1"
                  }`} />
                </button>
              </div>

              {/* Satellite download alerts */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-foreground">Satellite Band Tickers</div>
                  <div className="text-[9px] text-muted">Download alerts on dashboard</div>
                </div>
                <button
                  onClick={() => setNotifSatellite(!notifSatellite)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    notifSatellite ? "bg-primary" : "bg-graphite"
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-black rounded-full transition-all ${
                    notifSatellite ? "right-1" : "left-1"
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
