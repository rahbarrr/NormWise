import React from "react";
import { Layers, ArrowRight, FileCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { MOCK_RELATED_STANDARDS_EVIDENCE } from '../../utils/mock/mockEvidence';

export const RelatedEvidence = ({ onOpenDetail }) => {
  return (
    <Card className="border-slate-200/90 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-700" />
            <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
              Evidence for Related Standards
            </CardTitle>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Normative and informative standard dependencies identified during requirement analysis.
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="divide-y divide-slate-100">
          {MOCK_RELATED_STANDARDS_EVIDENCE.map((item) => (
            <div
              key={item.code}
              className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-blue-900">
                    {item.code}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded border bg-slate-50 text-slate-700 border-slate-200">
                    {item.relationship}
                  </span>
                  <Badge variant="current" dot className="text-[10px]">
                    {item.status}
                  </Badge>
                </div>
                <p className="font-semibold text-slate-800">{item.title}</p>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  {item.evidenceSummary}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  onOpenDetail({
                    id: `REL-${item.code}`,
                    standard: item.code,
                    documentTitle: item.title,
                    type: "Related Standard",
                    reference: item.reference,
                    supports: `Allied ${item.relationship} Standard`,
                    status: item.status,
                    evidenceText: item.evidenceSummary,
                    sourceType: "Allied Standard",
                    edition: "Applicable Edition",
                    amendment: "Demo",
                    sourceStatus: "Demo dataset",
                    lastValidated: "October 2026",
                  })
                }
                className="text-xs h-7 px-2.5 text-blue-700 font-medium shrink-0 self-start sm:self-center"
              >
                <span>View Evidence</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
