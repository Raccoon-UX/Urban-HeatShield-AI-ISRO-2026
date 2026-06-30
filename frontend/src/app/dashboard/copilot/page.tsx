"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDashboardState } from "../layout";
import { 
  Send, 
  Sparkles, 
  Mic, 
  MicOff, 
  FileText, 
  Trash2, 
  Volume2, 
  Bot, 
  User, 
  Play,
  ArrowRight,
  TrendingDown,
  DollarSign,
  Leaf,
  Download,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import { useToast } from "@/components/global-client-container";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  chartData?: { label: string; value: number; color?: string }[];
  roadmap?: string[];
}

// Simple Custom Markdown Renderer
function MarkdownRenderer({ text }: { text: string }) {
  // Split lines and check patterns
  const lines = text.split("\n");
  
  return (
    <div className="space-y-2 leading-relaxed">
      {lines.map((line, idx) => {
        // Headers: ### Header
        if (line.startsWith("### ")) {
          return <h4 key={idx} className="text-sm font-bold text-white tracking-wide mt-3 mb-1 uppercase border-l-2 border-primary pl-2">{line.replace("### ", "")}</h4>;
        }
        
        // Bullet list: - item
        if (line.trim().startsWith("- ")) {
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1">
              <li className="text-slate-300">{line.trim().replace("- ", "")}</li>
            </ul>
          );
        }

        // Bold formatting: **text**
        let renderedLine: React.ReactNode = line;
        if (line.includes("**")) {
          const parts = line.split("**");
          renderedLine = parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-primary font-bold">{part}</strong> : part);
        }

        // Code inline: `code`
        if (line.includes("`")) {
          const parts = line.split("`");
          renderedLine = parts.map((part, i) => i % 2 === 1 ? <code key={i} className="bg-graphite/40 border border-border/40 px-1 rounded text-accent text-[10px]">{part}</code> : part);
        }

        return <p key={idx} className="text-slate-200">{renderedLine}</p>;
      })}
    </div>
  );
}

