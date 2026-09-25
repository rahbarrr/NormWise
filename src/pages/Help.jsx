import React from "react";
import {
  HelpCircle,
  BookOpen,
  Scale,
  FileCheck,
  ShieldAlert,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

export const Help = () => {
  const faqs = [
    {
      q: "What is a Quality Control Order (QCO) and why is it mandatory for government procurement?",
      a: "A Quality Control Order (QCO) is a statutory order issued by Ministries (such as DPIIT, MeitY, Ministry of Steel) under the Bureau of Indian Standards Act, 2016. Once a QCO is notified in the Gazette of India, manufacturing, importing, selling, or procuring that item without a valid BIS Standard Mark (ISI Mark or CRS Registration) is prohibited by law. In public tenders (GeM and CPPP), procuring non-QCO compliant items violates General Financial Rules (GFR).",
    },
    {
      q: "What is the difference between Scheme-I (ISI Mark) and Scheme-II (CRS)?",
      a: "Scheme-I is the traditional ISI mark scheme where BIS factory surveillance, testing of factory samples, and continuous quality inspection are mandatory. Scheme-II is the Compulsory Registration Scheme (CRS), primarily applicable to IT and electronic products (regulated by MeitY), where products are type-tested in NABL/BIS recognized laboratories and registered without continuous factory surveillance.",
    },
    {
      q: "How does NormWise determine the applicable Indian Standard?",
      a: "NormWise performs multi-vector classification comparing your item's functional scope, technical ratings, materials, and intended application against the official BIS National Catalogue, Technical Committee codes (MED, ETD, CED, MTD, etc.), and active Quality Control Orders.",
    },
    {
      q: "What should a procurement officer do when an item is marked 'Under Review'?",
      a: "A standard is flagged 'Under Review' when a draft amendment is circulated by BIS technical committees, a transition period exists between older and newer editions, or dual approvals (such as PESO or MNRE ALMM) are needed. Review the specific note and consult the Human Review queue before finalizing the NIT clause.",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div className="pb-2 border-b border-slate-200">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Indian Standards & QCO Procurement Guidance
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Legal frameworks, conformity assessment guidelines, and BIS Act 2016 principles
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <Scale className="w-5 h-5 text-blue-700" />
          <h4 className="text-xs font-bold text-slate-900 uppercase">
            BIS Act 2016
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Statutory framework establishing the Bureau of Indian Standards as the National Standards Body of India.
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <ShieldAlert className="w-5 h-5 text-amber-700" />
          <h4 className="text-xs font-bold text-slate-900 uppercase">
            Quality Control Orders
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Statutory mandates making ISI mark compulsory for public health, safety, and domestic manufacturing quality.
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <FileCheck className="w-5 h-5 text-emerald-700" />
          <h4 className="text-xs font-bold text-slate-900 uppercase">
            GeM Tender Clauses
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Legally enforceable technical parameters ready for direct insertion into Additional Terms & Conditions (ATC).
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions (Procurement & Standards)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="divide-y divide-slate-100">
            {faqs.map((faq, idx) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0 space-y-1.5">
                <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                  {faq.q}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
