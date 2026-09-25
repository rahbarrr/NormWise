import React from "react";
import { FileText, FileCheck } from "lucide-react";
import { Card, CardContent } from "../ui/Card";

export const SupportedDocuments = () => {
  return (
    <Card className="border-slate-200/90 shadow-2xs">
      <CardContent className="p-4 space-y-3">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Supported Documents
        </h4>

        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2.5">
            <span className="font-mono font-bold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-[11px] shrink-0">
              PDF
            </span>
            <p className="text-slate-600 leading-snug">
              Tender documents, notices inviting tender (NIT), technical schedules, and equipment specifications.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="font-mono font-bold text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 text-[11px] shrink-0">
              DOCX
            </span>
            <p className="text-slate-600 leading-snug">
              Draft procurement contracts, editable schedule of requirements, and technical indent forms.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
