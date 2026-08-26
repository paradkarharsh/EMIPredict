"use client";

import * as React from "react";
import { useMotionValue, useSpring } from "framer-motion";

interface CountUpNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export function CountUpNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: CountUpNumberProps) {
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, {
    damping: 35,
    stiffness: 100,
    mass: 1,
  });

  const [displayValue, setDisplayValue] = React.useState("0");

  React.useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  React.useEffect(() => {
    const unsubscribe = springVal.on("change", (latest) => {
      setDisplayValue(
        latest.toLocaleString("en-IN", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      );
    });
    return () => unsubscribe();
  }, [springVal, decimals]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
