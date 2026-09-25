import React, { useState } from "react";
import { AlertTriangle, Plus, Check } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";

export const MissingInformation = ({ missingItems = [], onAddInformation }) => {
  const [activeInputId, setActiveInputId] = useState(null);
  const [customValue, setCustomValue] = useState("");

  if (!missingItems || missingItems.length === 0) return null;

  const handleSave = (item) => {
    if (!customValue.trim()) return;
    onAddInformation(item.id, customValue.trim());
    setActiveInputId(null);
    setCustomValue("");
  };

  return (
    <Card className="border-amber-200/90 bg-amber-50/40 shadow-2xs">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-amber-950 font-bold text-xs sm:text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Information that may improve the recommendation</span>
        </div>

        <div className="space-y-2.5">
          {missingItems.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-white/90 rounded-lg border border-amber-200 text-xs text-slate-800 space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-medium text-amber-900">{item.issue}</span>

                {activeInputId !== item.id && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveInputId(item.id);
                      setCustomValue("");
                    }}
                    className="text-xs h-7 px-2.5 text-blue-700 border-blue-200 hover:bg-blue-50 self-start sm:self-auto"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    <span>Add information</span>
                  </Button>
                )}
              </div>

              {activeInputId === item.id && (
                <div className="space-y-2 pt-1 border-t border-slate-100 animate-in fade-in duration-100">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.suggestedValues?.map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCustomValue(val)}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-100 hover:text-blue-900 text-slate-700 border border-slate-200 transition-colors"
                      >
                        + {val}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      placeholder={`Enter ${item.field.toLowerCase()}...`}
                      className="flex-1 h-8 text-xs px-2.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => handleSave(item)}
                      disabled={!customValue.trim()}
                      className="text-xs h-8 px-2.5"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      <span>Save</span>
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveInputId(null)}
                      className="text-xs h-8 px-2"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
