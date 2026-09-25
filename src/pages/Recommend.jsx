import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  UploadCloud,
  FileText,
  X,
  ShieldCheck,
  Building,
  CheckCircle2,
  HelpCircle,
  Layers,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { EXAMPLE_REQUIREMENTS } from "../data/mockData";

export const Recommend = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [department, setDepartment] = useState("Ministry of Heavy Industries / PSU");
  const [procurementMode, setProcurementMode] = useState("GeM Custom Bid");
  const [qcoStrictOnly, setQcoStrictOnly] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError("");
      if (!query.trim()) {
        setQuery(`Technical Specification: ${file.name}`);
      }
    }
  };

  const handleStartAnalysis = (e) => {
    e.preventDefault();
    if (!query.trim() && !selectedFile) {
      setError("Please describe the procurement requirement or upload a technical specification.");
      return;
    }
    navigate(
      `/analyze?q=${encodeURIComponent(query)}&dept=${encodeURIComponent(
        department
      )}&qco=${qcoStrictOnly}&file=${encodeURIComponent(
        selectedFile ? selectedFile.name : ""
      )}`
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          New Standards Recommendation
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Specify technical requirement details to determine mandatory Indian Standards (IS), valid Gazette amendments, and certification schemes.
        </p>
      </div>

      <form onSubmit={handleStartAnalysis} className="space-y-6">
        {/* Main Input Card */}
        <Card>
          <CardHeader>
            <CardTitle>1. Procurement Scope & Technical Description</CardTitle>
            <CardDescription>
              Enter item nomenclature, functional performance metrics, or key dimensions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Textarea
                rows={5}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Example: Stainless steel pressure cooker, 5 litre, for institutional kitchen use with safety valve conforming to BIS specifications."
                className="text-sm font-sans"
              />
              {error && (
                <p className="text-xs text-rose-600 font-medium mt-1.5">{error}</p>
              )}
            </div>

            {/* Quick Example Chips */}
            <div className="pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Populate with an example requirement:
              </span>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_REQUIREMENTS.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => {
                      setQuery(ex.query);
                      setError("");
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors text-left"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload Area */}
            <div className="pt-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc"
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-700" />
                    <span className="font-semibold text-blue-900">{selectedFile.name}</span>
                    <span className="text-blue-600">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-5 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20"
                >
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">
                    Upload Technical Specification or NIT (PDF / DOCX)
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Drag and drop or click to browse (Max 25MB). Auto-extracts testing clauses.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Procurement Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>2. Institutional Procurement Parameters</CardTitle>
            <CardDescription>
              Tailor the conformity evaluation according to your department's procurement rules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Procuring Department / PSU
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option>Ministry of Heavy Industries / PSU</option>
                  <option>Central Public Works Department (CPWD)</option>
                  <option>Department of Food & Public Distribution</option>
                  <option>Municipal Corporation Public Works</option>
                  <option>Rail Vikas Nigam Limited (RVNL)</option>
                  <option>Defence Research & Development Organisation (DRDO)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Tender Platform / Method
                </label>
                <select
                  value={procurementMode}
                  onChange={(e) => setProcurementMode(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option>Government e-Marketplace (GeM Custom Bid)</option>
                  <option>Central Public Procurement Portal (CPPP)</option>
                  <option>Open Competitive Bidding (RFP / NIT)</option>
                  <option>Limited Departmental Tender</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={qcoStrictOnly}
                  onChange={(e) => setQcoStrictOnly(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">
                    Prioritize Mandatory Quality Control Orders (QCO)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Flag whether statutory BIS ISI mark is compulsory by law under Gazette notifications (DPIIT / MeitY / MoRTH).
                  </span>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/")}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="font-semibold shadow-sm"
          >
            <span>Run Standards Intelligence Analysis</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </form>
    </div>
  );
};
