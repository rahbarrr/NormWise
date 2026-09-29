import React from "react";
import { ListChecks } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { ExtractedRequirementCard } from "./ExtractedRequirementCard";

export const ExtractedRequirements = ({
  requirements = [],
  onSaveValue,
  onResetValue,
}) => {
  return (
    <Card className="border-slate-200/90 shadow-2xs">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-blue-700" />
          <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
            Extracted Requirements
          </CardTitle>
        </div>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
          Review and verify the procurement parameters identified from your document before starting standards analysis.
        </p>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        {requirements.map((req) => (
          <ExtractedRequirementCard
            key={req.id}
            requirement={req}
            onSaveValue={onSaveValue}
            onResetValue={onResetValue}
          />
        ))}
      </CardContent>
    </Card>
  );
};
