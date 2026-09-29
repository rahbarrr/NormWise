import React from "react";
import { FileText, Trash2, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Card, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const SelectedFileCard = ({
  fileData,
  onRemove,
  onProcess,
  isProcessing = false,
}) => {
  return (
    <Card className="border-slate-200/90 shadow-2xs bg-white overflow-hidden">
      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Document info */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-700 flex items-center justify-center shrink-0 shadow-xs">
            <FileText className="w-6 h-6" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {fileData.filename || fileData.name}
              </h4>
              <Badge variant="blue" className="text-[10px] font-semibold py-0 px-2 shrink-0">
                {fileData.type || "PDF"}
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span>Size: <strong>{fileData.size}</strong></span>
              {fileData.pages && (
                <>
                  <span className="text-slate-300">•</span>
                  <span>Pages: <strong>{fileData.pages}</strong></span>
                </>
              )}
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ready to process</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onRemove}
            disabled={isProcessing}
            className="text-xs h-9 text-slate-600 hover:text-rose-600"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            <span>Remove</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onProcess}
            disabled={isProcessing}
            className="text-xs h-9 font-semibold shadow-xs"
          >
            <span>Process Document</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
