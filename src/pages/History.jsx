import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  History as HistoryIcon,
  Search,
  Filter,
  Download,
  Calendar,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { AUDIT_HISTORY } from "../data/mockData";

export const History = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = AUDIT_HISTORY.filter((item) => {
    const matchesSearch =
      item.requirement.toLowerCase().includes(search.toLowerCase()) ||
      item.recommendedStandard.toLowerCase().includes(search.toLowerCase()) ||
      item.department.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Historical Recommendations & Audit Log
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Complete audit trail of standards evaluated for institutional procurement and tender drafting
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
            className="text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            <span>Export Audit Trail (CSV)</span>
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, IS code, or procuring department..."
            className="pl-9 text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">All Standards Status</option>
            <option value="current">Current Only</option>
            <option value="review">Under Review Only</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Evaluation Ref & Date</TableHead>
              <TableHead>Requirement & Department</TableHead>
              <TableHead>Recommended Standard</TableHead>
              <TableHead>Conformity</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-slate-50/80"
                onClick={() =>
                  navigate(`/results?standard=${encodeURIComponent(row.recommendedStandard)}`)
                }
              >
                <TableCell>
                  <span className="font-mono text-xs font-semibold text-slate-700 block">
                    {row.id}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" /> {row.date}
                  </span>
                </TableCell>

                <TableCell>
                  <div>
                    <span className="font-semibold text-sm text-slate-900 block line-clamp-1">
                      {row.requirement}
                    </span>
                    <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {row.department}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="font-mono font-bold text-xs text-blue-900 block">
                    {row.recommendedStandard}
                  </span>
                  <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {row.standardTitle}
                  </span>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={row.status === "Current" ? "current" : "review"}
                    dot
                  >
                    {row.status}
                  </Badge>
                </TableCell>

                <TableCell>
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {row.confidence}%
                  </span>
                </TableCell>

                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <Link
                    to={`/results?standard=${encodeURIComponent(row.recommendedStandard)}`}
                    className="text-xs font-semibold text-blue-700 hover:underline inline-flex items-center gap-1"
                  >
                    Details <ChevronRight className="w-3 h-3" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
