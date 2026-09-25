import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, RotateCcw, Edit3 } from "lucide-react";
import { Button } from "../ui/Button";

export const DocumentError = ({
  title = "Document processing could not be completed",
  message = "No procurement requirements were identified from this document. Try uploading a more detailed technical specification or enter the requirement manually.",
  onRetry,
}) => {
  const navigate = useNavigate();

  return (
    <div className="py-10 text-center bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4 max-w-xl mx-auto">
      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
          {message}
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        {onRetry && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onRetry}
            className="text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span>Try Another Document</span>
          </Button>
        )}

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => navigate("/recommend")}
          className="text-xs font-semibold"
        >
          <Edit3 className="w-3.5 h-3.5 mr-1" />
          <span>Enter Requirement Manually</span>
        </Button>
      </div>
    </div>
  );
};
