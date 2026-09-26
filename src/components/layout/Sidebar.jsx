import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  History,
  BookmarkCheck,
  FileCheck2,
  UserCheck,
  HelpCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileText,
  ExternalLink,
  UploadCloud,
  Network,
} from "lucide-react";
import { USER_PROFILE } from "../../data/mockData";
import { cn } from "../../lib/utils";

const mainNavItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "New Recommendation",
    path: "/recommend",
    icon: PlusCircle,
    badge: "New",
  },
  {
    name: "Upload Specification",
    path: "/documents",
    icon: UploadCloud,
    badge: null,
  },
  {
    name: "History",
    path: "/history",
    icon: History,
    badge: "128",
  },
  {
    name: "Saved Recommendations",
    path: "/saved",
    icon: BookmarkCheck,
    badge: "24",
  },
];

const referenceNavItems = [
  {
    name: "Evidence Matrix",
    path: "/evidence",
    icon: FileCheck2,
    badge: null,
  },
  {
    name: "Knowledge Graph",
    path: "/knowledge",
    icon: Network,
    badge: "Allied",
    badgeVariant: "blue",
  },
  {
    name: "Human Review",
    path: "/review",
    icon: UserCheck,
    badge: "7",
    badgeVariant: "amber",
  },
  {
    name: "Help & Standards Docs",
    path: "/help",
    icon: HelpCircle,
    badge: null,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
    badge: null,
  },
];

export const Sidebar = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const location = useLocation();

  const handleLinkClick = () => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800">
        <NavLink
          to="/"
          onClick={handleLinkClick}
          className="flex items-center gap-3 group focus:outline-none"
        >
          {/* Emblem / Logo Icon */}
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-900/30 group-hover:bg-blue-500 transition-colors">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>

          {(!isCollapsed || isMobileOpen) && (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white font-sans">
                  NormWise
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                  BIS AI
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal truncate max-w-[150px]">
                Procurement Intelligence
              </span>
            </div>
          )}
        </NavLink>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Body */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Main Section */}
        <div>
          {(!isCollapsed || isMobileOpen) && (
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Procurement Core
            </p>
          )}
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative group",
                    isActive
                      ? "bg-blue-700 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white",
                    isCollapsed && !isMobileOpen && "justify-center px-2"
                  )}
                  title={isCollapsed && !isMobileOpen ? item.name : undefined}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                    )}
                  />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="truncate">{item.name}</span>
                  )}
                  {(!isCollapsed || isMobileOpen) && item.badge && (
                    <span
                      className={cn(
                        "ml-auto text-xs px-2 py-0.5 rounded-full font-medium",
                        isActive
                          ? "bg-blue-800 text-blue-100"
                          : "bg-slate-800 text-slate-300"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800/80 my-2" />

        {/* Reference Section */}
        <div>
          {(!isCollapsed || isMobileOpen) && (
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Assurance & Settings
            </p>
          )}
          <nav className="space-y-1">
            {referenceNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative group",
                    isActive
                      ? "bg-blue-700 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white",
                    isCollapsed && !isMobileOpen && "justify-center px-2"
                  )}
                  title={isCollapsed && !isMobileOpen ? item.name : undefined}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                    )}
                  />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="truncate">{item.name}</span>
                  )}
                  {(!isCollapsed || isMobileOpen) && item.badge && (
                    <span
                      className={cn(
                        "ml-auto text-xs px-2 py-0.5 rounded-full font-medium",
                        item.badgeVariant === "amber"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : item.badgeVariant === "blue"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : isActive
                          ? "bg-blue-800 text-blue-100"
                          : "bg-slate-800 text-slate-300"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Portal Information Box */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
              <span>BIS National Repository</span>
              <span className="flex items-center gap-1 text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                v2026.3
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              QCO compliance registry updated as per Gazette of India orders.
            </p>
          </div>
        )}
      </div>

      {/* User Profile at Bottom */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/60 transition-colors",
            isCollapsed && !isMobileOpen && "justify-center p-1"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-blue-900 border border-blue-700 text-blue-200 font-semibold text-xs flex items-center justify-center shrink-0">
            {USER_PROFILE.avatarInitials}
          </div>

          {(!isCollapsed || isMobileOpen) && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-white truncate">
                {USER_PROFILE.name}
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                {USER_PROFILE.title}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col shrink-0 border-r border-slate-800 h-screen sticky top-0 transition-all duration-200 z-30",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-over Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 w-72 max-w-[85vw] z-50 md:hidden transform transition-transform duration-200 ease-in-out shadow-2xl",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </div>
    </>
  );
};
