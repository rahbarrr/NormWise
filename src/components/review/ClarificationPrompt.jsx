import React from "react";
import { HelpCircle, ArrowRight } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";

export const ClarificationPrompt = ({ onRequestClarification }) => {
  return (
    <Card className="border-blue-200/80 bg-blue-50/40 shadow-xs">
      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-950">Need clarification?</h4>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed max-w-2xl">
              If the requirement is ambiguous or the recommendation is not sufficiently supported, request additional information instead of accepting the result.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRequestClarification}
          className="text-xs font-semibold shrink-0 self-start sm:self-auto border-blue-300 text-blue-900 bg-white hover:bg-blue-50"
        >
          <span>Request Clarification</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1 text-blue-700" />
        </Button>
      </CardContent>
    </Card>
  );
};
