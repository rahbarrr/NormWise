import React from "react";
import { cn } from "../../lib/utils";

export const LoadingState = ({ message = "Loading standards intelligence...", description }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-3 border-blue-100"></div>
        <div className="absolute inset-0 rounded-full border-3 border-blue-700 border-t-transparent animate-spin"></div>
      </div>
      <h4 className="text-sm font-semibold text-slate-800 tracking-tight">{message}</h4>
      {description && <p className="text-xs text-slate-500 mt-1 max-w-sm">{description}</p>}
    </div>
  );
};

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200/80", className)}
      {...props}
    />
  );
};
