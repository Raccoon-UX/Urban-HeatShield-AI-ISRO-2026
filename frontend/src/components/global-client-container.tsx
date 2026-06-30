"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "./theme-provider";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Search, 
  LayoutDashboard, 
  Map, 
  Layers, 
  Flame, 
  MessageSquareCode, 
  BarChart3, 
  Settings, 
  Home, 
  Sun, 
  Moon, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  X 
} from "lucide-react";
import { useTheme } from "next-themes";

// 1. Toast Notification Context
interface Toast {
  id: string;
  message: string;
  type: "success" | "critical" | "info" | "warning";
}

interface ToastContextType {
  showToast: (message: string, type: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a GlobalClientContainer");
  }
  return context;
}

// 2. Main Wrapper Component
export default function GlobalClientContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();

  // Toast trigger function
  const showToast = (message: string, type: Toast["type"]) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove toast after 4s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Command Palette with Ctrl + K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }

      // If typing in input, don't trigger shortcuts
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      // Close dialogs with Escape
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }

      // Navigation & theme shortcuts
      switch (e.key.toLowerCase()) {
        case "t":
          e.preventDefault();
          const nextTheme = theme === "dark" ? "light" : "dark";
          setTheme(nextTheme);
          showToast(`Theme switched to ${nextTheme.toUpperCase()} mode`, "info");
          break;
        case "h":
          e.preventDefault();
          router.push("/");
          showToast("Navigating to Home", "info");
          break;
        case "d":
          e.preventDefault();
          router.push("/dashboard");
          showToast("Navigating to Dashboard Overview", "info");
          break;
        case "m":
          e.preventDefault();
          router.push("/dashboard/heatmap");
          showToast("Navigating to AI Heat Map", "info");
          break;
        case "s":
          e.preventDefault();
          router.push("/dashboard/simulator");
          showToast("Navigating to Cooling Simulator", "info");
          break;
        case "c":
          e.preventDefault();
          router.push("/dashboard/copilot");
          showToast("Navigating to AI Copilot", "info");
          break;
        case "a":
          e.preventDefault();
          router.push("/dashboard/analytics");
          showToast("Navigating to Analytics & Reports", "info");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [theme, router]);

  // Command palette routes configuration
  const paletteRoutes = [
    { name: "Home Portal", href: "/", icon: Home, shortcut: "H" },
    { name: "Dashboard Overview", href: "/dashboard", icon: LayoutDashboard, shortcut: "D" },
    { name: "AI Heat Map", href: "/dashboard/heatmap", icon: Map, shortcut: "M" },
    { name: "Digital Twin Sandbox", href: "/dashboard/twin", icon: Layers, shortcut: "None" },
    { name: "Cooling Simulator", href: "/dashboard/simulator", icon: Flame, shortcut: "S" },
    { name: "AI Copilot Scientist", href: "/dashboard/copilot", icon: MessageSquareCode, shortcut: "C" },
    { name: "Analytics & Compliance", href: "/dashboard/analytics", icon: BarChart3, shortcut: "A" },
  ];

  const filteredRoutes = paletteRoutes.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navigateTo = (href: string) => {
    router.push(href);
    setCommandPaletteOpen(false);
    setSearchQuery("");
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ToastContext.Provider value={{ showToast }}>
        {children}

        {/* 1. TOAST NOTIFICATIONS RENDERING */}
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-80 pointer-events-none">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                className="pointer-events-auto p-4 rounded-lg border glass-panel shadow-2xl flex items-start gap-3 relative overflow-hidden"
              >
                {/* Visual Icon indicator */}
                {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />}
                {toast.type === "critical" && <AlertCircle className="w-5 h-5 text-heat-red shrink-0 animate-bounce" />}
                {toast.type === "warning" && <AlertCircle className="w-5 h-5 text-accent shrink-0" />}
                {toast.type === "info" && <Info className="w-5 h-5 text-primary shrink-0" />}

                <div className="flex-1 font-mono text-xs text-foreground pr-4">
                  {toast.message}
                </div>

                <button 
                  onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="absolute top-2 right-2 text-muted hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
                {/* Mini animated timer line */}
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 4, ease: "linear" }}
                  className={`absolute bottom-0 left-0 h-[2px] ${
                    toast.type === "success" ? "bg-secondary" : toast.type === "critical" ? "bg-heat-red" : "bg-primary"
                  }`}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 2. GLOBAL COMMAND PALETTE MODAL (Ctrl + K) */}
        <AnimatePresence>
          {commandPaletteOpen && (
            <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
              {/* Blur backdrop overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setCommandPaletteOpen(false)}
                className="absolute inset-0 bg-[#000000] cursor-pointer"
              />

              {/* Command Box Panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="relative w-full max-w-lg rounded-xl border border-border/80 glass-panel-glow shadow-2xl overflow-hidden font-mono flex flex-col"
              >
                {/* Search Header */}
                <div className="p-4 border-b border-border/20 flex items-center gap-3 bg-card/40">
                  <Search className="w-5 h-5 text-primary" />
                  <input
                    type="text"
                    placeholder="Search mission controls or locations... (esc to close)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted focus:ring-0"
                    autoFocus
                  />
                  <span className="text-[10px] text-muted border border-border/50 rounded px-1.5 py-0.5">ESC</span>
                </div>

                {/* Search Result List */}
                <div className="p-3 max-h-72 overflow-y-auto space-y-1">
                  <div className="text-[9px] text-muted uppercase tracking-wider pl-2 py-1">NAVIGATION CONTROLS</div>
                  
                  {filteredRoutes.length === 0 ? (
                    <div className="text-xs text-muted text-center py-6">NO RESULTS MATCHER</div>
                  ) : (
                    filteredRoutes.map((route) => {
                      const Icon = route.icon;
                      return (
                        <button
                          key={route.href}
                          onClick={() => navigateTo(route.href)}
                          className="w-full text-left flex items-center justify-between p-2.5 rounded hover:bg-primary/10 text-xs text-foreground hover:text-white cursor-pointer transition-all"
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="w-4 h-4 text-primary" />
                            {route.name}
                          </span>
                          {route.shortcut !== "None" && (
                            <span className="text-[9px] text-muted border border-border/40 rounded px-1.5 py-0.5">
                              {route.shortcut}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}

                  {/* System Theme Toggles inside Palette */}
                  <div className="border-t border-border/20 mt-2 pt-2">
                    <div className="text-[9px] text-muted uppercase tracking-wider pl-2 py-1">THEME CONFIG</div>
                    <div className="flex gap-2 p-1">
                      <button
                        onClick={() => { setTheme("dark"); showToast("Dark Theme Selected", "info"); }}
                        className={`flex-1 py-2 rounded border text-[10px] font-bold text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          theme === "dark" 
                            ? "bg-primary text-black border-primary font-bold" 
                            : "border-border/40 hover:border-muted text-muted"
                        }`}
                      >
                        <Moon className="w-3.5 h-3.5" />
                        DARK
                      </button>
                      <button
                        onClick={() => { setTheme("light"); showToast("Light Theme Selected", "info"); }}
                        className={`flex-1 py-2 rounded border text-[10px] font-bold text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          theme === "light" 
                            ? "bg-primary text-black border-primary font-bold" 
                            : "border-border/40 hover:border-muted text-muted"
                        }`}
                      >
                        <Sun className="w-3.5 h-3.5" />
                        LIGHT
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer hints */}
                <div className="p-3 bg-card/20 border-t border-border/20 text-[9px] text-muted flex justify-between">
                  <span>SELECT: ↑↓ ENTER</span>
                  <span>THEME SHORTCUT: T</span>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </ToastContext.Provider>
    </ThemeProvider>
  );
}
