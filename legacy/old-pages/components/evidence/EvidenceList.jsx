import React from "react";
import { EvidenceCard } from "./EvidenceCard";

export const EvidenceList = ({ records, onViewDetails }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          Supporting Evidence Records ({records.length})
        </h3>
        <span className="text-[11px] text-slate-400 font-medium">
          Demonstration Grounding Index
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {records.map((record) => (
          <EvidenceCard
            key={record.id}
            record={record}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );
};
