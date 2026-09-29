import React from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "../ui/Table";
import { Card } from "../ui/Card";
import { HistoryRow } from "./HistoryRow";
import { HistoryCard } from "./HistoryCard";

export const HistoryTable = ({
  records = [],
  onToggleSave,
  onArchiveRequest,
  onOpenEvidenceDrawer,
}) => {
  return (
    <div>
      {/* Desktop & Tablet Table View */}
      <div className="hidden md:block">
        <Card className="border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="w-24">ID</TableHead>
                  <TableHead>Requirement</TableHead>
                  <TableHead>Recommended Standard</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <HistoryRow
                    key={record.id}
                    record={record}
                    onToggleSave={onToggleSave}
                    onArchiveRequest={onArchiveRequest}
                    onOpenEvidenceDrawer={onOpenEvidenceDrawer}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3">
        {records.map((record) => (
          <HistoryCard
            key={record.id}
            record={record}
            onToggleSave={onToggleSave}
            onArchiveRequest={onArchiveRequest}
          />
        ))}
      </div>
    </div>
  );
};
