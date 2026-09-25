import React from "react";
import { FileText, CheckCircle2, Trash2, RefreshCw } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

export const UploadedFileCard = ({ file, onRemove, onReplace }) => {
  if (!file) return null;

  const fileSizeFormatted =
    file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${(file.size / 1024).toFixed(1)} KB`;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 text-blue-700">
          <FileText className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 truncate">
              {file.name}
            </span>
            <span className="text-xs text-slate-400 font-mono shrink-0">
              {fileSizeFormatted}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge variant="current" dot className="text-[11px] px-2 py-0">
              Ready to analyze
            </Badge>
            <span className="text-[11px] text-slate-400">
              • Technical clauses detected
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onReplace}
          className="text-xs h-8 px-2.5 text-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1 text-slate-500" />
          <span>Replace</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-xs h-8 px-2.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          <span>Remove</span>
        </Button>
      </div>
    </div>
  );
};
