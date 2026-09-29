import React from "react";
import { Check, ShieldCheck, Info, X, Lightbulb, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';

export const GuidancePanel = () => {
  const points = [
    { title: "Product or equipment name", desc: "e.g., Pressure cooker, LED luminaire, Distribution transformer" },
    { title: "Material or construction", desc: "e.g., Stainless steel 304, Polycarbonate, Galvanized iron" },
    { title: "Intended application", desc: "e.g., Institutional kitchen, Municipal highway, Office building" },
    { title: "Capacity / size / rating", desc: "e.g., 5 litre, 120W, 16A 250V AC, Fe 500D" },
    { title: "Important technical characteristics", desc: "e.g., Safety valve, IP66 rated, Surge protection 10kV" },
  ];

  return (
    <div className="space-y-5">
      {/* Main Guidance Card */}
      <Card className="border-slate-200/90 shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-blue-700" />
            <CardTitle className="text-sm font-bold text-slate-900 tracking-tight">
              What makes a good requirement?
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <ul className="space-y-2.5">
            {points.map((p, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                <span className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <div>
                  <strong className="text-slate-900 font-semibold">{p.title}</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{p.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Visual Comparison Card */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Example Comparison
            </span>

            <div className="space-y-2 text-xs">
              {/* Instead of */}
              <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200/70 flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <div>
                  <span className="font-semibold text-rose-900 block text-[11px]">
                    Instead of:
                  </span>
                  <p className="text-rose-800 font-mono text-[11px] mt-0.5">
                    "Pressure cooker"
                  </p>
                </div>
              </div>

              {/* Try this */}
              <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/70 flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <div>
                  <span className="font-semibold text-emerald-900 block text-[11px]">
                    Try:
                  </span>
                  <p className="text-emerald-950 font-medium text-xs mt-0.5 leading-snug">
                    "Stainless steel pressure cooker, 5 litre, for institutional kitchen use"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust & Privacy Card */}
      <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200/80 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <ShieldCheck className="w-4 h-4 text-blue-700" />
          <span>Why this matters</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          NormWise uses the information you provide to identify relevant standards and supporting evidence. Recommendations should be reviewed before being used in procurement documents.
        </p>
        <p className="text-[10px] text-slate-400 leading-tight">
          Disclaimer: This intelligence tool assists procurement officials in conforming to the Bureau of Indian Standards Act 2016 and General Financial Rules (GFR).
        </p>
      </div>
    </div>
  );
};
