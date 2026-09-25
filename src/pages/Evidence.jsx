import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileCheck2,
  ShieldCheck,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  Download,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const EVIDENCE_ROWS = [
  {
    id: "EV-01",
    standard: "IS 2347:2023",
    clause: "Clause 6.1",
    parameter: "Material Grade Compliance",
    statutoryRef: "DPIIT QCO S.O. 124(E)",
    testMethod: "Spectrographic Analysis (IS 6911)",
    verdict: "Compliant",
    evidenceSummary: "Requires Austenitic SS 304 food-contact surface certification.",
  },
  {
    id: "EV-02",
    standard: "IS 2347:2023",
    clause: "Clause 7.2",
    parameter: "Hydrostatic Proof Pressure",
    statutoryRef: "BIS Scheme-I Manual",
    testMethod: "Hydraulic test at 3x nominal operating pressure",
    verdict: "Compliant",
    evidenceSummary: "Zero permanent deformation or gasket blow-out required.",
  },
  {
    id: "EV-03",
    standard: "IS 10322 Part 5",
    clause: "Clause 3.1",
    parameter: "Ingress Protection Rating",
    statutoryRef: "MeitY CRS Order 2021",
    testMethod: "IS/IEC 60529 Dust chamber & Water jet",
    verdict: "Under Review",
    evidenceSummary: "IP66 rating required; test report must be from NABL accredited lab.",
  },
  {
    id: "EV-04",
    standard: "IS 3854:1988",
    clause: "Clause 14.1",
    parameter: "Switch Endurance Rating",
    statutoryRef: "Electrical Accessories QCO",
    testMethod: "40,000 make-and-break cycles at 250V AC",
    verdict: "Compliant",
    evidenceSummary: "No mechanical or electrical breakdown under 0.8 PF inductive load.",
  },
  {
    id: "EV-05",
    standard: "IS 4923:2017",
    clause: "Clause 9.3",
    parameter: "Tensile & Yield Strength",
    statutoryRef: "Ministry of Steel QCO",
    testMethod: "IS 1608 Metallic materials tensile test",
    verdict: "Compliant",
    evidenceSummary: "Yield strength YSt 310 certified via Mill Test Certificate.",
  },
];

export const Evidence = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = EVIDENCE_ROWS.filter(
    (r) =>
      r.standard.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.clause.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.parameter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Clause Traceability & Gazette Evidence Matrix
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Trace test requirements, Gazette of India references, and mandatory NABL proof parameters
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
            <span>Export Evidence Sheet</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by Standard, Clause or Test Parameter..."
            className="pl-9 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Evidence Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Standard & Clause</TableHead>
              <TableHead>Test Parameter</TableHead>
              <TableHead>Statutory Reference</TableHead>
              <TableHead>Test Method Standard</TableHead>
              <TableHead>Conformity Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div>
                    <span className="font-mono font-bold text-xs text-blue-900 block">
                      {row.standard}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {row.clause}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      {row.parameter}
                    </span>
                    <span className="text-[11px] text-slate-500 line-clamp-1">
                      {row.evidenceSummary}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="text-xs text-slate-700 font-mono">
                    {row.statutoryRef}
                  </span>
                </TableCell>

                <TableCell>
                  <span className="text-xs text-slate-600">
                    {row.testMethod}
                  </span>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={row.verdict === "Compliant" ? "current" : "review"}
                    dot
                  >
                    {row.verdict}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <Link
                    to={`/results?standard=${encodeURIComponent(row.standard)}`}
                    className="text-xs font-medium text-blue-700 hover:underline inline-flex items-center gap-1"
                  >
                    Report <ChevronRight className="w-3 h-3" />
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
