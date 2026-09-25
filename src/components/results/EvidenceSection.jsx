import React from "react";
import { useNavigate } from "react-router-dom";
import { FileCheck2, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { EvidenceCard } from "./EvidenceCard";

export const EvidenceSection = ({ evidenceItems, onOpenEvidence }) => {
  const navigate = useNavigate();

  return (
    <Card className="border-slate-200/90 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-blue-700" />
            <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
              Evidence & Traceability
            </CardTitle>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Review the information supporting this recommendation.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/evidence")}
          className="text-xs shrink-0 self-start sm:self-auto"
        >
          <span>View Evidence</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {evidenceItems?.map((item) => (
            <EvidenceCard
              key={item.id}
              item={item}
              onViewEvidence={onOpenEvidence}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
