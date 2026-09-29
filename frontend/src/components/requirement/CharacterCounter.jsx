import React from "react";
import { cn } from '../../utils';

export const CharacterCounter = ({ current = 0, max = 2000, className }) => {
  const isNearLimit = current > max * 0.9;
  const isAtLimit = current >= max;

  return (
    <div
      className={cn(
        "text-xs font-mono transition-colors",
        isAtLimit
          ? "text-rose-600 font-bold"
          : isNearLimit
          ? "text-amber-600 font-medium"
          : "text-slate-400",
        className
      )}
      aria-live="polite"
      aria-label={`${current} of ${max} characters used`}
    >
      {current} / {max}
    </div>
  );
};
