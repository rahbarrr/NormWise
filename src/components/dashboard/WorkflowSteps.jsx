import React from "react";
import { WORKFLOW_STEPS } from "../../data/mockData";
import {
  FileEdit,
  Search,
  CheckCircle2,
  FileCheck2,
  FileSpreadsheet,
  ArrowRight,
} from "lucide-react";

const stepIcons = [
  FileEdit,
  Search,
  CheckCircle2,
  FileCheck2,
  FileSpreadsheet,
];

export const WorkflowSteps = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            How NormWise Evaluates Procurement Requirements
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            5-stage traceability framework designed for public tenders and institutional procurement compliance
          </p>
        </div>
        <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 self-start sm:self-auto">
          Audit-Proof Process
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
        {WORKFLOW_STEPS.map((item, index) => {
          const Icon = stepIcons[index] || FileEdit;
          return (
            <div
              key={item.step}
              className="relative flex flex-col p-4 rounded-lg bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {item.step}
                </span>
                <Icon className="w-4 h-4 text-slate-400" />
              </div>

              <h4 className="text-xs font-semibold text-slate-900 leading-snug mb-1.5">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
