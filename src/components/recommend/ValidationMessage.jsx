import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";

export const ValidationMessage = ({ message, className }) => {
  if (!message) return null;

  return (
    <div
      className={cn(
        "p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 animate-in fade-in duration-150",
        className
      )}
      role="alert"
    >
      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
      <span className="font-medium">{message}</span>
    </div>
  );
};
