import React from "react";
import { CheckSquare, CheckCircle2, RotateCcw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { ChecklistItem } from "./ChecklistItem";
import { Button } from '../common/Button';

export const ReviewChecklist = ({
  checklist = [],
  onToggleItem,
  onViewEvidence,
  onCheckAll,
  onResetAll,
}) => {
  const completedCount = checklist.filter((item) => item.completed).length;
  const totalCount = checklist.length;
  const progressPercent = Math.round((completedCount / (totalCount || 1)) * 100);

  return (
    <Card className="border-slate-200/90 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-blue-700" />
            <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
              Review Checklist
            </CardTitle>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Verify each compliance dimension prior to recording a procurement decision.
          </p>
        </div>

        {/* Counter & Actions */}
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200/80">
            <span className="text-xs text-slate-500 font-medium">Progress:</span>
            <span className="text-xs font-bold text-slate-900">
              {completedCount} / {totalCount} completed
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onCheckAll}
              className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 hover:underline px-1.5 py-0.5"
            >
              Check All
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={onResetAll}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-700 hover:underline px-1.5 py-0.5"
            >
              Reset
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* Items List */}
        <div className="space-y-2.5">
          {checklist.map((item) => (
            <ChecklistItem
              key={item.id}
              item={item}
              onToggle={onToggleItem}
              onViewEvidence={onViewEvidence}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
