import React from "react";
import { cn } from '../../utils';

const badgeVariants = {
  // Verified / Current / Success states strictly green
  current: "bg-emerald-50 text-emerald-800 border-emerald-200 ring-emerald-600/10",
  verified: "bg-emerald-50 text-emerald-800 border-emerald-200 ring-emerald-600/10",
  success: "bg-emerald-50 text-emerald-800 border-emerald-200 ring-emerald-600/10",

  // Review / Warning states strictly amber
  review: "bg-amber-50 text-amber-800 border-amber-200 ring-amber-600/10",
  warning: "bg-amber-50 text-amber-800 border-amber-200 ring-amber-600/10",
  pending: "bg-amber-50 text-amber-800 border-amber-200 ring-amber-600/10",

  // Invalid / Withdrawn / Error states strictly red
  withdrawn: "bg-rose-50 text-rose-800 border-rose-200 ring-rose-600/10",
  invalid: "bg-rose-50 text-rose-800 border-rose-200 ring-rose-600/10",
  error: "bg-rose-50 text-rose-800 border-rose-200 ring-rose-600/10",

  // Government & institutional neutral accents
  navy: "bg-slate-900 text-white border-slate-800",
  blue: "bg-blue-50 text-blue-800 border-blue-200 ring-blue-700/10",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
  outline: "bg-white text-slate-700 border-slate-300",
};

export const Badge = ({
  className,
  variant = "slate",
  dot = false,
  children,
  ...props
}) => {
  const normVariant = variant?.toLowerCase() || "slate";
  const appliedVariant = badgeVariants[normVariant] || badgeVariants.slate;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ring-1 ring-inset tracking-wide",
        appliedVariant,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            (normVariant === "current" || normVariant === "verified" || normVariant === "success") && "bg-emerald-600",
            (normVariant === "review" || normVariant === "warning" || normVariant === "pending") && "bg-amber-500",
            (normVariant === "withdrawn" || normVariant === "invalid" || normVariant === "error") && "bg-rose-600",
            (normVariant === "blue") && "bg-blue-600",
            (normVariant === "slate") && "bg-slate-400",
            (normVariant === "navy") && "bg-white"
          )}
        />
      )}
      {children}
    </span>
  );
};
