import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { Search, ArrowRight, BookOpen, ShieldCheck, FileText } from "lucide-react";
import { RECENT_RECOMMENDATIONS, EXAMPLE_REQUIREMENTS } from "../../data/mockData";

export const AppShell = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Keyboard shortcut for Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredResults = searchQuery.trim()
    ? RECENT_RECOMMENDATIONS.filter(
        (r) =>
          r.requirement.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.recommendedStandard.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.standardTitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectResult = (item) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    navigate(`/results?standard=${encodeURIComponent(item.recommendedStandard)}`);
  };

  const handleQuickExample = (ex) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    navigate(`/recommend?q=${encodeURIComponent(ex.query)}`);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        <main className="flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {children}
        </main>

        {/* Professional Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span className="font-semibold text-slate-700">NormWise</span>
              <span>— AI-Powered Indian Standards Intelligence for Procurement</span>
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <span>Aligned with BIS Act 2016 & GeM Procurement Guidelines</span>
              <span className="hidden md:inline">•</span>
              <span className="text-slate-400">Demonstration Platform (Phase 1)</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Quick Search Modal (Cmd+K) */}
      <Modal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        title="Search Indian Standards & Requirements"
        description="Search active Indian Standards, technical specifications, or past procurement rulings"
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., IS 2347, pressure cooker, LED street lighting..."
              className="pl-10 text-base"
              autoFocus
            />
          </div>

          {searchQuery.trim() ? (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {filteredResults.length > 0 ? (
                filteredResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    className="p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 group-hover:text-blue-700">
                          {item.recommendedStandard}
                        </span>
                        <Badge
                          variant={item.status === "Current" ? "current" : "review"}
                          dot
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                        {item.standardTitle}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 shrink-0" />
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No matching standards found for "{searchQuery}". Try searching by IS number or product name.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Quick Example Requirements
              </p>
              <div className="space-y-1.5">
                {EXAMPLE_REQUIREMENTS.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => handleQuickExample(ex)}
                    className="w-full text-left p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-700" />
                      <span className="text-xs font-medium text-slate-800 group-hover:text-blue-700">
                        {ex.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{ex.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