export default function AICopilotPage() {
  const { role, voiceActive, setVoiceActive } = useDashboardState();
  const { showToast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "ai",
      text: "### Welcome to Mission Control\nI am your AI Climate Science Advisor. I can analyze thermal bands, simulate cooling intervention portfolios, and compile official implementation roadmaps.\n\nType a query below, click the microphone, or select a preset to begin.",
      timestamp: "10:35 AM"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Speech Recognition Ref
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => {
          setIsRecording(true);
          showToast("Speech recognition activated. Speak now...", "info");
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          handleSend(transcript);
        };

        rec.onerror = (e: any) => {
          setIsRecording(false);
          showToast("Voice recognition error: " + e.error, "critical");
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const presets = [
    { label: "Predict next 10 years", query: "Predict the urban temperature trends for the next 10 years if no interventions are made." },
    { label: "Suggest cheapest cooling", query: "Suggest the cheapest cooling strategy for Delhi NCR with a target temperature drop of 3°C." },
    { label: "Generate policy roadmap", query: "Generate a comprehensive implementation roadmap and policy report for a 25% cool roof mandate." }
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `msg-usr-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Simulate AI response based on query keywords
    setTimeout(() => {
      let aiText = "";
      let chartData: Message["chartData"] = undefined;
      let roadmap: Message["roadmap"] = undefined;

      const lower = text.toLowerCase();
      if (lower.includes("10 years") || lower.includes("predict")) {
        aiText = "### Decadal Temperature Projections\nWithout immediate greening or albedo intervention, urban expansion and heat accumulation are projected to increase regional Land Surface Temperature by **+3.4°C**, exposing an additional 420,000 citizens to critical heat stress.\n\nHere is the forecasted trend index:";
        chartData = [
          { label: "2026", value: 41.8, color: "#10b981" },
          { label: "2028", value: 42.6, color: "#f59e0b" },
          { label: "2031", value: 43.8, color: "#f97316" },
          { label: "2034", value: 44.9, color: "#ef4444" },
          { label: "2036", value: 45.2, color: "#dc2626" }
        ];
      } else if (lower.includes("cheapest") || lower.includes("cheap")) {
        aiText = "### Least-Cost Cooling Strategy\nTo achieve a target drop of **3.0°C**, the most cost-efficient path is a broad deployment of elastomeric cool roof coatings (Capex: ~$8.4M), supplemented by targeted water feature installations in core sectors.\n\nThe cooling contribution breakdown is:";
        chartData = [
          { label: "Cool Roofs", value: 2.8, color: "#06b6d4" },
          { label: "Pond Features", value: 0.8, color: "#0ea5e9" },
          { label: "Greening Corridor", value: 0.4, color: "#10b981" }
        ];
        roadmap = [
          "Phase 1: Apply reflective white coating to public building rooftops ($1.2M, Months 1-3).",
          "Phase 2: Incentivize residential retrofitting through property tax rebates (Months 3-6).",
          "Phase 3: Install minor park retention ponds in high-stress zones (Months 6-12)."
        ];
      } else if (lower.includes("roadmap") || lower.includes("policy")) {
        aiText = "### Mandate & Policy Roadmap\nImplementing a **25% cool roof requirement** on commercial and industrial buildings will reduce regional grid cooling demand by **14.6%** and drop localized ambient heat by **2.2°C**.\n\nThe proposed policy implementation phases are:";
        roadmap = [
          "Month 1-2: Formulate standard building albedo code (enforce min 0.68 reflectivity index).",
          "Month 3-6: Enact mandates for new commercial permits and distribute cool roof grants to low-income blocks.",
          "Month 6-12: Implement satellite compliance monitoring using Landsat thermal band overlays.",
          "Month 12+: Phase 2 expansion to residential sectors and public plazas."
        ];
      } else {
        aiText = "### General Climate Simulation\nI have run your query through our localized climate simulation engine. Based on the satellite telemetry, Delhi NCR requires a combined approach of **22% canopy expansion** and **cool pavements** in industrial sectors to achieve thermally stable comfort indices (Target: -4.5°C drop).\n\nKey actions:";
        roadmap = [
          "Optimize surface albedo to >0.45 in parking lots and roads.",
          "Plant native Miyawaki pockets in high-density residential blocks.",
          "Establish real-time public thermal warning hubs."
        ];
      }

      const aiMsg: Message = {
        id: `msg-ai-${Date.now()}`,
        sender: "ai",
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chartData,
        roadmap
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
      
      showToast("AI response complete.", "success");
    }, 1500);
  };

  const handleVoiceInput = () => {
    if (recognitionRef.current) {
      if (isRecording) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
    } else {
      // Speech recognition not supported in this browser
      showToast("Web Speech recognition not supported. Simulating input...", "warning");
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        handleSend("Suggest cheapest cooling strategy.");
      }, 2500);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "msg-1",
        sender: "ai",
        text: "### Logs Cleared\nChat history has been wiped. Ready for new climate intelligence query.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Export full chat transcript as TXT file
  const exportChatSession = () => {
    let log = "HEATSHIELD AI - COPILOT SESSION CONVERSATION LOG\n";
    log += `DATE: ${new Date().toLocaleDateString()}\n`;
    log += "==================================================\n\n";

    messages.forEach((m) => {
      const senderName = m.sender === "ai" ? "CLIMATE AI" : "USER ADMINISTRATOR";
      log += `[${m.timestamp}] ${senderName}:\n`;
      log += `${m.text.replace(/###/g, "").replace(/\*\*/g, "")}\n`;
      if (m.roadmap) {
        log += "Roadmap Stages:\n";
        m.roadmap.forEach((r, i) => {
          log += `  - Step ${i + 1}: ${r}\n`;
        });
      }
      log += "\n--------------------------------------------------\n\n";
    });

    const fileBlob = new Blob([log], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(fileBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "HEATSHIELD-AI-Copilot-Session-Log.txt";
    link.click();
    showToast("Chat transcript exported!", "success");
  };

  // PDF Report Generator using jsPDF (Apple/NASA styled report layout)
  const generatePDFReport = () => {
    const doc = new jsPDF();
    
    // Page 1: Title & Executive Summary
    doc.setFillColor(3, 7, 18); // Dark Space Background
    doc.rect(0, 0, 210, 297, "F");

    doc.setFont("courier", "bold");
    doc.setFontSize(28);
    doc.setTextColor(6, 182, 212); // Cyan
    doc.text("HEATSHIELD AI", 20, 60);
    
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("URBAN HEAT ISLAND MITIGATION REPORT", 20, 75);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // Muted slate
    doc.text("SUBMITTED TO: Ministry of Housing & Urban Affairs", 20, 95);
    doc.text(`DATE GENERATED: ${new Date().toLocaleDateString()}`, 20, 102);
    doc.text("CLASSIFICATION: EXECUTIVE POLICY DECISION SUPPORT", 20, 109);
    
    doc.setDrawColor(30, 41, 59);
    doc.line(20, 120, 190, 120);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text("1. EXECUTIVE SUMMARY", 20, 135);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(203, 213, 225);
    const summaryText = "This policy paper presents an AI-calculated cooling roadmap for mitigating thermal stress across regional urban centers. High-resolution satellite Landsat-9 band telemetry detects a core thermal variance exceeding 8.4C in high-density blocks compared to vegetation buffer zones. Implementing the targeted albedo interventions detailed herein is projected to achieve a net 3.2C regional surface temperature reduction.";
    const splitSummary = doc.splitTextToSize(summaryText, 170);
    doc.text(splitSummary, 20, 145);

    // Page 2: Recommendations and Timeline
    doc.addPage();
    doc.setFillColor(3, 7, 18);
    doc.rect(0, 0, 210, 297, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(6, 182, 212);
    doc.text("2. COOLING ROADMAP & POLICY MANDATES", 20, 30);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(203, 213, 225);
    
    let yPos = 45;
    const recommendations = [
      "- mandate cool roof coatings (minimum 0.65 albedo) on all commercial permits.",
      "- retrofitting residential structures in critical zones using municipal subsidies.",
      "- deploy Miyawaki pocket forests (5000+ native saplings) in high heat priority sectors.",
      "- Replace asphalt surfaces with light colored concrete pavements (albedo >0.4)."
    ];

    recommendations.forEach((rec, idx) => {
      const splitRec = doc.splitTextToSize(`${idx + 1}. ${rec}`, 170);
      doc.text(splitRec, 20, yPos);
      yPos += 15;
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(16, 185, 129); // Green
    doc.text("PROJECTED SAVINGS & ROI:", 20, yPos + 10);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text("- Energy bill AC power demand reduction: 14.6% annually", 20, yPos + 22);
    doc.text("- Carbon sequestration offset: 84.5 tons CO2 / year", 20, yPos + 30);
    doc.text("- Public heat stress clinical emergency decrease: 32%", 20, yPos + 38);

    doc.save("HEATSHIELD-AI-Policy-Roadmap.pdf");
    showToast("PDF report downloaded!", "success");
  };

  return (
    <div className="flex-1 flex flex-col space-y-6" id="ai-copilot-page">
      {/* Title Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-wider font-mono text-transparent bg-clip-text bg-gradient-to-r from-foreground to-primary">
            AI CLIMATE COPILOT
          </h2>
          <p className="text-xs text-muted-foreground font-mono uppercase mt-1">
            DECISION SUPPORT PLATFORM | AUDITING SYSTEM
          </p>
        </div>
        
        {/* PDF Export & Transcripts Button */}
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <button
            onClick={exportChatSession}
            className="px-3 py-1.5 rounded border border-border/40 hover:border-primary text-muted hover:text-foreground cursor-pointer transition-colors flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            EXPORT CHAT LOG
          </button>
          
          <button
            onClick={generatePDFReport}
            className="px-4 py-1.5 rounded bg-primary text-primary-foreground font-bold flex items-center gap-1.5 hover:bg-primary/90 transition-all cursor-pointer shadow-lg"
          >
            <FileText className="w-4 h-4" />
            EXPORT POLICY PDF
          </button>
        </div>
      </div>

      {/* Chat Layout grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* Presets Panel (Left 1 Col) */}
        <div className="glass-panel p-5 rounded-lg flex flex-col justify-between lg:col-span-1 space-y-6">
          <div className="space-y-4">
            <div className="pb-3 border-b border-border/20 text-xs font-mono font-bold text-foreground tracking-widest uppercase">
              QUICK COMMANDS
            </div>
            
            <div className="space-y-2 font-mono">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.query)}
                  className="w-full text-left p-3 rounded border border-border/30 hover:border-primary bg-card/40 hover:bg-primary/5 text-[10px] text-muted-foreground hover:text-foreground leading-relaxed cursor-pointer transition-all flex items-center justify-between gap-1 group"
                >
                  <span>{p.label}</span>
                  <Play className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          {/* Voice indicator hud */}
          <div className="glass-card p-4 rounded border border-border/40 font-mono text-[9px] text-muted-foreground space-y-2">
            <div className="flex justify-between items-center text-primary font-bold">
              <span>VOICE INTERFACE:</span>
              <span>{isRecording ? "LISTENING" : "ARMED"}</span>
            </div>
            {isRecording ? (
              <div className="flex gap-1 items-center justify-center py-2">
                <span className="w-1 h-4 bg-primary rounded animate-pulse" />
                <span className="w-1 h-6 bg-secondary rounded animate-pulse" style={{ animationDelay: "0.2s" }} />
                <span className="w-1 h-3 bg-accent rounded animate-pulse" style={{ animationDelay: "0.4s" }} />
                <span className="w-1 h-5 bg-primary rounded animate-pulse" style={{ animationDelay: "0.6s" }} />
              </div>
            ) : (
              <p className="leading-normal">
                Click microphone or toggle global voice assistant to execute queries vocally.
              </p>
            )}
          </div>
        </div>

        {/* Chat Interface Console (Right 3 Cols) */}
        <div className="lg:col-span-3 glass-panel rounded-lg flex flex-col justify-between overflow-hidden relative min-h-[500px]">
          {/* Header */}
          <div className="p-4 border-b border-border/20 flex justify-between items-center bg-card/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <div>
                <span className="font-mono text-xs font-bold text-foreground tracking-widest uppercase">
                  CLIMATE SCIENTIST AI
                </span>
                <div className="text-[8px] font-mono text-secondary mt-0.5 uppercase">SYSTEM STATUS: OPTIMAL</div>
              </div>
            </div>
            <button
              onClick={handleClearChat}
              className="p-1.5 rounded border border-border/30 hover:border-heat-red hover:text-heat-red text-muted cursor-pointer transition-colors"
              title="Clear Chat Logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Board */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((m) => {
                const isAI = m.sender === "ai";
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-4 ${!isAI ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
                      isAI 
                        ? "bg-primary/10 border-primary/20 text-primary" 
                        : "bg-secondary/10 border-secondary/20 text-secondary"
                    }`}>
                      {isAI ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                    </div>

                    {/* Speech card */}
                    <div className={`p-4 rounded-lg font-mono text-xs max-w-xl space-y-4 ${
                      isAI 
                        ? "bg-card border border-border/30 text-foreground" 
                        : "bg-primary/5 border border-primary/20 text-foreground"
                    }`}>
                      {/* Message text with custom renderer */}
                      <MarkdownRenderer text={m.text} />

                      {/* Embedded Micro-Chart */}
                      {isAI && m.chartData && (
                        <div className="p-3 bg-card/40 border border-border/40 rounded space-y-2 mt-2">
                          <span className="text-[9px] text-primary font-bold uppercase">FORECAST SIMULATION MATRIX</span>
                          <div className="space-y-1.5">
                            {m.chartData.map((cd, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <span className="w-12 text-[9px] text-muted">{cd.label}</span>
                                <div className="flex-1 h-3 bg-graphite/30 rounded overflow-hidden relative">
                                  <div 
                                    className="h-full rounded" 
                                    style={{ 
                                      width: `${(cd.value / 50) * 100}%`,
                                      backgroundColor: cd.color || "#06b6d4" 
                                    }} 
                                  />
                                </div>
                                <span className="w-12 text-right text-[9px] font-bold text-foreground">{cd.value}°C</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Embedded Roadmap */}
                      {isAI && m.roadmap && (
                        <div className="p-3 bg-card/40 border border-border/40 rounded space-y-2 mt-2">
                          <span className="text-[9px] text-secondary font-bold uppercase">POLICY STAGES</span>
                          <div className="space-y-2 text-[10px] text-muted-foreground">
                            {m.roadmap.map((step, idx) => (
                              <div key={idx} className="flex gap-2">
                                <span className="text-secondary font-bold font-mono">0{idx + 1}.</span>
                                <p className="leading-relaxed text-foreground">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Message Timestamp */}
                      <div className="text-[8px] text-muted text-right">{m.timestamp}</div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {isTyping && (
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full border bg-primary/10 border-primary/20 text-primary flex items-center justify-center">
                  <Bot className="w-4.5 h-4.5" />
                </div>
                <div className="p-3 bg-card border border-border/30 rounded-lg text-xs font-mono text-muted flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                  <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                  <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat Footer Input */}
          <div className="p-4 border-t border-border/20 bg-card/60 flex items-center gap-3">
            {/* Mic Toggle Button */}
            <button
              onClick={handleVoiceInput}
              className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                isRecording 
                  ? "border-heat-red bg-heat-red/10 text-heat-red" 
                  : "border-border/40 hover:border-primary text-muted hover:text-foreground"
              }`}
              title="Speak voice query using WebSpeech"
            >
              {isRecording ? <MicOff className="w-4.5 h-4.5 animate-pulse text-heat-red" /> : <Mic className="w-4.5 h-4.5" />}
            </button>

            {/* Input field */}
            <input
              type="text"
              placeholder="Ask AI Copilot about heat vulnerability, costs, roadmaps..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(inputText)}
              className="flex-1 bg-card border border-border/30 rounded-lg px-4 py-2.5 font-mono text-xs text-foreground focus:outline-none focus:border-primary transition-all"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSend(inputText)}
              className="p-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer transition-all"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
