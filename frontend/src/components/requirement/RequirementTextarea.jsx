import React from "react";
import { CharacterCounter } from "./CharacterCounter";
import { cn } from '../../utils';

export const RequirementTextarea = ({
  value,
  onChange,
  maxLength = 2000,
  error,
  disabled = false,
}) => {
  const handleChange = (e) => {
    const text = e.target.value;
    if (text.length <= maxLength) {
      onChange(text);
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <label
          htmlFor="requirement-textarea"
          className="text-base font-semibold text-slate-900 tracking-tight block"
        >
          Describe your requirement
        </label>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
          Include the product, material, intended use, capacity, application, or important technical characteristics.
        </p>
      </div>

      <div className="relative">
        <textarea
          id="requirement-textarea"
          rows={5}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          maxLength={maxLength}
          placeholder={`Example:\nStainless steel pressure cooker, 5 litre, for institutional kitchen use`}
          className={cn(
            "w-full rounded-xl border border-slate-300 bg-white p-3.5 sm:p-4 text-sm text-slate-900 placeholder:text-slate-400 leading-relaxed font-sans resize-y",
            "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-blue-600",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 shadow-xs",
            error && "border-rose-500 focus-visible:ring-rose-500"
          )}
        />
        <div className="flex items-center justify-between mt-1 px-1">
          <p className="text-[11px] text-slate-500 leading-relaxed max-w-lg">
            Include as much technical detail as available. More specific requirements can improve the relevance of recommendations.
          </p>
          <CharacterCounter current={value.length} max={maxLength} />
        </div>
      </div>
    </div>
  );
};
