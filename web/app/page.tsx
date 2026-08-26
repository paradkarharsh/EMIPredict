"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  TrendingUp,
  Sliders,
  Database,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Cpu,
  HelpCircle,
} from "lucide-react";
import { CountUpNumber } from "@/components/CountUpNumber";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

const SCENARIOS = [
  {
    title: "Personal Loan",
    category: "Unsecured Credit",
    image: "/images/scenario_personal_loan.jpg",
    amount: "₹50k – ₹10L",
    tenure: "12–60 mos",
    description: "Multi-purpose liquidity with risk-calibrated interest modeling.",
  },
  {
    title: "Vehicle EMI",
    category: "Asset Financing",
    image: "/images/scenario_vehicle.jpg",
    amount: "₹80k – ₹15L",
    tenure: "12–84 mos",
    description: "Electric & conventional vehicle purchase installment bounds.",
  },
  {
    title: "Home Appliances",
    category: "Consumer Durable",
    image: "/images/scenario_home_appliances.jpg",
    amount: "₹20k – ₹3L",
    tenure: "6–36 mos",
    description: "Living space upgrades without sacrificing monthly emergency buffer.",
  },
  {
    title: "Education EMI",
    category: "Career Investment",
    image: "/images/scenario_education.jpg",
    amount: "₹50k – ₹5L",
    tenure: "6–48 mos",
    description: "Higher studies and certification financing with manageable tenures.",
  },
  {
    title: "E-Commerce",
    category: "Retail Purchases",
    image: "/images/scenario_ecommerce.jpg",
    amount: "₹10k – ₹2L",
    tenure: "3–24 mos",
    description: "Micro-installments engineered to prevent retail over-indebtedness.",
  },
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* =========================================================================
          CINEMATIC HERO SECTION WITH EDITORIAL PHOTOGRAPHY
          ========================================================================= */}
      <section className="relative pt-12 sm:pt-16 pb-20 sm:pb-28 border-b border-border-hairline bg-gradient-to-b from-background via-background to-surface/40">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-16">
            {/* Left: Copy & CTAs */}
            <div className="lg:col-span-7">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-pill bg-accent-subtle border border-accent-border text-accent text-xs font-semibold tracking-tight mb-6"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Production ML Underwriting System • 400k Benchmarks</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: EASE_OUT_EXPO }}
                className="text-4xl sm:text-6xl lg:text-[64px] font-bold tracking-tight text-text-primary leading-[1.06] mb-6"
              >
                Know what you can actually afford, before the bank does the math.
              </motion.h1>

              {/* Subhead */}
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT_EXPO }}
                className="text-text-secondary text-lg sm:text-xl font-normal leading-relaxed mb-8 max-w-xl"
              >
                Instant 3-tier loan eligibility classification and continuous safe installment bounds — trained on 400,000 borrower profiles to eliminate default risk before you ever apply.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: EASE_OUT_EXPO }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
              >
                <Link
                  href="/predict"
                  className="apple-button-primary !py-3.5 !px-7 text-sm font-semibold shadow-lg shadow-accent/20"
                >
                  <span>Assess Your Affordability</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/models"
                  className="apple-button-secondary !py-3.5 !px-6 text-sm"
                >
                  Inspect MLflow Benchmarks
                </Link>
              </motion.div>
            </div>

            {/* Right: Authentic Editorial Photograph Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE_OUT_EXPO }}
              className="lg:col-span-5 relative"
            >
              <div className="relative rounded-2xl overflow-hidden glass-panel p-2 shadow-2xl border border-border-hairline group">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-card-subtle">
                  <img
                    src="/images/hero_editorial_finance.jpg"
                    alt="Authentic financial planning workspace"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 p-3 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white text-xs">
                    <div className="font-semibold text-[13px] text-white">
                      Transparent Financial Underwriting
                    </div>
                    <div className="text-white/80 text-[11px]">
                      Dual ML inference assessing cashflow solvency in &lt; 50ms
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Animated Live Stat Strip */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: EASE_OUT_EXPO }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 sm:p-8 glass-panel shadow-sm"
          >
            <div className="border-r border-border-hairline/60 pr-4 last:border-none">
              <div className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary tabular-nums mb-1">
                <CountUpNumber value={400800} />
              </div>
              <div className="text-xs sm:text-[13px] text-text-secondary font-medium">
                Verified Credit Profiles Analyzed
              </div>
            </div>

            <div className="border-r border-border-hairline/60 pr-4 last:border-none">
              <div className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary tabular-nums mb-1">
                <CountUpNumber value={8} suffix=" Models" />
              </div>
              <div className="text-xs sm:text-[13px] text-text-secondary font-medium">
                MLflow Experiment Benchmarks
              </div>
            </div>

            <div className="border-r border-border-hairline/60 pr-4 last:border-none">
              <div className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary tabular-nums mb-1">
                <CountUpNumber value={97.9} prefix="> " suffix="%" decimals={1} />
              </div>
              <div className="text-xs sm:text-[13px] text-text-secondary font-medium">
                Decision Tree Test Accuracy
              </div>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary tabular-nums mb-1">
                <CountUpNumber value={1008} prefix="< ₹" decimals={0} />
              </div>
              <div className="text-xs sm:text-[13px] text-text-secondary font-medium">
                XGBoost Regression RMSE Cap
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          VISUAL LOAN SCENARIOS SHOWCASE (REAL EDITORIAL PHOTOGRAPHY)
          ========================================================================= */}
      <section className="py-24 max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
              Lending Verticals
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
              Calibrated Across 5 Real-World Scenarios
            </h2>
          </div>
          <p className="text-text-secondary text-sm max-w-md">
            Each loan category has customized tenure, loan amounts, and risk thresholds calibrated from 80,000 empirical borrower profiles.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {SCENARIOS.map((item) => (
            <Link
              key={item.title}
              href="/predict"
              className="glass-panel overflow-hidden group hover:border-accent transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-card-subtle">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-[10px] font-semibold text-white">
                  {item.amount}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-medium text-text-tertiary mb-0.5">
                    {item.category}
                  </div>
                  <h3 className="font-bold text-text-primary text-base mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-border-hairline flex items-center justify-between text-xs text-accent font-semibold">
                  <span>Tenure: {item.tenure}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================================
          HOW IT WORKS (SIMPLE 3-STEP INTUITIVE EXPLAINER)
          ========================================================================= */}
      <section className="py-20 border-t border-border-hairline bg-surface/30">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary mb-3">
              How EMI Affordability Works
            </h2>
            <p className="text-text-secondary text-base">
              A simple, 3-step process to protect you from debt traps and over-borrowing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 sm:p-7 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-accent-subtle border border-accent-border text-accent flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="font-bold text-text-primary text-lg mb-2">
                Input Living Cashflow
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Provide your salary, rent, household expenses, and current EMIs across 22 clean financial parameters.
              </p>
            </div>

            <div className="glass-panel p-6 sm:p-7 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-accent-subtle border border-accent-border text-accent flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="font-bold text-text-primary text-lg mb-2">
                Dual ML Risk Modeling
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Decision Tree classifies loan eligibility while XGBoost regressor computes your maximum safe monthly installment.
              </p>
            </div>

            <div className="glass-panel p-6 sm:p-7 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-accent-subtle border border-accent-border text-accent flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="font-bold text-text-primary text-lg mb-2">
                Safe Multi-Tenure Curve
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Inspect how installment debt changes over 6 to 84 months and find the exact sweet spot for your wallet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7-STEP SEQUENTIAL PIPELINE
          ========================================================================= */}
      <section className="py-24 border-y border-border-hairline bg-surface/20">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary mb-3">
              The 7-Step Underwriting Pipeline
            </h2>
            <p className="text-text-secondary text-base leading-relaxed">
              From raw customer parameters to sub-50ms deterministic credit verdict.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5">
              <div className="text-xs font-bold text-accent tabular-nums mb-2">01</div>
              <div className="font-semibold text-text-primary text-sm mb-1">
                Schema Ingestion
              </div>
              <div className="text-xs text-text-secondary leading-relaxed">
                Ingests 22 applicant variables across income, obligations, and credit standing.
              </div>
            </div>

            <div className="glass-panel p-5">
              <div className="text-xs font-bold text-accent tabular-nums mb-2">02</div>
              <div className="font-semibold text-text-primary text-sm mb-1">
                Winsorization & Cleaning
              </div>
              <div className="text-xs text-text-secondary leading-relaxed">
                Automated median imputation and outlier containment at 1st/99th percentiles.
              </div>
            </div>

            <div className="glass-panel p-5">
              <div className="text-xs font-bold text-accent tabular-nums mb-2">03</div>
              <div className="font-semibold text-text-primary text-sm mb-1">
                Feature Engineering
              </div>
              <div className="text-xs text-text-secondary leading-relaxed">
                Derives Disposable Income, DTI, Expense Ratio, and Composite Risk Index.
              </div>
            </div>

            <div className="glass-panel p-5">
              <div className="text-xs font-bold text-accent tabular-nums mb-2">04</div>
              <div className="font-semibold text-text-primary text-sm mb-1">
                Scaling & One-Hot
              </div>
              <div className="text-xs text-text-secondary leading-relaxed">
                StandardScaler normalization and categorical one-hot encoding transformer.
              </div>
            </div>

            <div className="glass-panel p-5">
              <div className="text-xs font-bold text-accent tabular-nums mb-2">05</div>
              <div className="font-semibold text-text-primary text-sm mb-1">
                Dual Supervised ML
              </div>
              <div className="text-xs text-text-secondary leading-relaxed">
                Parallel inference through production Decision Tree Classifier & XGBoost Regressor.
              </div>
            </div>

            <div className="glass-panel p-5">
              <div className="text-xs font-bold text-accent tabular-nums mb-2">06</div>
              <div className="font-semibold text-text-primary text-sm mb-1">
                MLflow Governance
              </div>
              <div className="text-xs text-text-secondary leading-relaxed">
                Model registry stage tracking, artifact logging, and metric threshold verification.
              </div>
            </div>

            <div className="glass-panel p-5 sm:col-span-2 lg:col-span-2 bg-accent-subtle/50 border-accent-border">
              <div className="text-xs font-bold text-accent tabular-nums mb-2">07</div>
              <div className="font-semibold text-text-primary text-sm mb-1">
                Instant Decision & Amortization Curve
              </div>
              <div className="text-xs text-text-secondary leading-relaxed">
                Sub-50 millisecond delivery of underwriting decision, exact safe rupee cap, and multi-tenure sensitivity.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FINAL CTA SECTION
          ========================================================================= */}
      <section className="py-24 max-w-[1240px] mx-auto px-4 sm:px-6 text-center">
        <div className="max-w-2xl mx-auto glass-panel p-8 sm:p-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary mb-4">
            Evaluate your loan affordability in 30 seconds.
          </h2>
          <p className="text-text-secondary text-base mb-8 max-w-lg mx-auto">
            Test custom scenarios, analyze interest sensitivity, and check credit approvals with real production machine learning.
          </p>
          <Link
            href="/predict"
            className="apple-button-primary !py-3.5 !px-8 text-sm font-semibold"
          >
            Launch Prediction Experience →
          </Link>
        </div>
      </section>
    </div>
  );
}
