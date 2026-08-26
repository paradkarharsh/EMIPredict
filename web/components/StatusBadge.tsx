import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusBadge({
  status,
  size = "md",
  className = "",
}: StatusBadgeProps) {
  const normStatus = status.toLowerCase().replace("_", "-");

  let colorClasses =
    "bg-status-danger-bg text-status-danger border-status-danger/30";
  let Icon = XCircle;
  let label = "Not Eligible";

  if (normStatus.includes("eligible") && !normStatus.includes("not")) {
    colorClasses =
      "bg-status-success-bg text-status-success border-status-success/30";
    Icon = CheckCircle2;
    label = "Eligible for Loan";
  } else if (normStatus.includes("high") || normStatus.includes("risk")) {
    colorClasses =
      "bg-status-warning-bg text-status-warning border-status-warning/30";
    Icon = AlertTriangle;
    label = "High Risk Assessment";
  } else if (normStatus.includes("unknown")) {
    colorClasses = "bg-card-subtle text-text-secondary border-border-hairline";
    Icon = HelpCircle;
    label = "Pending Evaluation";
  }

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs gap-1.5",
    md: "px-3.5 py-1 text-[13px] gap-2",
    lg: "px-4 py-1.5 text-sm gap-2.5",
  }[size];

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }[size];

  return (
    <div
      className={`inline-flex items-center rounded-pill border font-semibold tracking-tight ${colorClasses} ${sizeClasses} ${className}`}
    >
      <Icon className={`${iconSizes} stroke-[2.2] shrink-0`} />
      <span>{label}</span>
    </div>
  );
}
