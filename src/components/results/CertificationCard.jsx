import React from "react";
import { ShieldCheck, ArrowRight, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

export const CertificationCard = ({ certification, onOpenEvidence }) => {
  if (!certification) return null;

  return (
    <Card className="border-slate-200/90 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
              Certification / Compliance
            </CardTitle>
          </div>
          <Badge variant="blue" className="text-xs">
            {certification.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Identified Certification Scheme
            </span>
            <span className="text-sm font-bold text-slate-900 font-sans">
              {certification.scheme}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Conformity Assessment Body
            </span>
            <span className="text-sm font-semibold text-slate-800 font-sans">
              {certification.regulatoryBody || "Bureau of Indian Standards"}
            </span>
          </div>
        </div>

        {/* Why it matters */}
        <div className="space-y-1 text-xs">
          <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
            Why it matters
          </span>
          <p className="text-slate-600 leading-relaxed">
            {certification.description}
          </p>
        </div>

        {/* Action to view certification evidence */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Regulatory order reference available
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenEvidence({
              attribute: "Certification",
              value: certification.scheme,
              matchText: certification.evidenceSnippet,
              evidenceRef: "Statutory Order Reference — demo",
            })}
            className="text-xs h-8 text-blue-700 font-medium"
          >
            <span>View certification evidence</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
