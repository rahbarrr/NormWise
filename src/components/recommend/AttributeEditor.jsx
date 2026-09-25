import React, { useState } from "react";
import { Edit2, Check, X } from "lucide-react";
import { Input } from "../ui/Input";
import { cn } from "../../lib/utils";

export const AttributeEditor = ({
  label,
  value,
  fieldKey,
  onSave,
  className,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentVal, setCurrentVal] = useState(value);

  const handleStartEdit = () => {
    setCurrentVal(value);
    setIsEditing(true);
  };

  const handleCommit = () => {
    onSave(fieldKey, currentVal.trim() || value);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCurrentVal(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCommit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <div
      className={cn(
        "p-3 sm:p-3.5 rounded-xl border bg-white transition-all duration-150 flex flex-col justify-between group",
        isEditing
          ? "border-blue-500 ring-2 ring-blue-500/10 shadow-xs"
          : "border-slate-200/90 hover:border-slate-300 shadow-xs",
        className
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>

        {!isEditing && (
          <button
            type="button"
            onClick={handleStartEdit}
            className="text-slate-400 hover:text-blue-700 p-1 rounded hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            title={`Edit ${label}`}
            aria-label={`Edit ${label}`}
          >
            <Edit2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="flex items-center gap-1.5 mt-1">
          <Input
            value={currentVal}
            onChange={(e) => setCurrentVal(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 text-xs font-semibold py-1 px-2 text-slate-900"
            autoFocus
          />
          <button
            type="button"
            onClick={handleCommit}
            className="p-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 shrink-0"
            title="Confirm"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="p-1.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 shrink-0"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onClick={handleStartEdit}
          className="cursor-pointer py-0.5 rounded hover:bg-slate-50/50"
          title="Click to edit value"
        >
          <span className="text-sm font-semibold text-slate-900 block truncate font-sans">
            {value}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5 font-normal">
            Click to edit
          </span>
        </div>
      )}
    </div>
  );
};
