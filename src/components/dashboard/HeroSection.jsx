import React from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, ShieldCheck, Sparkles, Building2 } from "lucide-react";
import { Button } from "../ui/Button";

export const HeroSection = ({ onNewRecommendation }) => {
  const navigate = useNavigate();

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 md:p-10 shadow-xs overflow-hidden">
      {/* Subtle institutional background watermark / accent */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-50/60 pointer-events-none -z-0 blur-2xl" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
            <span>Bureau of Indian Standards (BIS) Intelligence Platform</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 leading-[1.2]">
            Find the right Indian Standards for your procurement requirement.
          </h2>

          <p className="text-base text-slate-600 leading-relaxed max-w-xl">
            Describe a product, upload a technical specification, or start with an example to identify applicable standards, verify mandatory Quality Control Orders (QCO), and generate tender-ready clauses.
          </p>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            size="lg"
            variant="primary"
            onClick={onNewRecommendation || (() => navigate("/recommend"))}
            className="shadow-sm font-semibold"
          >
            <PlusCircle className="w-5 h-5 mr-1" />
            <span>+ New Recommendation</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
