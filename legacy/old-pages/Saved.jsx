import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Copy, Check, ExternalLink, Trash2, FileText, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

const SAVED_ITEMS = [
  {
    id: "SAVED-01",
    standard: "IS 2347:2023",
    title: "Domestic and Commercial Pressure Cookers — Specification",
    category: "Mechanical Utensils",
    dateSaved: "18 Sep 2026",
    clauseSnippet: "The supplier shall supply Stainless Steel Pressure Cookers strictly conforming to IS 2347:2023 (Fifth Revision) bearing valid BIS ISI Mark...",
  },
  {
    id: "SAVED-02",
    standard: "IS 3854:1988",
    title: "Switches for Domestic and Similar Purposes",
    category: "Electrical Accessories",
    dateSaved: "16 Sep 2026",
    clauseSnippet: "All modular electrical switches shall strictly conform to IS 3854:1988 with fire retardant polycarbonate passing 850°C glow wire test...",
  },
  {
    id: "SAVED-03",
    standard: "IS 4923:2017",
    title: "Hollow Steel Sections for Structural Use",
    category: "Structural Steel",
    dateSaved: "15 Sep 2026",
    clauseSnippet: "Hollow sections shall comply with Grade YSt 310 with mill test certificate conforming to Ministry of Steel Quality Control Order...",
  },
];

export const Saved = () => {
  const [items, setItems] = useState(SAVED_ITEMS);
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRemove = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Saved Standards & Tender Clauses Library
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Bookmarked Indian Standards and pre-approved tender specification templates
          </p>
        </div>

        <Badge variant="blue" dot>
          {items.length} Standards Bookmarked
        </Badge>
      </div>

      <div className="space-y-4">
        {items.length > 0 ? (
          items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-blue-900">
                      {item.standard}
                    </span>
                    <Badge variant="slate">{item.category}</Badge>
                  </div>
                  <span className="text-xs text-slate-400">
                    Saved on {item.dateSaved}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-slate-900">
                  {item.title}
                </h4>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 leading-relaxed">
                  {item.clauseSnippet}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove from Library</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleCopy(item.clauseSnippet, item.id)}
                      className="text-xs"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          <span>Copy Clause</span>
                        </>
                      )}
                    </Button>

                    <Link to={`/results?standard=${encodeURIComponent(item.standard)}`}>
                      <Button size="sm" variant="primary" className="text-xs">
                        <span>View Standard Report</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
            <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">
              No standards bookmarked yet
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Save recommendations from the results screen to reuse them in future tenders.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
