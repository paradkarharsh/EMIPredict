import * as React from "react";
import { CountUpNumber } from "./CountUpNumber";

interface MetricCardProps {
  label: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  subtext?: string;
  delta?: string;
  deltaType?: "positive" | "negative" | "neutral";
  isCountUp?: boolean;
  className?: string;
}

export function MetricCard({
  label,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  subtext,
  delta,
  deltaType = "neutral",
  isCountUp = true,
  className = "",
}: MetricCardProps) {
  const isNumeric = typeof value === "number";

  const deltaColors = {
    positive: "text-status-success",
    negative: "text-status-danger",
    neutral: "text-text-secondary",
  }[deltaType];

  return (
    <div
      className={`glass-panel p-5 sm:p-6 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-medium text-text-secondary tracking-tight">
          {label}
        </span>
        {delta && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-surface border border-border-hairline ${deltaColors}`}
          >
            {delta}
          </span>
        )}
      </div>

      <div className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary tabular-nums">
        {isNumeric && isCountUp ? (
          <CountUpNumber
            value={value as number}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
          />
        ) : (
          <span>
            {prefix}
            {value}
            {suffix}
          </span>
        )}
      </div>

      {subtext && (
        <div className="text-xs text-text-tertiary mt-2 tracking-tight">
          {subtext}
        </div>
      )}
    </div>
  );
}
