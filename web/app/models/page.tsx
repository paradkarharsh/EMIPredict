"use client";

import * as React from "react";
import { Cpu, CheckCircle2 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

import { ModelPerformanceResponse } from "@/lib/types";
import { fetchModelPerformance } from "@/lib/api";
import { MetricCard } from "@/components/MetricCard";

export default function ModelsPage() {
  const [data, setData] = React.useState<ModelPerformanceResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedTab, setSelectedTab] = React.useState<"classification" | "regression">("classification");

  React.useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetchModelPerformance();
        setData(res);
      } catch (e) {
        console.error("Failed to load model performance:", e);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  // Format data for Recharts
  const clsChartData = data?.classification_models.map((m) => ({
    name: m.model_name.replace(" Classifier", "").replace("_", " "),
    Accuracy: Number(((m.accuracy || 0) * 100).toFixed(2)),
    F1: Number(((m.f1_score || 0) * 100).toFixed(2)),
    ROC_AUC: Number(((m.roc_auc || 0) * 100).toFixed(2)),
    isProduction: m.is_production,
  })) || [];

  const regChartData = data?.regression_models.map((m) => ({
    name: m.model_name.replace(" Regressor", "").replace("_", " "),
    RMSE: Math.round(m.rmse || 0),
    MAE: Math.round(m.mae || 0),
    R2: Number(((m.r2_score || 0) * 100).toFixed(2)),
    isProduction: m.is_production,
  })) || [];

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-accent-subtle border border-accent-border text-accent text-xs font-semibold tracking-tight mb-3">
          <Cpu className="w-3.5 h-3.5" />
          <span>MLflow Model Registry & Benchmark Dashboard</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-text-primary mb-3">
          Model Evaluation & Performance
        </h1>
        <p className="text-text-secondary text-base sm:text-lg max-w-2xl leading-relaxed">
          Comprehensive benchmark metrics across 8 candidate models tracked in the MLflow experiment store, validating accuracy, boundary calibration, and error bounds.
        </p>
      </div>

      {/* Top Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <MetricCard
          label="Peak Test Accuracy"
          value={97.93}
          suffix="%"
          decimals={2}
          subtext="Decision Tree Classifier"
          delta="Target > 90%"
          deltaType="positive"
        />
        <MetricCard
          label="Peak Macro F1 Score"
          value={0.9632}
          decimals={4}
          subtext="Harmonic mean of precision & recall"
          delta="Balanced"
          deltaType="positive"
        />
        <MetricCard
          label="Lowest Regression RMSE"
          value={1008.13}
          prefix="₹"
          decimals={0}
          subtext="XGBoost Regressor"
          delta="Target < ₹2,000"
          deltaType="positive"
        />
        <MetricCard
          label="Peak R² Explained Variance"
          value={99.37}
          suffix="%"
          decimals={2}
          subtext="Continuous monthly EMI fit"
          delta="Near Perfect"
          deltaType="positive"
        />
      </div>

      {/* Segmented Control Tabs */}
      <div className="flex items-center gap-2 bg-card-subtle border border-border-hairline rounded-pill p-1.5 w-fit mb-8 shadow-sm">
        <button
          onClick={() => setSelectedTab("classification")}
          className={`px-5 py-2 rounded-pill text-xs sm:text-sm font-semibold transition-all duration-150 ${
            selectedTab === "classification"
              ? "bg-surface text-text-primary shadow-sm"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Classification Models (4)
        </button>
        <button
          onClick={() => setSelectedTab("regression")}
          className={`px-5 py-2 rounded-pill text-xs sm:text-sm font-semibold transition-all duration-150 ${
            selectedTab === "regression"
              ? "bg-surface text-text-primary shadow-sm"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Regression Models (4)
        </button>
      </div>

      {/* Content depending on selected tab */}
      {selectedTab === "classification" ? (
        <div className="space-y-8">
          {/* Classification Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data?.classification_models.map((model) => (
              <div
                key={model.model_name}
                className={`glass-panel p-5 sm:p-6 flex flex-col justify-between ${
                  model.is_production
                    ? "border-accent ring-1 ring-accent/30 bg-accent-subtle/30"
                    : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-semibold text-text-primary text-base">
                      {model.model_name}
                    </span>
                    {model.is_production && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-accent text-white dark:text-black">
                        <CheckCircle2 className="w-3 h-3" />
                        Production
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-xs pt-2 border-t border-border-hairline">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Accuracy:</span>
                      <span className="font-bold text-text-primary tabular-nums">
                        {((model.accuracy || 0) * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Macro F1:</span>
                      <span className="font-bold text-text-primary tabular-nums">
                        {((model.f1_score || 0) * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Precision:</span>
                      <span className="font-bold text-text-primary tabular-nums">
                        {((model.precision || 0) * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Recall:</span>
                      <span className="font-bold text-text-primary tabular-nums">
                        {((model.recall || 0) * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">ROC AUC:</span>
                      <span className="font-bold text-accent tabular-nums">
                        {(model.roc_auc || 0).toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border-hairline text-[11px] text-text-tertiary">
                  MLflow Run: <code>{model.run_id}</code>
                </div>
              </div>
            ))}
          </div>

          {/* Classification Comparative Chart */}
          <div className="glass-panel p-6 sm:p-8">
            <h3 className="text-lg font-semibold tracking-tight text-text-primary mb-1">
              Classification Accuracy & F1 Score Benchmark (%)
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary mb-6">
              Evaluation metrics measured on the independent 80,160-record test split.
            </p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={clsChartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <XAxis
                    dataKey="name"
                    stroke="#86868B"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "var(--border-hairline)" }}
                  />
                  <YAxis
                    domain={[75, 100]}
                    stroke="#86868B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "var(--border-hairline)" }}
                    unit="%"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload;
                        return (
                          <div className="bg-surface/95 backdrop-blur-md p-3 rounded-xl border border-border-hairline shadow-lg text-xs space-y-1">
                            <div className="font-bold text-text-primary">
                              {pt.name} {pt.isProduction && "(Production)"}
                            </div>
                            <div className="text-accent">Accuracy: {pt.Accuracy}%</div>
                            <div className="text-text-secondary">F1 Score: {pt.F1}%</div>
                            <div className="text-text-tertiary">ROC AUC: {pt.ROC_AUC}%</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="Accuracy" radius={[6, 6, 0, 0]}>
                    {clsChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isProduction ? "var(--color-accent)" : "#5B6B8C"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Regression Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data?.regression_models.map((model) => (
              <div
                key={model.model_name}
                className={`glass-panel p-5 sm:p-6 flex flex-col justify-between ${
                  model.is_production
                    ? "border-accent ring-1 ring-accent/30 bg-accent-subtle/30"
                    : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-semibold text-text-primary text-base">
                      {model.model_name}
                    </span>
                    {model.is_production && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-accent text-white dark:text-black">
                        <CheckCircle2 className="w-3 h-3" />
                        Production
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-xs pt-2 border-t border-border-hairline">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">RMSE (INR):</span>
                      <span className="font-bold text-text-primary tabular-nums">
                        ₹{model.rmse?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">MAE (INR):</span>
                      <span className="font-bold text-text-primary tabular-nums">
                        ₹{model.mae?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">R² Variance:</span>
                      <span className="font-bold text-accent tabular-nums">
                        {model.r2_score?.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">MAPE:</span>
                      <span className="font-bold text-text-primary tabular-nums">
                        {model.mape?.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border-hairline text-[11px] text-text-tertiary">
                  MLflow Run: <code>{model.run_id}</code>
                </div>
              </div>
            ))}
          </div>

          {/* Regression Comparative Chart */}
          <div className="glass-panel p-6 sm:p-8">
            <h3 className="text-lg font-semibold tracking-tight text-text-primary mb-1">
              Regression Root Mean Squared Error (RMSE in INR — Lower is Better)
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary mb-6">
              Target threshold is &lt; ₹2,000 to ensure responsible credit limits.
            </p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={regChartData}
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
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload;
                        return (
                          <div className="bg-surface/95 backdrop-blur-md p-3 rounded-xl border border-border-hairline shadow-lg text-xs space-y-1">
                            <div className="font-bold text-text-primary">
                              {pt.name} {pt.isProduction && "(Production)"}
                            </div>
                            <div className="text-accent font-medium">RMSE: ₹{pt.RMSE}</div>
                            <div className="text-text-secondary">MAE: ₹{pt.MAE}</div>
                            <div className="text-text-tertiary">R² Score: {pt.R2}%</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="RMSE" radius={[6, 6, 0, 0]}>
                    {regChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isProduction ? "var(--color-accent)" : "#5B6B8C"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
