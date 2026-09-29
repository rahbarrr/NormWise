import React from "react";
import { cn } from '../../utils';

export const Input = React.forwardRef(({ className, type = "text", error, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400",
        "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-blue-600",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
        error && "border-rose-500 focus-visible:ring-rose-500",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export const Textarea = React.forwardRef(({ className, error, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[110px] w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400",
        "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-blue-600",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 leading-relaxed resize-y",
        error && "border-rose-500 focus-visible:ring-rose-500",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
