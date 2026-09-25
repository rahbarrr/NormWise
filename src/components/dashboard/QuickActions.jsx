import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, UploadCloud, History, ArrowUpRight } from "lucide-react";
import { Card } from "../ui/Card";
import { cn } from "../../lib/utils";

export const QuickActions = ({ onUploadClick }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const actions = [
    {
      title: "New Recommendation",
      description: "Match product specifications with mandatory & voluntary Indian Standards.",
      icon: PlusCircle,
      action: () => navigate("/recommend"),
      buttonText: "Start Recommendation",
      accent: "text-blue-700 hover:border-blue-300",
    },
    {
      title: "Upload Specification",
      description: "Batch extract parameters from tender schedules, NITs, and RFP documents.",
      icon: UploadCloud,
      action: () => navigate("/documents"),
      buttonText: "Upload PDF / DOCX",
      accent: "text-slate-800 hover:border-slate-300",
    },
    {
      title: "View History",
      description: "Browse past procurement evaluations, conformity verdicts, and tender clauses.",
      icon: History,
      action: () => navigate("/history"),
      buttonText: "Open Audit Log",
      accent: "text-slate-800 hover:border-slate-300",
    },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Quick Operations
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              onClick={item.action}
              className={cn(
                "group bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs cursor-pointer",
                "hover:border-blue-400 hover:shadow-sm transition-all duration-150 flex flex-col justify-between"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>

                <h4 className="font-semibold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                  {item.title}
                </h4>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-700 group-hover:text-blue-700">
                <span>{item.buttonText}</span>
                <span className="text-slate-400">→</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
