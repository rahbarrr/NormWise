import React from "react";
import { AttributeEditor } from "./AttributeEditor";
import { Badge } from "../ui/Badge";
import { Info, Sparkles, SlidersHorizontal } from "lucide-react";

export const RequirementSummary = ({ attributes, onUpdateAttribute }) => {
  if (!attributes) return null;

  return (
    <div className="bg-slate-50/70 rounded-xl border border-slate-200/90 p-4 sm:p-5 space-y-3.5 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">
            Requirement summary
          </h4>
          <span className="text-[10px] font-semibold text-blue-800 bg-blue-100/70 border border-blue-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Extracted information
          </span>
        </div>

        <span className="text-xs text-slate-500">
          Review these details before continuing.
        </span>
      </div>

      {/* Grid of structured attribute cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <AttributeEditor
          label="Product"
          fieldKey="product"
          value={attributes.product}
          onSave={onUpdateAttribute}
        />
        <AttributeEditor
          label="Material"
          fieldKey="material"
          value={attributes.material}
          onSave={onUpdateAttribute}
        />
        <AttributeEditor
          label="Capacity"
          fieldKey="capacity"
          value={attributes.capacity}
          onSave={onUpdateAttribute}
        />
        <AttributeEditor
          label="Application"
          fieldKey="application"
          value={attributes.application}
          onSave={onUpdateAttribute}
        />
      </div>

      <div className="flex items-start gap-1.5 pt-1 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
        <span>
          Simulated extraction for demonstration. You can edit any parameter above to fine-tune the standards matching algorithm.
        </span>
      </div>
    </div>
  );
};
