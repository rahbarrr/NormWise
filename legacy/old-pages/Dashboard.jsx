import React from "react";
import { useNavigate } from "react-router-dom";
import { HeroSection } from "../components/dashboard/HeroSection";
import { RequirementInput } from "../components/dashboard/RequirementInput";
import { StatsCards } from "../components/dashboard/StatsCards";
import { QuickActions } from "../components/dashboard/QuickActions";
import { RecentRecommendations } from "../components/dashboard/RecentRecommendations";
import { WorkflowSteps } from "../components/dashboard/WorkflowSteps";

export const Dashboard = () => {
  const navigate = useNavigate();

  const handleStartNewRecommendation = () => {
    navigate("/recommend");
  };

  const handleAnalyzeRequirement = ({ query, file }) => {
    navigate(
      `/analyze?q=${encodeURIComponent(query)}&file=${encodeURIComponent(
        file ? file.name : ""
      )}`
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Hero Section */}
      <HeroSection onNewRecommendation={handleStartNewRecommendation} />

      {/* Main Requirement Input Card */}
      <RequirementInput onAnalyze={handleAnalyzeRequirement} />

      {/* Dashboard Summary Statistics */}
      <StatsCards />

      {/* Quick Actions (Three compact cards) */}
      <QuickActions />

      {/* Recent Recommendations (Clean table / list) */}
      <RecentRecommendations />

      {/* Dashboard Workflow Explanation */}
      <WorkflowSteps />
    </div>
  );
};
