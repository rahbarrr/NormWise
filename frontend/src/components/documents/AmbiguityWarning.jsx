import React from "react";
import { HelpCircle, Check, Edit2 } from "lucide-react";
import { Card, CardContent } from '../common/Card';
import { Button } from '../common/Button';

export const AmbiguityWarning = ({
  ambiguousItems = [],
  onConfirmAmbiguity,
  onEditAmbiguity,
}) => {
  if (!ambiguousItems || ambiguousItems.length === 0) return null;

  return (
    <Card className="border-blue-200/90 bg-blue-50/40 shadow-2xs">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-blue-950 font-bold text-xs sm:text-sm">
          <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Some extracted information may be ambiguous</span>
        </div>

        <div className="space-y-2.5">
          {ambiguousItems.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-white/90 rounded-lg border border-blue-200 text-xs text-slate-800 space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-slate-900 block">
                    {item.field}:
                  </span>
                  <span className="text-slate-600 leading-snug">{item.issue}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                  {item.options?.map((opt) => (
                    <Button
                      key={opt}
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => onConfirmAmbiguity(item.id, opt)}
                      className="text-xs h-7 px-2 border-blue-200 text-blue-800 hover:bg-blue-100"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      <span>{opt}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
