"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  User,
  Briefcase,
  Home,
  Receipt,
  CreditCard,
  Sparkles,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Check,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";

import { LoanApplicationInput, FullPredictionResponse } from "@/lib/types";
import { PRESET_PROFILES } from "@/lib/presets";
import { fetchFullPrediction } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { CountUpNumber } from "@/components/CountUpNumber";

const SCENARIO_CARDS = [
  {
    id: "Personal Loan EMI",
    name: "Personal Loan",
    category: "General Liquidity",
    image: "/images/scenario_personal_loan.jpg",
    defaultAmount: 150000,
    defaultTenure: 24,
  },
  {
    id: "Vehicle EMI",
    name: "Vehicle Loan",
    category: "Car & Bike",
    image: "/images/scenario_vehicle.jpg",
    defaultAmount: 400000,
    defaultTenure: 48,
  },
  {
    id: "Home Appliances EMI",
    name: "Home Appliances",
    category: "Consumer Durable",
    image: "/images/scenario_home_appliances.jpg",
    defaultAmount: 80000,
    defaultTenure: 12,
  },
  {
    id: "Education EMI",
    name: "Education Loan",
    category: "Higher Studies",
    image: "/images/scenario_education.jpg",
    defaultAmount: 250000,
    defaultTenure: 36,
  },
  {
    id: "E-commerce Shopping EMI",
    name: "E-Commerce",
    category: "Online Purchase",
    image: "/images/scenario_ecommerce.jpg",
    defaultAmount: 35000,
    defaultTenure: 6,
  },
];

const DEFAULT_FORM: LoanApplicationInput = {
  age: 32,
  gender: "Male",
  marital_status: "Single",
  education: "Graduate",
  monthly_salary: 65000,
  employment_type: "Private",
  years_of_employment: 6,
  company_type: "Private Ltd",
  house_type: "Rented",
  monthly_rent: 12000,
  family_size: 3,
  dependents: 1,
  school_fees: 3000,
  college_fees: 0,
  travel_expenses: 4000,
  groceries_utilities: 10000,
  other_monthly_expenses: 3000,
  existing_loans: "Yes",
  current_emi_amount: 8000,
  credit_score: 740,
  bank_balance: 120000,
  emergency_fund: 50000,
  emi_scenario: "Personal Loan EMI",
  requested_amount: 150000,
  requested_tenure: 24,
};

