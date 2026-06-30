"use client";

import React, { useState, createContext, useContext, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Map,
  Layers,
  Flame,
  MessageSquareCode,
  BarChart3,
  User,
  Settings,
  Bell,
  Volume2,
  VolumeX,
  Compass,
  Database,
  Users,
  Sun,
  Moon,
  Clock,
  LogOut,
  Sliders
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

// Context for global dashboard state
type UserRole = "government" | "researcher" | "citizen";

interface DashboardContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  voiceActive: boolean;
  setVoiceActive: (active: boolean) => void;
  thermalMode: boolean;
  setThermalMode: (mode: boolean) => void;
  tempUnit: "C" | "F";
  setTempUnit: (unit: "C" | "F") => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function useDashboardState() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboardState must be used within a DashboardProvider");
  }
  return context;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Dashboard settings state
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<UserRole>("government");
  const [voiceActive, setVoiceActive] = useState(false);
  const [thermalMode, setThermalMode] = useState(false);
  const [tempUnit, setTempUnit] = useState<"C" | "F">("C");
  const [time, setTime] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { theme, setTheme } = useTheme();

  const [notifications, setNotifications] = useState([
    { id: 1, text: "Heatwave Alert: Delhi NCR temperatures projected to exceed 46°C.", type: "critical" },
    { id: 2, text: "Satellite download completed: Landsat-9 band 10 (LST).", type: "success" }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Update live clock
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navigationItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "AI Heat Map", href: "/dashboard/heatmap", icon: Map },
    { name: "Digital Twin", href: "/dashboard/twin", icon: Layers },
    { name: "Cooling Simulator", href: "/dashboard/simulator", icon: Flame },
    { name: "AI Copilot", href: "/dashboard/copilot", icon: MessageSquareCode },
    { name: "Analytics & Reports", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
  };

  const clearNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <DashboardContext.Provider value={{ role, setRole, voiceActive, setVoiceActive, thermalMode, setThermalMode, tempUnit, setTempUnit }}>
      <div 
        className={`min-h-screen bg-background text-foreground flex flex-col font-sans select-none relative transition-colors duration-300 ${thermalMode ? "theme-thermal" : ""}`}
        id="dashboard-layout-container"
      >
        {/* Animated Background Overlay */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,var(--border-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-color)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20 z-0 pointer-events-none"
        />

        {/* TOP HUD BAR */}
        <header className="relative z-20 flex justify-between items-center px-6 py-3 border-b border-border/20 glass-panel">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-mono text-sm font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-foreground to-primary">
                HEATSHIELD <span className="text-secondary">AI</span>
              </span>
            </Link>
            
            {/* Live Status Board & Clock */}
            <div className="hidden lg:flex items-center gap-4 text-[10px] font-mono border-l border-border/20 pl-6 text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                SAT LINK: INSAT-3DR (ONLINE)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                UHI COEFFICIENT: +4.8°C
              </div>
              {time && (
                <div className="flex items-center gap-1.5 text-primary border-l border-border/20 pl-4 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  {time}
                </div>
              )}
            </div>
          </div>

          {/* Top Right Control Panel */}
          <div className="flex items-center gap-4">
            {/* Live Weather Widget */}
            <div className="hidden sm:flex items-center gap-2 border border-border/30 bg-card px-3 py-1 rounded-full text-[10px] font-mono">
              <Sun className="w-3.5 h-3.5 text-accent animate-pulse" />
              <span>DELHI: <span className="text-foreground font-bold">39.4°C</span></span>
              <span className="text-heat-red font-bold animate-pulse">HEATWAVE ALERT</span>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center bg-card border border-border/40 rounded-full p-0.5 text-xs font-mono">
              <button
                onClick={() => handleRoleChange("government")}
                className={`px-3 py-1 rounded-full text-[10px] tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                  role === "government"
                    ? "bg-primary text-primary-foreground shadow-md font-bold"
                    : "text-muted hover:text-foreground"
                }`}
                title="Government Mode: Focuses on budget, ROI, policy"
              >
                <Compass className="w-3 h-3" />
                GOVT
              </button>
              <button
                onClick={() => handleRoleChange("researcher")}
                className={`px-3 py-1 rounded-full text-[10px] tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                  role === "researcher"
                    ? "bg-secondary text-black shadow-md font-bold"
                    : "text-muted hover:text-foreground"
                }`}
                title="Research Mode: Focuses on raw bands, NDVI, scientific details"
              >
                <Database className="w-3 h-3" />
                RESEARCH
              </button>
              <button
                onClick={() => handleRoleChange("citizen")}
                className={`px-3 py-1 rounded-full text-[10px] tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                  role === "citizen"
                    ? "bg-accent text-white shadow-md font-bold"
                    : "text-muted hover:text-foreground"
                }`}
                title="Citizen Mode: Focuses on thermal comfort, mitigation tips"
              >
                <Users className="w-3 h-3" />
                CITIZEN
              </button>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => setVoiceActive(!voiceActive)}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                voiceActive 
                  ? "border-primary/50 bg-primary/10 text-primary animate-pulse" 
                  : "border-border/30 hover:border-muted text-muted"
              }`}
              title="Toggle Voice Copilot Assistant"
            >
              {voiceActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full border border-border/30 hover:border-muted text-muted hover:text-foreground cursor-pointer transition-colors w-8 h-8 flex items-center justify-center"
              title="Toggle Theme Mode (Shortcut: T)"
            >
              {!mounted ? (
                <div className="w-4 h-4" />
              ) : theme === "dark" ? (
                <Sun className="w-4 h-4 text-accent" />
              ) : (
                <Moon className="w-4 h-4 text-primary" />
              )}
            </button>

            {/* Notifications Hub */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full border border-border/30 hover:border-muted text-muted-foreground relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-heat-red animate-ping" />
                )}
              </button>
              
              {/* Notification Overlay Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 glass-panel-glow rounded-lg border border-border p-4 shadow-xl z-50">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-border/20">
                    <span className="text-xs font-mono font-bold text-primary">ALERTS & NOTIFICATIONS</span>
                    <span className="text-[10px] font-mono text-muted">{notifications.length} ACTIVE</span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-[10px] font-mono text-muted text-center py-4">NO CURRENT WARNINGS</div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={`p-2.5 rounded border text-[10px] font-mono relative flex flex-col gap-1.5 ${
                            n.type === "critical" 
                              ? "bg-heat-red/10 border-heat-red/30 text-heat-red" 
                              : "bg-secondary/10 border-secondary/30 text-secondary"
                          }`}
                        >
                          <p>{n.text}</p>
                          <button 
                            onClick={() => clearNotification(n.id)}
                            className="absolute top-1 right-2 text-muted hover:text-white text-[9px] cursor-pointer"
                          >
                            × Dismiss
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="w-px h-6 bg-border/30" />

            {/* Profile Avatar Card with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 cursor-pointer border border-border/20 rounded-full px-3 py-1 bg-card/50 hover:bg-card transition-all"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                  <User className="w-3 h-3 text-black" />
                </div>
                <span className="hidden md:inline font-mono text-[10px] text-muted-foreground hover:text-foreground uppercase font-bold">
                  ISRO_ADMIN
                </span>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-3 w-56 glass-panel-glow border border-border rounded-lg p-3 shadow-2xl z-50 font-mono text-xs"
                  >
                    <div className="pb-2 border-b border-border/20 mb-2">
                      <div className="font-bold text-foreground">ISRO Admin Node</div>
                      <div className="text-[9px] text-muted">admin@isro.gov.in</div>
                    </div>
                    <div className="space-y-1">
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 p-2 rounded hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-all"
                      >
                        <Settings className="w-4 h-4 text-primary" />
                        System Settings
                      </Link>
                      <Link
                        href="/"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 p-2 rounded hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-all"
                      >
                        <Shield className="w-4 h-4 text-secondary" />
                        Launch Portal
                      </Link>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          router.push("/");
                        }}
                        className="w-full text-left flex items-center gap-2.5 p-2 rounded hover:bg-heat-red/10 text-muted-foreground hover:text-heat-red transition-all cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-heat-red" />
                        Disconnect
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative z-10">
          {/* SIDEBAR NAVIGATION */}
          <aside className="w-64 border-r border-border/20 glass-panel flex flex-col p-4 justify-between shrink-0 hidden md:flex">
            <div className="space-y-6">
              <div className="text-[10px] font-mono text-muted tracking-widest uppercase pl-3">
                MISSION CONTROL
              </div>
              <nav className="space-y-1">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono text-xs transition-all relative ${
                        isActive
                          ? "text-primary bg-primary/10 border border-primary/20"
                          : "text-muted hover:text-foreground hover:bg-primary/5 border border-transparent"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                      {isActive && (
                        <motion.div
                          layoutId="active-nav-indicator"
                          className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Quick telemetry HUD */}
            <div className="glass-card p-3 rounded-lg border border-border/40 font-mono text-[10px] space-y-2 mt-auto">
              <div className="flex justify-between items-center text-primary">
                <span>GPU ACCELERATION:</span>
                <span className="font-bold">ACTIVE (60FPS)</span>
              </div>
              <div className="flex justify-between items-center text-muted">
                <span>MEM CACHE:</span>
                <span>4.2 GB</span>
              </div>
              <div className="flex justify-between items-center text-muted">
                <span>SYSTEM SHIELD:</span>
                <span className="text-secondary">ARMED</span>
              </div>
              <div className="pt-2 border-t border-border/20 flex justify-between items-center text-[9px] text-muted">
                <span>NODE CALIB:</span>
                <span>12-BIT RES</span>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT VIEWPORT */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-background/80 relative flex flex-col">
            {children}
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
