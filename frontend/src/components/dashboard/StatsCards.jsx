import React, { useEffect, useState } from "react";
import {
  FileCheck,
  ShieldCheck,
  AlertCircle,
  Bookmark,
} from "lucide-react";
import { DASHBOARD_STATS } from '../../utils/mock/mockData';
import { getRecommendations } from "../../services/api";
import { getStandards } from "../../services/api";
import { cn } from '../../utils';

export const StatsCards = ({ stats: propStats }) => {
  const [liveStats, setLiveStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      try {
        // Fetch recommendation statistics from live API
        const recData = await getRecommendations({ limit: 1 });
        const stdData = await getStandards({ status: "CURRENT" });

        if (isMounted) {
          const statistics = recData?.statistics || {};
          const currentStdsCount = Array.isArray(stdData)
            ? stdData.filter((s) => s.status === "CURRENT").length
            : 0;

          setLiveStats({
            recommendations: statistics.total || DASHBOARD_STATS.recommendations,
            verifiedStandards: currentStdsCount || DASHBOARD_STATS.verifiedStandards,
            underReview: statistics.underReview || DASHBOARD_STATS.underReview,
            saved: statistics.accepted || DASHBOARD_STATS.saved,
          });
        }
      } catch {
        // Fall back to mock data if API unavailable
        if (isMounted) setLiveStats(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchStats();
    return () => { isMounted = false; };
  }, []);

  const stats = propStats || liveStats || DASHBOARD_STATS;

  const cards = [
    {
      label: "Recommendations",
      value: isLoading ? "—" : stats.recommendations,
      subtext: "Evaluated procurement requests",
      icon: FileCheck,
      color: "text-blue-700",
      bg: "bg-blue-50/70 border-blue-200/60",
      indicatorColor: "bg-blue-600",
    },
    {
      label: "Verified Standards",
      value: isLoading ? "—" : stats.verifiedStandards,
      subtext: "Active & currently in-force IS",
      icon: ShieldCheck,
      color: "text-emerald-700",
      bg: "bg-emerald-50/70 border-emerald-200/60",
      indicatorColor: "bg-emerald-600",
    },
    {
      label: "Under Review",
      value: isLoading ? "—" : stats.underReview,
      subtext: "Amendments & committee reviews",
      icon: AlertCircle,
      color: "text-amber-700",
      bg: "bg-amber-50/70 border-amber-200/60",
      indicatorColor: "bg-amber-600",
    },
    {
      label: "Accepted",
      value: isLoading ? "—" : stats.saved,
      subtext: "Approved procurement standards",
      icon: Bookmark,
      color: "text-slate-700",
      bg: "bg-slate-100/70 border-slate-200/60",
      indicatorColor: "bg-slate-600",
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Executive Summary
        </h3>
        <span className="text-[11px] font-medium text-slate-400">
          {liveStats ? "Live Data • PostgreSQL" : "Demo Indicators • Q3 2026"}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  {card.label}
                </span>
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center border",
                    card.bg
                  )}
                >
                  <Icon className={cn("w-4 h-4", card.color)} />
                </div>
              </div>

              <div className="mt-2 flex items-baseline gap-2">
                <span
                  className={cn(
                    "text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans",
                    isLoading && "animate-pulse text-slate-300"
                  )}
                >
                  {card.value}
                </span>
              </div>

              <p className="mt-1 text-[11px] sm:text-xs text-slate-500 truncate">
                {card.subtext}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
