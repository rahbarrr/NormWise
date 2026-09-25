import React from "react";
import { ShieldCheck, ArrowRight, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

export const CertificationEvidence = ({ onOpenDetail }) => {
  return (
    <Card className="border-slate-200/90 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
              Certification Evidence
            </CardTitle>
          </div>
          <Badge variant="blue" className="text-xs">
            Demo
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Certification Information
            </span>
            <span className="text-sm font-bold text-slate-900 font-sans">
              Scheme I / ISI
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Conformity Status
            </span>
            <span className="text-sm font-semibold text-slate-800 font-sans">
              Potentially applicable
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Demonstration compliance grounding: Scheme-I certification requirements are identified as potentially applicable subject to specific capacity, intended commercial kitchen usage, and line ministry Quality Control Orders.
        </p>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">
            Statutory registry reference: Gazette Order S.O. 124(E) — Demo
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onOpenDetail({
                id: "EV-003",
                standard: "IS 2347:2023",
                documentTitle: "Quality Control Order Registry",
                type: "Certification",
                reference: "Gazette Order Reference — Demo",
                supports: "Certification information (Scheme I / ISI)",
                status: "Available",
                evidenceText:
                  "Demonstration evidence content. Statutory notification designating Scheme-I (ISI mark) as potentially applicable for public and commercial supply. Replace with authorized source text when the real evidence pipeline is connected.",
                sourceType: "Statutory Order",
                edition: "Gazette Publication",
                amendment: "Current Order",
                sourceStatus: "Demo dataset",
                lastValidated: "October 2026",
              })
            }
            className="text-xs h-7 px-2.5 text-blue-700 font-medium"
          >
            <span>View Source</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
