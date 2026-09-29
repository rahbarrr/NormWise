import React from "react";
import { cn } from '../../utils';

const buttonVariants = {
  primary: "bg-blue-700 text-white hover:bg-blue-800 active:bg-blue-900 shadow-sm border border-blue-800 focus-visible:ring-blue-500",
  secondary: "bg-white text-slate-800 hover:bg-slate-50 border border-slate-300 shadow-sm focus-visible:ring-slate-400 active:bg-slate-100",
  outline: "bg-transparent text-blue-700 hover:bg-blue-50 border border-blue-300 focus-visible:ring-blue-500",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400",
  danger: "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 border border-rose-700 focus-visible:ring-rose-500 shadow-sm",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 border border-emerald-700 focus-visible:ring-emerald-500 shadow-sm",
  navy: "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 shadow-sm focus-visible:ring-slate-700",
};

const buttonSizes = {
  sm: "px-2.5 py-1.5 text-xs font-medium rounded-md gap-1.5",
  md: "px-4 py-2 text-sm font-medium rounded-lg gap-2",
  lg: "px-5 py-2.5 text-base font-medium rounded-lg gap-2.5",
  icon: "p-2 rounded-lg aspect-square justify-center",
};

export const Button = React.forwardRef(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-sans tracking-tight transition-colors duration-150 select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
          buttonVariants[variant] || buttonVariants.primary,
          buttonSizes[size] || buttonSizes.md,
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-0.5 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
