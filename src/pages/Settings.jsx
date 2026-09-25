import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Building,
  Key,
  Bell,
  ShieldCheck,
  CheckCircle2,
  Database,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { USER_PROFILE } from "../data/mockData";

export const Settings = () => {
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div className="pb-2 border-b border-slate-200">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Portal Settings & GeM Integration
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure procuring organization details, GeM API sync tokens, and BIS Gazette notifications
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Procuring Organization Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Procuring Department Information</CardTitle>
            <CardDescription>
              Details applied by default when generating procurement clauses and RFP schedules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Officer Name
                </label>
                <Input defaultValue={USER_PROFILE.name} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Designation / Role
                </label>
                <Input defaultValue={USER_PROFILE.title} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Ministry / Department
                </label>
                <Input defaultValue={USER_PROFILE.organization} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Official Email (Gov / PSU Domain)
                </label>
                <Input defaultValue={USER_PROFILE.email} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Credentials (Mock) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Government e-Marketplace (GeM) & CPPP Connector</CardTitle>
              <Badge variant="current" dot>Connected</Badge>
            </div>
            <CardDescription>
              Direct bridge to GeM custom bids, product catalogue, and Additional Terms & Conditions (ATC)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  GeM Buyer Organization ID
                </label>
                <Input defaultValue="GEM-ORG-ND-2024-889" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  CPPP E-Procurement Portal Key
                </label>
                <Input defaultValue="••••••••••••••••••••••••" type="password" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database & Sync Status */}
        <Card>
          <CardHeader>
            <CardTitle>Standards Database & Quality Control Orders (QCO) Feed</CardTitle>
            <CardDescription>
              Live synchronization parameters with the Bureau of Indian Standards digital gazette
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-700" />
                <span className="font-semibold text-slate-800">
                  BIS National Database Sync
                </span>
              </div>
              <Badge variant="current">Active: Daily Cron (02:00 IST)</Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span className="font-semibold text-slate-800">
                  DPIIT Gazette QCO Feed
                </span>
              </div>
              <Badge variant="current">742 Mandatory Orders In-Force</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Settings saved successfully!
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Button type="submit" variant="primary">
              Save Configuration
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
