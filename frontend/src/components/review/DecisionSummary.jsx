import React from "react";
import { CheckCircle2, UserCheck, HelpCircle, Ban, Clock, User, RotateCcw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const DecisionSummary = ({
  decision = "Accepted",
  reviewer = "Demo User",
  date = "Today (Demo timestamp)",
  notes = "",
  details = null,
  onResetDecision,
}) => {
  const getDecisionConfig = () => {
    switch (decision) {
      case "Accepted":
        return {
          icon: CheckCircle2,
          color: "text-emerald-700",
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          badgeVariant: "verified",
          title: "Recommendation Accepted",
          desc: "This Indian Standard has been verified by the human reviewer and approved for tender procurement drafting.",
        };
      case "Under Technical Review":
        return {
          icon: UserCheck,
          color: "text-amber-800",
          bg: "bg-amber-50",
          border: "border-amber-200",
          badgeVariant: "warning",
          title: "Under Technical Review",
          desc: "Referred to sectional technical committee for further verification of parameters and tolerances.",
        };
      case "Clarification Requested":
        return {
          icon: HelpCircle,
          color: "text-blue-800",
          bg: "bg-blue-50",
          border: "border-blue-200",
          badgeVariant: "blue",
          title: "Clarification Requested",
          desc: "A formal request for additional requirement parameters has been logged with the originating unit.",
        };
      case "Not Applicable":
        return {
          icon: Ban,
          color: "text-rose-800",
          bg: "bg-rose-50",
          border: "border-rose-200",
          badgeVariant: "withdrawn",
          title: "Marked Not Applicable",
          desc: "This recommendation was evaluated and deemed not applicable for the defined procurement requirement.",
        };
      default:
        return {
          icon: Clock,
          color: "text-slate-700",
          bg: "bg-slate-50",
          border: "border-slate-200",
          badgeVariant: "review",
          title: "Pending Review",
          desc: "No formal decision recorded yet.",
        };
    }
  };

  const config = getDecisionConfig();
  const Icon = config.icon;

  return (
    <Card className={`border ${config.border} ${config.bg}/40 shadow-xs overflow-hidden`}>
      <CardHeader className={`border-b ${config.border} pb-3.5 bg-white/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg ${config.bg} ${config.color} flex items-center justify-center shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
              Review Decision
            </CardTitle>
            <p className="text-xs text-slate-500">{config.desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={config.badgeVariant} dot className="text-xs font-semibold py-1 px-3">
            {config.title}
          </Badge>

          {onResetDecision && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetDecision}
              className="text-xs h-7 text-slate-600 font-medium"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              <span>Modify Decision</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-white/80 p-3 rounded-lg border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Sign-off Officer
            </span>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-slate-800">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{reviewer}</span>
            </div>
          </div>

          <div className="bg-white/80 p-3 rounded-lg border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Decision Timestamp
            </span>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-slate-800">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{date}</span>
            </div>
          </div>
        </div>

        {/* Display recorded reason or notes */}
        {(notes || details?.reason || details?.question) && (
          <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 space-y-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Recorded Rationale & Notes
            </span>
            {details?.reason && (
              <p className="text-xs font-semibold text-slate-800">
                Reason category: <span className="font-bold text-slate-900">{details.reason}</span>
              </p>
            )}
            {details?.category && (
              <p className="text-xs font-semibold text-slate-800">
                Category: <span className="font-bold text-slate-900">{details.category}</span>
              </p>
            )}
            <p className="text-xs text-slate-700 leading-relaxed italic">
              "{notes || details?.explanation || details?.question}"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
