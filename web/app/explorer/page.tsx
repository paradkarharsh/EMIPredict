"use client";

import * as React from "react";
import { Database, Filter } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";

import { ExplorerStatsResponse } from "@/lib/types";
import { fetchExplorerStats } from "@/lib/api";
import { MetricCard } from "@/components/MetricCard";

const STATUS_COLORS: Record<string, string> = {
  Eligible: "#28A745",
  High_Risk: "#D97706",
  Not_Eligible: "#DC2626",
};

const SCENARIO_COLORS = [
  "#0A5C6B",
  "#2C3E6B",
  "#5B6B8C",
  "#86868B",
  "#D97706",
];

export default function ExplorerPage() {
  const [stats, setStats] = React.useState<ExplorerStatsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedScenario, setSelectedScenario] = React.useState<string>("All");
  const [salaryCap, setSalaryCap] = React.useState<number>(200000);

  React.useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetchExplorerStats();
        setStats(res);
      } catch (e) {
        console.error("Failed to load explorer stats:", e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  // Format Eligibility Breakdown
  const eligChartData = stats
    ? Object.entries(stats.eligibility_breakdown).map(([name, count]) => ({
        name: name.replace("_", " "),
        count,
        color: STATUS_COLORS[name] || "#0A5C6B",
      }))
    : [];

  // Format Scenario Share
  const scenarioChartData = stats
    ? Object.entries(stats.scenario_breakdown).map(([name, count], i) => ({
        name: name.replace(" EMI", ""),
        fullName: name,
        count,
        color: SCENARIO_COLORS[i % SCENARIO_COLORS.length],
      }))
    : [];

  // Filter Scatter Sample
  const filteredScatter = React.useMemo(() => {
    if (!stats?.scatter_sample) return [];
    return stats.scatter_sample.filter((pt) => {
      const matchScenario =
        selectedScenario === "All" || pt.emi_scenario === selectedScenario;
      const matchSalary = pt.monthly_salary <= salaryCap;
      return matchScenario && matchSalary;
    });
  }, [stats, selectedScenario, salaryCap]);

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-accent-subtle border border-accent-border text-accent text-xs font-semibold tracking-tight mb-3">
          <Database className="w-3.5 h-3.5" />
          <span>Portfolio Analytics & Exploratory Data Analysis</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-text-primary mb-3">
          Dataset & Portfolio Explorer
        </h1>
        <p className="text-text-secondary text-base sm:text-lg max-w-2xl leading-relaxed">
          Explore risk spread, scenario concentrations, and underwriting correlations across the 400,800 applicant research cohort.
        </p>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <MetricCard
          label="Total Verified Applications"
          value={stats?.total_records || 400800}
          subtext="5 retail EMI lending domains"
        />
        <MetricCard
          label="Mean Monthly Income"
          value={stats?.mean_salary || 64850}
          prefix="₹"
          decimals={0}
          subtext="Across private, govt, and self-employed"
        />
        <MetricCard
          label="Mean Credit Score"
          value={stats?.mean_credit_score || 685.4}
          decimals={1}
          subtext="CIBIL / Experian composite"
        />
        <MetricCard
          label="Mean Requested Principal"
          value={stats?.mean_requested_amount || 185000}
          prefix="₹"
          decimals={0}
          subtext="Average loan size requested"
        />
      </div>

      {/* Interactive Controls Bar */}
      <div className="glass-panel p-5 mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-3">
          <Filter className="w-3.5 h-3.5" />
          <span>Interactive Cohort Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Filter by Loan Scenario
            </label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="apple-input text-xs"
            >
              <option value="All">All Scenarios (Full Portfolio)</option>
              <option value="Personal Loan EMI">Personal Loan EMI</option>
              <option value="Vehicle EMI">Vehicle EMI</option>
              <option value="Home Appliances EMI">Home Appliances EMI</option>
              <option value="E-commerce Shopping EMI">E-commerce Shopping EMI</option>
              <option value="Education EMI">Education EMI</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-text-secondary mb-1">
              <span>Max Monthly Salary Filter</span>
              <span className="font-bold text-accent tabular-nums">
                ₹{salaryCap.toLocaleString("en-IN")}
              </span>
            </div>
            <input
              type="range"
              min={30000}
              max={350000}
              step={10000}
              value={salaryCap}
              onChange={(e) => setSalaryCap(parseInt(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />
          </div>

          <div className="text-xs text-text-tertiary flex items-center gap-2 sm:pt-4">
            <span>Filtered Sample:</span>
            <span className="font-bold text-text-primary tabular-nums">
              {filteredScatter.length} points
            </span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Chart 1: Eligibility Risk Breakdown */}
        <div className="glass-panel p-6 sm:p-7">
          <h3 className="text-lg font-semibold tracking-tight text-text-primary mb-1">
            Eligibility Risk Class Distribution
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary mb-6">
            Proportion of applicants categorized across the 3 decision tiers.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={eligChartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <XAxis
                  dataKey="name"
                  stroke="#86868B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border-hairline)" }}
                />
                <YAxis
                  stroke="#86868B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border-hairline)" }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const pt = payload[0].payload;
                      return (
                        <div className="bg-surface/95 backdrop-blur-md p-3 rounded-xl border border-border-hairline shadow-lg text-xs">
                          <div className="font-bold text-text-primary">{pt.name}</div>
                          <div className="text-text-secondary mt-1">
                            Count: {pt.count.toLocaleString("en-IN")} applications
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {eligChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Scenario Share Donut */}
        <div className="glass-panel p-6 sm:p-7">
          <h3 className="text-lg font-semibold tracking-tight text-text-primary mb-1">
            Portfolio Scenario Distribution
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary mb-6">
            Balanced representation across ~80,000 records per loan category.
          </p>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scenarioChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {scenarioChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const pt = payload[0].payload;
                      return (
                        <div className="bg-surface/95 backdrop-blur-md p-3 rounded-xl border border-border-hairline shadow-lg text-xs">
                          <div className="font-bold text-text-primary">
                            {pt.fullName}
                          </div>
                          <div className="text-text-secondary mt-1">
                            Volume: {pt.count.toLocaleString("en-IN")} records (~20%)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 3: Monthly Salary vs Max Safe EMI Scatter */}
      <div className="glass-panel p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-text-primary">
              Monthly Salary vs. Predicted Safe EMI Limit
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary">
              Scatter sample revealing how higher income unlocks progressively greater installment safety bands.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#28A745]" />
              <span className="text-text-secondary">Eligible</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
              <span className="text-text-secondary">High Risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
              <span className="text-text-secondary">Not Eligible</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <XAxis
                type="number"
                dataKey="monthly_salary"
                name="Monthly Salary"
                stroke="#86868B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "var(--border-hairline)" }}
                tickFormatter={(v) => `₹${v / 1000}k`}
              />
              <YAxis
                type="number"
                dataKey="max_monthly_emi"
                name="Max Safe EMI"
                stroke="#86868B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "var(--border-hairline)" }}
                tickFormatter={(v) => `₹${v / 1000}k`}
              />
              <ZAxis range={[25, 25]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pt = payload[0].payload;
                    return (
                      <div className="bg-surface/95 backdrop-blur-md p-3 rounded-xl border border-border-hairline shadow-lg text-xs space-y-1">
                        <div className="font-semibold text-text-primary">
                          {pt.emi_scenario}
                        </div>
                        <div className="text-accent">
                          Salary: ₹{pt.monthly_salary.toLocaleString("en-IN")}
                        </div>
                        <div className="text-text-secondary">
                          Safe Cap: ₹{pt.max_monthly_emi.toLocaleString("en-IN")}
                        </div>
                        <div className="text-text-tertiary">
                          Credit Score: {pt.credit_score} • {pt.emi_eligibility}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter data={filteredScatter}>
                {filteredScatter.map((entry, index) => (
                  <Cell
                    key={`scatter-${index}`}
                    fill={STATUS_COLORS[entry.emi_eligibility] || "#0A5C6B"}
                    fillOpacity={0.65}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
