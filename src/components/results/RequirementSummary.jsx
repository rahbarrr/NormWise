import React from "react";
import { useNavigate } from "react-router-dom";
import { Edit2, FileText } from "lucide-react";
import { Button } from "../ui/Button";

export const RequirementSummary = ({ requirement, attributes }) => {
  const navigate = useNavigate();

  const handleEditRequirement = () => {
    navigate(`/recommend?q=${encodeURIComponent(requirement || "")}`);
  };

  const attributeList = [
    { label: "Product", value: attributes?.product || "Standard Product" },
    { label: "Material", value: attributes?.material || "Standard Grade" },
    { label: "Capacity", value: attributes?.capacity || "Standard Capacity" },
    { label: "Application", value: attributes?.application || "Institutional Use" },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            YOUR REQUIREMENT
          </span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleEditRequirement}
          className="text-xs h-7 px-2 text-slate-500 hover:text-blue-700 self-start sm:self-auto font-medium"
        >
          <Edit2 className="w-3 h-3 mr-1" />
          <span>Edit Requirement</span>
        </Button>
      </div>

      {/* Requirement text */}
      <p className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
        "{requirement}"
      </p>

      {/* Structured attributes tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {attributeList.map((attr, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              {attr.label}
            </span>
            <span className="font-semibold text-slate-800 block truncate font-sans">
              {attr.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
