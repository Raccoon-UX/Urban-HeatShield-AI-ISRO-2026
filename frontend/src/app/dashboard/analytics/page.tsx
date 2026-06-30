"use client";

import React from "react";
import { useDashboardState } from "../layout";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  Shield, 
  Activity, 
  ArrowUpRight,
  Download,
  FileText,
  DollarSign,
  Leaf
} from "lucide-react";

export default function AnalyticsPage() {
  const { role } = useDashboardState();

  // Chart 1: Historical Heat Timeline (1996-2026)
  const historicalData = [
    { year: "1996", temp: 37.4, anomaly: 0.0 },
    { year: "2000", temp: 38.1, anomaly: 0.7 },
    { year: "2004", temp: 38.9, anomaly: 1.5 },
    { year: "2008", temp: 39.4, anomaly: 2.0 },
    { year: "2012", temp: 40.2, anomaly: 2.8 },
    { year: "2016", temp: 40.9, anomaly: 3.5 },
    { year: "2020", temp: 41.5, anomaly: 4.1 },
    { year: "2024", temp: 41.8, anomaly: 4.4 },
    { year: "2026", temp: 42.4, anomaly: 5.0 }
  ];

  // Chart 2: Urban Surface Materials Distribution
  const materialsData = [
    { name: "Asphalt Roads", value: 35, color: "#1f2937" },
    { name: "Concrete Pavements", value: 25, color: "#4b5563" },
    { name: "Roofs (Standard)", value: 20, color: "#9ca3af" },
    { name: "Green Canopy", value: 16, color: "#10b981" },
    { name: "Water Bodies", value: 4, color: "#0ea5e9" }
  ];

  // Chart 3: Projected Financial ROI of cooling strategies ($M saved)
  const energySavingsData = [
    { year: "Year 1", activeTarget: 0.8, baseline: 0.0 },
    { year: "Year 2", activeTarget: 2.1, baseline: 0.5 },
    { year: "Year 3", activeTarget: 4.8, baseline: 1.2 },
    { year: "Year 4", activeTarget: 8.4, baseline: 2.4 },
    { year: "Year 5", activeTarget: 12.6, baseline: 3.8 }
  ];

  return (
    <div className="flex-1 flex flex-col space-y-6" id="analytics-page">
      {/* Title Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-wider font-mono text-transparent bg-clip-text bg-gradient-to-r from-white to-primary">
            ANALYTICS & DEEP REPORTING
          </h2>
          <p className="text-xs text-muted-foreground font-mono uppercase mt-1">
            DECADE SURFACE TREND ANALYZER | DATABASE SECURE
          </p>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-lg font-mono relative overflow-hidden">
          <div className="text-[10px] text-muted uppercase">30-Year Anomaly</div>
          <div className="text-2xl font-bold text-heat-red mt-1">+5.0°C Increase</div>
          <p className="text-[9px] text-muted-foreground mt-2 leading-relaxed">
            Regional heat trap index exceeds national threshold by 12.8%.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-lg font-mono relative overflow-hidden">
          <div className="text-[10px] text-muted uppercase">Vegetation Deficit</div>
          <div className="text-2xl font-bold text-accent mt-1">-8.6% Canopy Loss</div>
          <p className="text-[9px] text-muted-foreground mt-2 leading-relaxed">
            Industrial commercial growth is primary driver for canopy reduction.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-lg font-mono relative overflow-hidden">
          <div className="text-[10px] text-muted uppercase">Projected AC Savings</div>
          <div className="text-2xl font-bold text-secondary mt-1">$12.6M / Year</div>
          <p className="text-[9px] text-muted-foreground mt-2 leading-relaxed">
            Full compliance with 25% albedo guidelines minimizes power strain.
          </p>
        </div>
      </div>

      {/* Grid of Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Historical Heat Trend (Line Chart - 2 Cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-lg flex flex-col justify-between min-h-[350px]">
          <div className="pb-3 border-b border-border/20 flex justify-between items-center text-xs font-mono font-bold text-foreground tracking-widest uppercase">
            <span>HISTORICAL LAND TEMP TREND (1996 - 2026)</span>
            <span className="text-[10px] text-heat-red font-bold">LST INCREASE</span>
          </div>

          <div className="flex-1 flex items-center justify-center p-2 mt-4">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
                <XAxis dataKey="year" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[35, 45]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card-bg)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px"
                  }}
                  labelStyle={{ color: "var(--fg)", fontFamily: "monospace", fontSize: "10px" }}
                  itemStyle={{ fontFamily: "monospace", fontSize: "10px" }}
                />
                <Line
                  type="monotone"
                  dataKey="temp"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={{ fill: "#ef4444", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Materials Composition (Pie Chart - 1 Col) */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-lg flex flex-col justify-between min-h-[350px]">
          <div className="pb-3 border-b border-border/20 text-xs font-mono font-bold text-foreground tracking-widest uppercase">
            SURFACE MATERIAL COMPOSITION
          </div>

          <div className="flex-1 flex items-center justify-center p-2">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={materialsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {materialsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card-bg)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px"
                  }}
                  itemStyle={{ fontFamily: "monospace", fontSize: "10px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Legends */}
          <div className="space-y-1.5 font-mono text-[9px] text-muted-foreground mt-2">
            {materialsData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* ROI Projections (Area Chart - 2 Cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-lg flex flex-col justify-between min-h-[350px]">
          <div className="pb-3 border-b border-border/20 flex justify-between items-center text-xs font-mono font-bold text-foreground tracking-widest uppercase">
            <span>PROJECTED ENERGY SAVINGS TARGETS ($M SAVED)</span>
            <span className="text-[10px] text-secondary font-bold">5-YEAR CAPEX DECREASE</span>
          </div>

          <div className="flex-1 flex items-center justify-center p-2 mt-4">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={energySavingsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
                <XAxis dataKey="year" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card-bg)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px"
                  }}
                  labelStyle={{ color: "var(--fg)", fontFamily: "monospace", fontSize: "10px" }}
                  itemStyle={{ fontFamily: "monospace", fontSize: "10px" }}
                />
                <Area
                  type="monotone"
                  dataKey="activeTarget"
                  stroke="#10b981"
                  fill="rgba(16, 185, 129, 0.15)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="baseline"
                  stroke="#ef4444"
                  fill="rgba(239, 68, 68, 0.05)"
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Government Policy Compliance List (1 Col) */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-lg flex flex-col justify-between min-h-[350px]">
          <div className="space-y-4">
            <div className="pb-3 border-b border-border/20 text-xs font-mono font-bold text-foreground tracking-widest uppercase">
              COMPLIANCE AUDIT INDEX
            </div>
            
            <div className="space-y-3 font-mono text-[10px]">
              <div className="p-2.5 rounded bg-secondary/5 border border-secondary/20 flex justify-between items-center">
                <div>
                  <div className="font-bold text-foreground">REFORESTATION ACT</div>
                  <div className="text-muted-foreground mt-0.5">District canopy &gt; 15%</div>
                </div>
                <span className="text-secondary font-bold uppercase">PASSED</span>
              </div>

              <div className="p-2.5 rounded bg-heat-red/5 border border-heat-red/20 flex justify-between items-center">
                <div>
                  <div className="font-bold text-foreground">ALBEDO PERMIT CODE</div>
                  <div className="text-muted-foreground mt-0.5">Rooftop albedo &gt; 0.50</div>
                </div>
                <span className="text-heat-red font-bold uppercase">FAILING</span>
              </div>

              <div className="p-2.5 rounded bg-secondary/5 border border-secondary/20 flex justify-between items-center">
                <div>
                  <div className="font-bold text-foreground">WETLAND CONSERVANCY</div>
                  <div className="text-muted-foreground mt-0.5">Ponds and hydrology cover</div>
                </div>
                <span className="text-secondary font-bold uppercase">PASSED</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/20 text-[9px] font-mono text-muted leading-relaxed">
            Compliance indices are compiled daily using ISRO INSAT and NASA Landsat thermal band classifications.
          </div>
        </div>

      </div>
    </div>
  );
}
