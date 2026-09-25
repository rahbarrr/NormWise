import React, { useState } from "react";
import { MessageSquareText, Save, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";

export const ReviewerNotes = ({
  notes = "",
  onSaveNotes,
}) => {
  const [currentNotes, setCurrentNotes] = useState(notes);
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  const maxChars = 1000;

  const handleSave = () => {
    onSaveNotes(currentNotes);
    setIsSavedRecently(true);
    setTimeout(() => {
      setIsSavedRecently(false);
    }, 3000);
  };

  return (
    <Card className="border-slate-200/90 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareText className="w-4 h-4 text-blue-700" />
            <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
              Reviewer Notes
            </CardTitle>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Record observations, assumptions, clarifications or procurement-specific notes.
          </p>
        </div>

        {isSavedRecently && (
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 animate-in fade-in duration-150">
            <Check className="w-3.5 h-3.5" />
            <span>Review notes saved</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        <div className="relative">
          <textarea
            rows={4}
            maxLength={maxChars}
            value={currentNotes}
            onChange={(e) => setCurrentNotes(e.target.value)}
            placeholder="Add observations, assumptions, clarifications or procurement-specific notes..."
            className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 bg-slate-50/40 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors font-sans leading-relaxed resize-y"
          ></textarea>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[11px] font-mono text-slate-400">
            {currentNotes.length} / {maxChars}
          </span>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={!currentNotes.trim() && !notes}
            className="text-xs font-semibold h-8.5"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            <span>Save Notes</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
