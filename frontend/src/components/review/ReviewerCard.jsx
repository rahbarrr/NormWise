import React from "react";
import { User, Shield, Building2, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';

export const ReviewerCard = ({
  name = "Demo User",
  role = "Procurement / Technical Reviewer",
  organization = "Central Evaluation Committee (Demo)",
  status = "Active",
}) => {
  return (
    <Card className="border-slate-200/90 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-blue-700" />
          <CardTitle className="text-sm font-bold text-slate-900 tracking-tight">
            Reviewer Profile
          </CardTitle>
        </div>
        <Badge variant="verified" dot className="text-[10px] font-semibold py-0.5 px-2">
          {status}
        </Badge>
      </CardHeader>

      <CardContent className="pt-3.5 space-y-2.5 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Reviewing Officer
          </span>
          <p className="font-bold text-slate-900 text-sm mt-0.5">{name}</p>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Designation / Role
          </span>
          <p className="font-medium text-slate-700 mt-0.5">{role}</p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-slate-500 text-[11px]">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{organization}</span>
        </div>
      </CardContent>
    </Card>
  );
};
