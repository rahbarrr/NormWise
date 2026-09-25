import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ExternalLink,
  ChevronRight,
  Database,
  Plus,
} from "lucide-react";
import { USER_PROFILE } from "../../data/mockData";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { cn } from "../../lib/utils";

const PAGE_TITLES = {
  "/": { title: "Procurement Intelligence Dashboard", section: "Home" },
  "/recommend": { title: "New Standards Recommendation", section: "Procurement Core" },
  "/analyze": { title: "Requirement Technical Analysis", section: "Intelligence Engine" },
  "/results": { title: "Recommendation & Conformity Report", section: "Results" },
  "/evidence": { title: "Clause Traceability & Gazette Evidence", section: "Assurance" },
  "/review": { title: "Human Compliance Review Queue", section: "Assurance" },
  "/history": { title: "Historical Recommendations & Audit Log", section: "Records" },
  "/saved": { title: "Saved Standards & Tender Clauses", section: "Library" },
  "/settings": { title: "Portal Settings & GeM Integration", section: "System" },
  "/help": { title: "Indian Standards & QCO Documentation", section: "Help Center" },
};

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "QCO Amendment Notification: Cookware",
    desc: "DPIIT notified revised conformity dates for IS 2347:2023 under S.O. 124(E).",
    time: "2 hours ago",
    unread: true,
    type: "warning",
  },
  {
    id: 2,
    title: "ETD 35 Review Notice",
    desc: "IS 10322 Part 5 draft revision for smart street lighting is open for public comments.",
    time: "Yesterday",
    unread: true,
    type: "info",
  },
  {
    id: 3,
    title: "BIS Gazette Sync Complete",
    desc: "National digital catalogue updated with 14 new harmonized Indian Standards.",
    time: "2 days ago",
    unread: false,
    type: "success",
  },
];

export const Header = ({ onOpenMobileMenu, onOpenSearch }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const currentPage = PAGE_TITLES[location.pathname] || {
    title: "Standards Intelligence",
    section: "NormWise",
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Left: Mobile menu toggle + Breadcrumb & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex flex-col">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>NormWise</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-600">{currentPage.section}</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight truncate max-w-[260px] sm:max-w-md lg:max-w-lg">
              {currentPage.title}
            </h1>
          </div>
        </div>

        {/* Right Action Icons & Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* BIS Status Badge (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="font-medium text-slate-700">BIS Catalogue: Active Sync</span>
            <span className="text-slate-400 font-mono text-[11px]">(NDS-2026.3)</span>
          </div>

          {/* Search Trigger */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs text-slate-500 bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200 rounded-lg transition-colors"
            title="Search Indian Standards (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Search standards...</span>
            <kbd className="hidden sm:inline-block font-mono text-[10px] bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Quick New Recommendation button if not on /recommend */}
          {location.pathname !== "/recommend" && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate("/recommend")}
              className="hidden sm:inline-flex"
            >
              <Plus className="w-4 h-4" />
              <span>New Standard</span>
            </Button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">
                      Procurement Alerts
                    </span>
                    <Badge variant="blue" className="text-[10px] px-1.5 py-0">
                      2 Unread
                    </Badge>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-blue-700 hover:underline"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {MOCK_NOTIFICATIONS.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        "p-3 sm:p-4 text-xs transition-colors hover:bg-slate-50 cursor-pointer",
                        n.unread && "bg-blue-50/40"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                          {n.type === "warning" && (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          )}
                          {n.type === "success" && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                          {n.type === "info" && (
                            <Database className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          )}
                          <span>{n.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {n.time}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-600 leading-relaxed">{n.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-2 border-t border-slate-100 text-center bg-slate-50/50">
                  <Link
                    to="/help"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-blue-700 font-medium hover:underline inline-flex items-center gap-1"
                  >
                    View Gazette & QCO Bulletin <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userRef}>
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-semibold text-xs flex items-center justify-center shadow-xs">
                {USER_PROFILE.avatarInitials}
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-150">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900 leading-tight">
                    {USER_PROFILE.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {USER_PROFILE.email}
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-800 rounded border border-blue-200">
                    {USER_PROFILE.badge}
                  </span>
                </div>
                <div className="py-1 text-xs text-slate-700">
                  <Link
                    to="/saved"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center px-4 py-2 hover:bg-slate-50 transition-colors"
                  >
                    Saved Standards Library
                  </Link>
                  <Link
                    to="/history"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center px-4 py-2 hover:bg-slate-50 transition-colors"
                  >
                    Audit Trail & History
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center px-4 py-2 hover:bg-slate-50 transition-colors"
                  >
                    Settings & GeM Integration
                  </Link>
                </div>
                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full text-left px-4 py-2 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                  >
                    Sign Out (Demo Session)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
