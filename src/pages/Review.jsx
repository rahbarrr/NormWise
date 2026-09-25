import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  Filter,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

const REVIEW_ITEMS = [
  {
    id: "REV-2026-001",
    requirement: "LED luminaires for street lighting, 120W, IP66",
    standard: "IS 10322 (Part 5/Sec 3):2012",
    reasonForReview: "Draft amendment by ETD 35 committee proposes higher luminous efficacy threshold (130 lm/W vs 105 lm/W). Needs officer verification of tender cutoff.",
    urgency: "Moderate",
    submittedBy: "Municipal Procurement Division",
    date: "17 Sep 2026",
    status: "Pending Officer Action",
  },
  {
    id: "REV-2026-002",
    requirement: "Solar photovoltaic crystalline modules, 540Wp",
    standard: "IS 14286:2010 / IS/IEC 61215",
    reasonForReview: "MNRE ALMM (Approved List of Models and Manufacturers) mandate requires dual verification alongside BIS Compulsory Registration Scheme.",
    urgency: "High",
    submittedBy: "Solar Energy Corporation",
    date: "12 Sep 2026",
    status: "Pending Officer Action",
  },
  {
    id: "REV-2026-003",
    requirement: "Composite LPG Gas Cylinders for public distribution",
    standard: "IS 16634:2018",
    reasonForReview: "PESO (Petroleum and Explosives Safety Organisation) approval document required alongside BIS certification license.",
    urgency: "High",
    submittedBy: "Public Sector Oil Marketing Co.",
    date: "09 Sep 2026",
    status: "Pending Officer Action",
  },
];

export const Review = () => {
  const [items, setItems] = useState(REVIEW_ITEMS);
  const [actionDone, setActionDone] = useState({});

  const handleApprove = (id) => {
    setActionDone((prev) => ({ ...prev, [id]: "Approved" }));
  };

  const handleFlag = (id) => {
    setActionDone((prev) => ({ ...prev, [id]: "Referred to BIS Committee" }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Human Compliance Review Queue
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Procurement officer sign-off queue for items with committee amendments, dual certifications, or regulatory caveats
          </p>
        </div>

        <Badge variant="review" dot>
          {items.length} Items Pending Review
        </Badge>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardHeader className="bg-slate-50/60 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-500">
                    {item.id}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono font-bold text-xs text-blue-900">
                    {item.standard}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.urgency === "High" ? "warning" : "slate"}>
                    {item.urgency} Urgency
                  </Badge>
                  <span className="text-xs text-slate-400">{item.date}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
                  Requirement:
                </span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  "{item.requirement}"
                </p>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Review Note & Regulatory Caveat:</span>
                </div>
                <p className="leading-relaxed pl-5">{item.reasonForReview}</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Originating unit: <strong>{item.submittedBy}</strong>
                </span>

                {actionDone[item.id] ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" /> {actionDone[item.id]}
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleFlag(item.id)}
                      className="text-xs"
                    >
                      Refer to Technical Committee
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleApprove(item.id)}
                      className="text-xs"
                    >
                      Approve for Tender
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
