import React from "react";
import { CheckCircle2, UserCheck, HelpCircle, Ban, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const ReviewDecisionPanel = ({
  status = "Pending Review",
  checklistCompleted = 0,
  checklistTotal = 7,
  evidenceCount = 6,
  confidence = 94,
  onAccept,
  onRequestTechnicalReview,
  onRequestClarification,
  onMarkNotApplicable,
}) => {
  const isAccepted = status === "Accepted";

  return (
    <Card className="border-slate-200/90 shadow-sm sticky top-20 bg-white">
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-900 tracking-tight">
            Review Decision
          </CardTitle>
          <Badge
            variant={isAccepted ? "verified" : status === "Not Applicable" ? "withdrawn" : "review"}
            dot
            className="text-[10px] font-semibold"
          >
            {status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Verification Status Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/70">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">
              Checklist
            </span>
            <span className="text-xs font-bold text-slate-900 mt-0.5 block">
              {checklistCompleted} / {checklistTotal}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/70">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">
              Evidence
            </span>
            <span className="text-xs font-bold text-slate-900 mt-0.5 block">
              {evidenceCount} items
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/70">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">
              Confidence
            </span>
            <span className="text-xs font-bold text-emerald-700 mt-0.5 block">
              {confidence}%
            </span>
          </div>
        </div>

        {/* Action Decision Buttons */}
        <div className="space-y-2 pt-1">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onAccept}
            disabled={isAccepted}
            className="w-full text-xs font-semibold h-9.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-100 disabled:text-emerald-700 justify-center shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            <span>{isAccepted ? "Recommendation Accepted" : "Accept Recommendation"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRequestTechnicalReview}
            className="w-full text-xs font-medium h-9 text-amber-900 border-amber-300 bg-amber-50/50 hover:bg-amber-100/70 justify-center"
          >
            <UserCheck className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
            <span>Request Technical Review</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRequestClarification}
            className="w-full text-xs font-medium h-9 text-blue-900 border-blue-200 bg-blue-50/40 hover:bg-blue-100/60 justify-center"
          >
            <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-blue-700" />
            <span>Request Clarification</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onMarkNotApplicable}
            className="w-full text-xs font-medium h-8.5 text-rose-800 border-rose-200 hover:bg-rose-50/80 hover:border-rose-300 justify-center"
          >
            <Ban className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
            <span>Mark Not Applicable</span>
          </Button>
        </div>

        <p className="text-[11px] text-slate-400 text-center leading-normal pt-1">
          Review decisions are committed to the public procurement audit trail.
        </p>
      </CardContent>
    </Card>
  );
};
