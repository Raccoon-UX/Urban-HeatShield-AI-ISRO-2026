"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useDashboardState } from "../layout";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { 
  Shield, 
  DollarSign, 
  Clock, 
  Zap, 
  CheckCircle,
  HelpCircle,
  Briefcase,
  Layers,
  Heart,
  Trees
} from "lucide-react";

interface Intervention {
  id: string;
  name: string;
  category: string;
  coolingPower: number; // temp drop factor
  costPerUnit: number; // cost index
  unit: string;
  carbonScore: number; // CO2 absorption
  timelineMonths: number; // timeline to deploy
  popBenefitIndex: number; // population benefit score
  description: string;
  icon: React.ComponentType<any>;
}

function CoolingSimulatorContent() {
  const { role } = useDashboardState();
  const searchParams = useSearchParams();

  // Get query values if navigated from Digital Twin
  const twinCost = parseFloat(searchParams.get("cost") || "0");
  const twinTempDrop = parseFloat(searchParams.get("tempDrop") || "0");

  // State for toggled interventions
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>([
    "cool-roof", "urban-forest"
  ]);

  const interventions: Intervention[] = [
    {
      id: "cool-roof",
      name: "Cool Roof Paint",
      category: "Material Albedo",
      coolingPower: 2.8,
      costPerUnit: 12,
      unit: "sqm",
      carbonScore: 2,
      timelineMonths: 2,
      popBenefitIndex: 85,
      description: "Apply highly reflective elastomeric coatings to concrete rooftops, reducing roof temperature by up to 15°C.",
      icon: Layers
    },
    {
      id: "green-roof",
      name: "Green Roof Gardens",
      category: "Greening",
      coolingPower: 1.8,
      costPerUnit: 85,
      unit: "sqm",
      carbonScore: 18,
      timelineMonths: 6,
      popBenefitIndex: 72,
      description: "Cover roofs with active vegetation to reduce storm runoff, insulate buildings, and cool via evapotranspiration.",
      icon: Briefcase
    },
    {
      id: "urban-forest",
      name: "Urban Pocket Forests",
      category: "Greening",
      coolingPower: 4.2,
      costPerUnit: 18000,
      unit: "hectare",
      carbonScore: 92,
      timelineMonths: 18,
      popBenefitIndex: 96,
      description: "Densely plant native saplings using the Miyawaki method to create fast-growing biological cooling sinks.",
      icon: Trees
    },
    {
      id: "reflective-pave",
      name: "Reflective Pavements",
      category: "Material Albedo",
      coolingPower: 2.2,
      costPerUnit: 28,
      unit: "sqm",
      carbonScore: 4,
      timelineMonths: 4,
      popBenefitIndex: 78,
      description: "Replace blacktop asphalt with high-albedo polymer-modified light concrete to prevent road heat storage.",
      icon: Shield
    },
    {
      id: "water-features",
      name: "Retention Ponds & Ponds",
      category: "Hydrology",
      coolingPower: 3.1,
      costPerUnit: 120000,
      unit: "installation",
      carbonScore: 10,
      timelineMonths: 12,
      popBenefitIndex: 90,
      description: "Integrate water retention systems and fountains inside public parks to lower localized ambient heat.",
      icon: HelpCircle
    }
  ];

  const handleToggle = (id: string) => {
    setSelectedInterventions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Aggregate stats based on chosen options
  const totals = useMemo(() => {
    let cooling = 0;
    let cost = 0;
    let carbon = 0;
    let timeline = 0;
    let popBenefitSum = 0;

    selectedInterventions.forEach((id) => {
      const item = interventions.find((x) => x.id === id);
      if (item) {
        cooling += item.coolingPower;
        // Mock default scale of 10,000 units per intervention for budget calculations
        cost += item.costPerUnit * (item.id.includes("forest") || item.id.includes("water") ? 5 : 15000);
        carbon += item.carbonScore * 2;
        timeline = Math.max(timeline, item.timelineMonths);
        popBenefitSum += item.popBenefitIndex;
      }
    });

    const averagePopBenefit = selectedInterventions.length > 0 
      ? Math.round(popBenefitSum / selectedInterventions.length) 
      : 0;

    return {
      cooling: parseFloat(cooling.toFixed(1)),
      cost,
      carbon,
      timeline,
      popBenefit: averagePopBenefit,
      roiScore: selectedInterventions.length > 0 ? Math.min(99, Math.round((cooling * 200000) / (cost / 1000) + 40)) : 0
    };
  }, [selectedInterventions]);

  // Chart data comparing individual efficiency (Cooling power vs Cost index)
  const chartData = interventions.map((item) => ({
    name: item.name,
    "Cooling Power (°C)": item.coolingPower,
    "Cost Factor": Math.round(item.costPerUnit / 10) || 1
  }));

  // Radar chart data for the current active strategy profile
  const radarData = [
    { subject: "Cooling Speed", value: totals.cooling * 18 },
    { subject: "Eco Value", value: totals.carbon * 4 },
    { subject: "Low Budget", value: Math.max(10, 100 - totals.cost / 6000) },
    { subject: "Fast Build", value: Math.max(10, 100 - totals.timeline * 5) },
    { subject: "Citizen Comfort", value: totals.popBenefit }
  ];

  return (
    <div className="flex-1 flex flex-col space-y-6" id="cooling-simulator-page">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-wider font-mono text-transparent bg-clip-text bg-gradient-to-r from-white to-primary">
          COOLING INTERVENTIONS SIMULATOR
        </h2>
        <p className="text-xs text-muted-foreground font-mono uppercase mt-1">
          SCENARIO COST/BENEFIT MODELER | METRICS AUDITED
        </p>
      </div>

      {/* Main layout: Selection on left, Chart + Aggregated numbers on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* INTERVENTION LIST (Left column) */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-lg flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="pb-3 border-b border-border/20 flex justify-between items-center">
              <span className="font-mono text-xs font-bold text-foreground tracking-widest flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-primary" />
                STRATEGY PORTFOLIO
              </span>
              <span className="text-[9px] font-mono text-muted uppercase">SELECT STRATEGIES</span>
            </div>

            {/* Checklist */}
            <div className="space-y-3 font-mono">
              {interventions.map((item) => {
                const isChecked = selectedInterventions.includes(item.id);
                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggle(item.id)}
                    className={`p-3 rounded border transition-all cursor-pointer select-none ${
                      isChecked
                        ? "bg-primary/10 border-primary/40 text-primary font-bold"
                        : "bg-graphite/20 border-border/30 text-muted hover:border-muted hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="rounded border-border bg-transparent text-primary focus:ring-0 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="flex items-center gap-1">
                            <Icon className="w-3.5 h-3.5 text-primary" />
                            {item.name}
                          </span>
                          <span className={isChecked ? "text-secondary" : "text-muted"}>
                            -{item.coolingPower}°C
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick HUD Tip */}
          <div className="p-3 bg-secondary/5 border border-secondary/20 rounded font-mono text-[9px] text-muted-foreground leading-relaxed">
            Combine **Cool Roof Paint** (albedo enhancement) with **Urban Pocket Forests** (microclimate greening) for a balanced high-efficiency cooling result.
          </div>
        </div>

        {/* METRICS & CHARTS (Right 2 columns) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Top Row: Aggregated metrics bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Cooling Drop */}
            <div className="glass-panel p-4 rounded text-center font-mono relative overflow-hidden">
              <div className="text-[10px] text-muted uppercase">Aggregated Cooling</div>
              <div className="text-2xl font-bold text-secondary mt-1">-{totals.cooling}°C</div>
              <div className="text-[9px] text-muted-foreground mt-1 uppercase">Ambient Drop</div>
            </div>

            {/* Total Budget */}
            <div className="glass-panel p-4 rounded text-center font-mono relative overflow-hidden">
              <div className="text-[10px] text-muted uppercase">Projected Cost</div>
              <div className="text-2xl font-bold text-foreground mt-1">
                ${totals.cost >= 1000000 ? `${(totals.cost / 1000000).toFixed(2)}M` : `${(totals.cost / 1000).toFixed(0)}k`}
              </div>
              <div className="text-[9px] text-muted-foreground mt-1 uppercase">EST CAPEX</div>
            </div>

            {/* Carbon score */}
            <div className="glass-panel p-4 rounded text-center font-mono relative overflow-hidden">
              <div className="text-[10px] text-muted uppercase">Eco Shield Score</div>
              <div className="text-2xl font-bold text-primary mt-1">+{totals.carbon} pts</div>
              <div className="text-[9px] text-muted-foreground mt-1 uppercase">Carbon Metric</div>
            </div>

            {/* Timeline */}
            <div className="glass-panel p-4 rounded text-center font-mono relative overflow-hidden">
              <div className="text-[10px] text-muted uppercase">Deployment Phase</div>
              <div className="text-2xl font-bold text-accent mt-1">{totals.timeline} months</div>
              <div className="text-[9px] text-muted-foreground mt-1 uppercase">Max Duration</div>
            </div>
          </div>

          {/* Bottom Row: Charts Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch flex-1">
            {/* Radar chart of Active Strategy Profile */}
            <div className="glass-panel p-5 rounded-lg flex flex-col justify-between min-h-[300px]">
              <div className="pb-3 border-b border-border/20 text-xs font-mono font-bold text-foreground tracking-widest uppercase">
                STRATEGY PERFORMANCE PROFILE
              </div>
              <div className="flex-1 flex items-center justify-center p-2">
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="var(--border-color)" />
                    <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={10} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--border-color)" tick={false} />
                    <Radar
                      name="Active Strategy"
                      dataKey="value"
                      stroke="#06b6d4"
                      fill="#06b6d4"
                      fillOpacity={0.25}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recharts Bar Comparison of Interventions */}
            <div className="glass-panel p-5 rounded-lg flex flex-col justify-between min-h-[300px]">
              <div className="pb-3 border-b border-border/20 text-xs font-mono font-bold text-foreground tracking-widest uppercase">
                COOLING EFFICIENCY BY INTERVENTION
              </div>
              <div className="flex-1 flex items-center justify-center p-2">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={8} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card-bg)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "6px"
                      }}
                      labelStyle={{ color: "var(--fg)", fontFamily: "monospace", fontSize: "10px" }}
                      itemStyle={{ fontFamily: "monospace", fontSize: "10px" }}
                    />
                    <Bar dataKey="Cooling Power (°C)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="glass-panel p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono">
            <span className="text-muted text-center sm:text-left">
              Current scenario yields an overall ROI rating of <span className="text-secondary font-bold">{totals.roiScore}/100</span>.
            </span>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = `/dashboard/copilot?cooling=${totals.cooling}&cost=${totals.cost}&timeline=${totals.timeline}`;
                }
              }}
              className="px-6 py-2.5 rounded bg-primary text-primary-foreground font-bold tracking-wider hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              CONFIRM POLICY ALIGNMENT
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function CoolingSimulatorPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center font-mono text-xs text-muted">
        LOADING SIMULATION SCENARIO...
      </div>
    }>
      <CoolingSimulatorContent />
    </Suspense>
  );
}
