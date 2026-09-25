import React from "react";
import { Check, AlertCircle, FileSearch, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";

export const DocumentHighlights = ({
  requirements = [],
  ambiguityCount = 0,
  onScrollToField,
}) => {
  const highlightItems = [
    { id: "product", label: "Product identified", found: requirements.some((r) => r.id === "product" && !!r.value) },
    { id: "material", label: "Material identified", found: requirements.some((r) => r.id === "material" && !!r.value) },
    { id: "capacity", label: "Capacity identified", found: requirements.some((r) => r.id === "capacity" && !!r.value) },
    { id: "application", label: "Application identified", found: requirements.some((r) => r.id === "application" && !!r.value) },
    { id: "technical_characteristics", label: "Technical characteristics", found: requirements.some((r) => r.id === "technical_characteristics" && !!r.value) },
  ];

  return (
    <Card className="border-slate-200/90 shadow-2xs">
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <FileSearch className="w-4 h-4 text-blue-700" />
          <CardTitle className="text-sm font-bold text-slate-900 tracking-tight">
            Document Highlights
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-3.5 space-y-2">
        <div className="space-y-1.5 text-xs">
          {highlightItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onScrollToField(item.id)}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-left transition-colors group"
            >
              <span className="text-slate-700 font-medium group-hover:text-blue-900">
                {item.label}
              </span>
              <div className="flex items-center gap-1.5">
                {item.found ? (
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  </div>
                )}
                <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-slate-500" />
              </div>
            </button>
          ))}
        </div>

        {ambiguityCount > 0 && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between p-2 text-xs text-amber-900 bg-amber-50/60 rounded-lg border border-amber-200/80">
            <span className="font-semibold">Potential ambiguity</span>
            <span className="font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded text-[11px]">
              {ambiguityCount} Item{ambiguityCount === 1 ? "" : "s"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
