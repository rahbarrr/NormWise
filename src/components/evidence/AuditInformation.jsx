import React from "react";
import { ShieldCheck, Database, FileCheck } from "lucide-react";
import { MOCK_AUDIT_INFO } from "../../data/mockEvidence";

export const AuditInformation = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 space-y-3.5">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <ShieldCheck className="w-4 h-4 text-blue-700" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
          Traceability Information
        </h4>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold">
            Recommendation ID
          </span>
          <span className="font-mono font-bold text-slate-800 mt-0.5 block">
            {MOCK_AUDIT_INFO.recommendationId}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold">
            Created Date
          </span>
          <span className="font-semibold text-slate-800 mt-0.5 block">
            {MOCK_AUDIT_INFO.createdDate}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold">
            Evidence Records
          </span>
          <span className="font-mono font-bold text-slate-800 mt-0.5 block">
            {MOCK_AUDIT_INFO.evidenceRecordsCount}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold">
            Review Status
          </span>
          <span className="font-semibold text-slate-700 mt-0.5 block">
            {MOCK_AUDIT_INFO.reviewStatus}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100">
        Audit trail metadata preserved for public procurement verification and future backend integration.
      </p>
    </div>
  );
};