export default function PredictPage() {
  const [formData, setFormData] = React.useState<LoanApplicationInput>(DEFAULT_FORM);
  const [activePreset, setActivePreset] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<FullPredictionResponse | null>(null);

  const handleInputChange = (
    field: keyof LoanApplicationInput,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setActivePreset(null);
  };

  const handleScenarioCardSelect = (scenario: typeof SCENARIO_CARDS[0]) => {
    setFormData((prev) => ({
      ...prev,
      emi_scenario: scenario.id,
      requested_amount: scenario.defaultAmount,
      requested_tenure: scenario.defaultTenure,
    }));
    setActivePreset(null);
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = PRESET_PROFILES.find((p) => p.id === presetId);
    if (preset) {
      setFormData(preset.data);
      setActivePreset(presetId);
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetchFullPrediction(formData);
      setResult(response);
      window.scrollTo({ top: 120, behavior: "smooth" });
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message || "Failed to connect to ML prediction service. Ensure API is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const probabilityData = result
    ? [
        {
          name: "Eligible",
          value: Math.round(result.eligibility.probabilities.Eligible * 100),
          color: "#28A745",
        },
        {
          name: "High Risk",
          value: Math.round(result.eligibility.probabilities.High_Risk * 100),
          color: "#D97706",
        },
        {
          name: "Not Eligible",
          value: Math.round(result.eligibility.probabilities.Not_Eligible * 100),
          color: "#DC2626",
        },
      ]
    : [];

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-accent-subtle border border-accent-border text-accent text-xs font-semibold tracking-tight mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Production AI Underwriting & Affordability Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-text-primary mb-3">
          Credit Risk & Safe EMI Assessment
        </h1>
        <p className="text-text-secondary text-base sm:text-lg max-w-2xl leading-relaxed">
          Select your loan vertical and verify your cashflow capacity with dual-model machine learning trained on 400,000 verified credit records.
        </p>
      </div>

      {/* STEP 1: VISUAL LOAN SCENARIO SELECTOR */}
      <div className="mb-8 glass-panel p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              Step 1
            </span>
            <h2 className="text-base font-bold text-text-primary">
              Choose Loan Scenario
            </h2>
          </div>
          <span className="text-xs text-text-tertiary">
            Selected: <span className="font-semibold text-text-primary">{formData.emi_scenario}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {SCENARIO_CARDS.map((scenario) => {
            const isSelected = formData.emi_scenario === scenario.id;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => handleScenarioCardSelect(scenario)}
                className={`text-left rounded-xl overflow-hidden border transition-all duration-200 relative group flex flex-col ${
                  isSelected
                    ? "border-accent ring-2 ring-accent/30 shadow-md bg-accent-subtle/40"
                    : "border-border-hairline hover:border-border-subtle bg-surface/60"
                }`}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-card-subtle">
                  <img
                    src={scenario.image}
                    alt={scenario.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent text-white dark:text-black flex items-center justify-center shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-[10px] text-text-tertiary font-medium">
                    {scenario.category}
                  </div>
                  <div className="text-xs font-bold text-text-primary">
                    {scenario.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: PRESET PROFILES TOOLBAR */}
      <div className="mb-8 glass-panel p-4 sm:p-5">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              Step 2
            </span>
            <span className="text-xs font-semibold text-text-secondary ml-2">
              Quick-Fill Test Borrower Profiles (Optional)
            </span>
          </div>
          {activePreset && (
            <span className="text-xs text-accent font-medium">
              Loaded: {PRESET_PROFILES.find((p) => p.id === activePreset)?.name}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESET_PROFILES.map((preset) => {
            const isSelected = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset.id)}
                className={`text-left p-3 rounded-xl border text-xs transition-all duration-150 flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? "bg-accent-subtle border-accent text-text-primary shadow-sm"
                    : "bg-surface/60 border-border-hairline hover:bg-card-subtle text-text-secondary hover:text-text-primary"
                }`}
              >
                <div className="font-semibold text-[13px] text-text-primary">
                  {preset.name}
                </div>
                <div className="text-text-tertiary line-clamp-1">
                  {preset.description}
                </div>
                <div className="text-[11px] font-medium text-accent">
                  {preset.badge}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-8 p-4 rounded-xl bg-status-danger-bg border border-status-danger/30 text-status-danger flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Flow: Result View OR Form View */}
      <AnimatePresence mode="wait">
        {result ? (
          /* =========================================================================
             PREDICTION RESULT VIEW (THE SIGNATURE APPLE-FINTECH MOMENT)
             ========================================================================= */
          <motion.div
            key="result-view"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            {/* Top Bar with Reset CTA */}
            <div className="flex items-center justify-between pb-4 border-b border-border-hairline">
              <div className="text-sm text-text-secondary">
                Assessment computed for{" "}
                <span className="font-semibold text-text-primary">
                  {formData.gender === "Male" ? "Male" : "Female"}, {formData.age} yrs
                </span>{" "}
                • Salary: ₹{formData.monthly_salary.toLocaleString("en-IN")}/mo • Scenario: {formData.emi_scenario}
              </div>
              <button
                onClick={handleReset}
                className="apple-button-secondary !py-1.5 !px-3.5 !text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Adjust Parameters</span>
              </button>
            </div>

            {/* Dual Hero Moment Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Hero: Classification */}
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-6 glass-panel p-6 sm:p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-3">
                    Underwriting Decision
                  </div>
                  <div className="mb-4">
                    <StatusBadge
                      status={result.eligibility.prediction}
                      size="lg"
                    />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary mb-3">
                    {result.eligibility.prediction.replace("_", " ")}
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed mb-6">
                    {result.eligibility.explanation}
                  </p>
                </div>

                {/* Probability Distribution Bar */}
                <div className="pt-4 border-t border-border-hairline">
                  <div className="flex items-center justify-between text-xs font-medium text-text-secondary mb-2">
                    <span>Model Decision Confidence</span>
                    <span className="tabular-nums font-semibold text-text-primary">
                      {(result.eligibility.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {probabilityData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2 text-xs">
                        <span className="w-20 text-text-secondary">{item.name}</span>
                        <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden border border-border-hairline">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                        <span className="w-8 text-right tabular-nums text-text-tertiary">
                          {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Right Hero: Max Safe EMI */}
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-6 glass-panel p-6 sm:p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-3">
                    Quantified Safe Installment Ceiling
                  </div>
                  <div className="text-4xl sm:text-5xl font-bold tracking-tight text-text-primary tabular-nums mb-2">
                    <CountUpNumber
                      value={result.affordability.max_monthly_emi}
                      prefix="₹"
                      decimals={2}
                    />
                    <span className="text-lg sm:text-xl font-normal text-text-secondary ml-2">
                      / month
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed mb-6">
                    {result.affordability.explanation}
                  </p>
                </div>

                {/* Capacity Buffer Strip */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border-hairline">
                  <div className="p-3 rounded-xl bg-surface/60 border border-border-hairline">
                    <div className="text-xs text-text-tertiary mb-1">
                      Post-EMI Safety Buffer
                    </div>
                    <div className="text-lg font-bold text-text-primary tabular-nums">
                      <CountUpNumber
                        value={result.affordability.buffer_remaining}
                        prefix="₹"
                        decimals={0}
                      />
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface/60 border border-border-hairline">
                    <div className="text-xs text-text-tertiary mb-1">
                      Projected FOIR Usage
                    </div>
                    <div className="text-lg font-bold text-text-primary tabular-nums">
                      <CountUpNumber
                        value={result.affordability.foir_percentage}
                        suffix="%"
                        decimals={1}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Financial Health Metrics Grid */}
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-text-primary mb-3">
                Key Cashflow & Solvency Ratios
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="glass-panel p-3.5">
                  <div className="text-[11px] text-text-tertiary mb-1">
                    Monthly Disposable
                  </div>
                  <div className="text-base font-bold text-text-primary tabular-nums">
                    ₹{result.eligibility.financial_ratios.disposable_income.toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="glass-panel p-3.5">
                  <div className="text-[11px] text-text-tertiary mb-1">
                    Requested EMI
                  </div>
                  <div className="text-base font-bold text-text-primary tabular-nums">
                    ₹{result.eligibility.financial_ratios.projected_requested_emi.toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="glass-panel p-3.5">
                  <div className="text-[11px] text-text-tertiary mb-1">
                    Total DTI Ratio
                  </div>
                  <div className="text-base font-bold text-text-primary tabular-nums">
                    {result.eligibility.financial_ratios.debt_to_income_ratio.toFixed(1)}%
                  </div>
                </div>

                <div className="glass-panel p-3.5">
                  <div className="text-[11px] text-text-tertiary mb-1">
                    Expense / Income
                  </div>
                  <div className="text-base font-bold text-text-primary tabular-nums">
                    {result.eligibility.financial_ratios.expense_to_income_ratio.toFixed(1)}%
                  </div>
                </div>

                <div className="glass-panel p-3.5">
                  <div className="text-[11px] text-text-tertiary mb-1">
                    Affordability Score
                  </div>
                  <div className="text-base font-bold text-text-primary tabular-nums">
                    {result.eligibility.financial_ratios.affordability_ratio.toFixed(1)}%
                  </div>
                </div>

                <div className="glass-panel p-3.5">
                  <div className="text-[11px] text-text-tertiary mb-1">
                    Composite Risk
                  </div>
                  <div className="text-base font-bold text-text-primary tabular-nums">
                    {result.eligibility.financial_ratios.composite_risk_score.toFixed(0)} / 100
                  </div>
                </div>
              </div>
            </div>

            {/* Tenure Sensitivity Interactive Chart */}
            <div className="glass-panel p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-text-primary">
                    Tenure Sensitivity & Affordability Threshold
                  </h2>
                  <p className="text-xs sm:text-sm text-text-secondary">
                    Required installment across 6 to 84 months vs. applicant safe limit (₹{result.affordability.max_monthly_emi.toLocaleString("en-IN")})
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-accent" />
                    <span className="text-text-secondary">Required EMI</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-status-danger border-t border-dashed border-status-danger" />
                    <span className="text-text-secondary">Safe Ceiling</span>
                  </div>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={result.affordability.sensitivity_curve}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="tenure_months"
                      stroke="#86868B"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: "var(--border-hairline)" }}
                      unit=" mo"
                    />
                    <YAxis
                      stroke="#86868B"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: "var(--border-hairline)" }}
                      tickFormatter={(v) => `₹${v / 1000}k`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const pt = payload[0].payload;
                          return (
                            <div className="bg-surface/95 backdrop-blur-md p-3 rounded-xl border border-border-hairline shadow-lg text-xs">
                              <div className="font-semibold text-text-primary mb-1">
                                {pt.tenure_months} Months Tenure
                              </div>
                              <div className="text-accent font-medium">
                                Required EMI: ₹{pt.required_emi.toLocaleString("en-IN")}
                              </div>
                              <div
                                className={`mt-1 font-medium ${
                                  pt.is_affordable
                                    ? "text-status-success"
                                    : "text-status-danger"
                                }`}
                              >
                                {pt.is_affordable
                                  ? "✓ Within Safe Limit"
                                  : "✕ Exceeds Safe Cap"}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine
                      y={result.affordability.max_monthly_emi}
                      stroke="#DC2626"
                      strokeDasharray="4 4"
                      label={{
                        value: "Max Safe Cap",
                        fill: "#DC2626",
                        fontSize: 10,
                        position: "right",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="required_emi"
                      stroke="var(--color-accent)"
                      strokeWidth={2.75}
                      dot={{ r: 4, fill: "var(--color-accent)" }}
                      activeDot={{ r: 6, fill: "var(--color-accent)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Reset Button */}
            <div className="text-center pt-4">
              <button onClick={handleReset} className="apple-button-primary !px-8">
                Perform Another Assessment
              </button>
            </div>
          </motion.div>
        ) : (
          /* =========================================================================
             FORM VIEW (5 STRUCTURED GLASS SECTIONS)
             ========================================================================= */
          <motion.form
            key="form-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Section 1 & 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. Demographics */}
              <div className="glass-panel p-6 sm:p-7">
                <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-border-hairline">
                  <div className="w-8 h-8 rounded-lg bg-accent-subtle border border-accent-border flex items-center justify-center text-accent">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary text-base">
                      1. Personal Demographics
                    </h3>
                    <p className="text-xs text-text-tertiary">
                      Age, gender, marital status, education level
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      min={18}
                      max={75}
                      value={formData.age}
                      onChange={(e) =>
                        handleInputChange("age", parseInt(e.target.value) || 0)
                      }
                      className="apple-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      className="apple-input"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Marital Status
                    </label>
                    <select
                      value={formData.marital_status}
                      onChange={(e) =>
                        handleInputChange("marital_status", e.target.value)
                      }
                      className="apple-input"
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Education Level
                    </label>
                    <select
                      value={formData.education}
                      onChange={(e) =>
                        handleInputChange("education", e.target.value)
                      }
                      className="apple-input"
                    >
                      <option value="High School">High School</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Post Graduate">Post Graduate</option>
                      <option value="Professional">Professional</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Employment & Income */}
              <div className="glass-panel p-6 sm:p-7">
                <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-border-hairline">
                  <div className="w-8 h-8 rounded-lg bg-accent-subtle border border-accent-border flex items-center justify-center text-accent">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary text-base">
                      2. Employment & Income
                    </h3>
                    <p className="text-xs text-text-tertiary">
                      Salary, employment sector, experience, entity
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Monthly Salary (INR)
                    </label>
                    <input
                      type="number"
                      min={10000}
                      max={1000000}
                      step={1000}
                      value={formData.monthly_salary}
                      onChange={(e) =>
                        handleInputChange(
                          "monthly_salary",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="apple-input tabular-nums font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Employment Sector
                    </label>
                    <select
                      value={formData.employment_type}
                      onChange={(e) =>
                        handleInputChange("employment_type", e.target.value)
                      }
                      className="apple-input"
                    >
                      <option value="Private">Private</option>
                      <option value="Government">Government</option>
                      <option value="Self-employed">Self-employed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={formData.years_of_employment}
                      onChange={(e) =>
                        handleInputChange(
                          "years_of_employment",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="apple-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Company Type
                    </label>
                    <select
                      value={formData.company_type}
                      onChange={(e) =>
                        handleInputChange("company_type", e.target.value)
                      }
                      className="apple-input"
                    >
                      <option value="Private Ltd">Private Ltd</option>
                      <option value="MNC">MNC</option>
                      <option value="Public Sector">Public Sector</option>
                      <option value="Startup">Startup</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3 & 4 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 3. Housing & Family */}
              <div className="glass-panel p-6 sm:p-7">
                <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-border-hairline">
                  <div className="w-8 h-8 rounded-lg bg-accent-subtle border border-accent-border flex items-center justify-center text-accent">
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary text-base">
                      3. Housing & Family
                    </h3>
                    <p className="text-xs text-text-tertiary">
                      Residence ownership, rent, family & dependent count
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      House Ownership
                    </label>
                    <select
                      value={formData.house_type}
                      onChange={(e) =>
                        handleInputChange("house_type", e.target.value)
                      }
                      className="apple-input"
                    >
                      <option value="Rented">Rented</option>
                      <option value="Own">Own</option>
                      <option value="Family">Family</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Monthly Rent (INR)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={200000}
                      step={500}
                      value={formData.monthly_rent}
                      onChange={(e) =>
                        handleInputChange(
                          "monthly_rent",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="apple-input tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Family Size
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={formData.family_size}
                      onChange={(e) =>
                        handleInputChange(
                          "family_size",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="apple-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Financial Dependents
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={formData.dependents}
                      onChange={(e) =>
                        handleInputChange(
                          "dependents",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="apple-input"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 4. Monthly Obligations */}
              <div className="glass-panel p-6 sm:p-7">
                <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-border-hairline">
                  <div className="w-8 h-8 rounded-lg bg-accent-subtle border border-accent-border flex items-center justify-center text-accent">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary text-base">
                      4. Monthly Living Expenses (INR)
                    </h3>
                    <p className="text-xs text-text-tertiary">
                      School, college, travel, utilities, and other living costs
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      School Fees
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={500}
                      value={formData.school_fees}
                      onChange={(e) =>
                        handleInputChange(
                          "school_fees",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="apple-input tabular-nums text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      College Fees
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={500}
                      value={formData.college_fees}
                      onChange={(e) =>
                        handleInputChange(
                          "college_fees",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="apple-input tabular-nums text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Travel & Fuel
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={250}
                      value={formData.travel_expenses}
                      onChange={(e) =>
                        handleInputChange(
                          "travel_expenses",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="apple-input tabular-nums text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Groceries / Bills
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={500}
                      value={formData.groceries_utilities}
                      onChange={(e) =>
                        handleInputChange(
                          "groceries_utilities",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="apple-input tabular-nums text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Other Recurring Expenses
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={250}
                      value={formData.other_monthly_expenses}
                      onChange={(e) =>
                        handleInputChange(
                          "other_monthly_expenses",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="apple-input tabular-nums text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Credit Profile & Loan Application */}
            <div className="glass-panel p-6 sm:p-7">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-border-hairline">
                <div className="w-8 h-8 rounded-lg bg-accent-subtle border border-accent-border flex items-center justify-center text-accent">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary text-base">
                    5. Credit Profile & Loan Request Parameters
                  </h3>
                  <p className="text-xs text-text-tertiary">
                    CIBIL score, bank reserves, active EMIs, requested amount, and tenure
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Existing Active Loans?
                  </label>
                  <select
                    value={formData.existing_loans}
                    onChange={(e) =>
                      handleInputChange("existing_loans", e.target.value)
                    }
                    className="apple-input"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Current Monthly EMI (INR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={formData.current_emi_amount}
                    onChange={(e) =>
                      handleInputChange(
                        "current_emi_amount",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="apple-input tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Liquid Bank Balance (INR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={5000}
                    value={formData.bank_balance}
                    onChange={(e) =>
                      handleInputChange(
                        "bank_balance",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="apple-input tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Emergency Reserve (INR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={5000}
                    value={formData.emergency_fund}
                    onChange={(e) =>
                      handleInputChange(
                        "emergency_fund",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="apple-input tabular-nums"
                  />
                </div>
              </div>

              {/* Credit Score Slider + Loan Request Details */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-border-hairline">
                <div className="lg:col-span-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-text-secondary">
                      CIBIL / Credit Score
                    </label>
                    <span className="text-sm font-bold text-accent tabular-nums">
                      {formData.credit_score} • {formData.credit_score >= 750 ? "Prime" : formData.credit_score >= 650 ? "Good" : "Subprime"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={300}
                    max={850}
                    step={5}
                    value={formData.credit_score}
                    onChange={(e) =>
                      handleInputChange("credit_score", parseInt(e.target.value))
                    }
                    className="w-full accent-accent cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-text-tertiary">
                    <span>300 (Poor)</span>
                    <span>650 (Fair)</span>
                    <span>750 (Good)</span>
                    <span>850 (Excellent)</span>
                  </div>
                </div>

                <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Requested Loan (₹)
                    </label>
                    <input
                      type="number"
                      min={5000}
                      max={2000000}
                      step={5000}
                      value={formData.requested_amount}
                      onChange={(e) =>
                        handleInputChange(
                          "requested_amount",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="apple-input tabular-nums text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Tenure (Months)
                    </label>
                    <input
                      type="number"
                      min={3}
                      max={84}
                      step={3}
                      value={formData.requested_tenure}
                      onChange={(e) =>
                        handleInputChange(
                          "requested_tenure",
                          parseInt(e.target.value) || 12
                        )
                      }
                      className="apple-input tabular-nums text-xs"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Submit Bar */}
            <div className="glass-panel p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-text-tertiary text-center sm:text-left">
                All 22 features mapped to feature engineering pipeline (Winsorized scaling + DTI transform).
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto apple-button-primary !py-3 !px-8 text-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Executing Dual ML Inference...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Evaluate Credit & Max Safe EMI
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
