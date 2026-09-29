import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, RotateCcw, Edit3, Upload, FileText } from "lucide-react";
import { Button } from '../common/Button';

export const DocumentError = ({
  errorType = "PROCESSING_FAILURE",
  title,
  message,
  onRetry,
  onUploadAnother,
}) => {
  const navigate = useNavigate();

  // OCR Failure Configuration
  if (errorType === "OCR_FAILURE") {
    return (
      <div className="py-10 text-center bg-white rounded-2xl border border-amber-200/80 shadow-2xs p-6 space-y-4 max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            {title || "OCR Processing Unavailable"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            {message || "This document appears to be scanned, but OCR processing is not available."}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
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

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onUploadAnother || onRetry}
            className="text-xs"
          >
            <FileText className="w-3.5 h-3.5 mr-1" />
            <span>Upload Text-Based PDF</span>
          </Button>

          {onRetry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              <span>Try Another Document</span>
            </Button>
          )}
        </div>
      </div>
    );
  }

  // No Requirements Found Configuration
  if (errorType === "NO_REQUIREMENTS") {
    return (
      <div className="py-10 text-center bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4 max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center mx-auto shadow-xs">
          <FileText className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            {title || "No usable procurement requirements were identified."}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            {message || "Try a more detailed specification or enter the requirement manually."}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => navigate("/recommend")}
            className="text-xs font-semibold"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1" />
            <span>Enter Manually</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onRetry}
            className="text-xs"
          >
            <Upload className="w-3.5 h-3.5 mr-1" />
            <span>Upload Another Document</span>
          </Button>
        </div>
      </div>
    );
  }

  // Default: Processing Failure
  return (
    <div className="py-10 text-center bg-white rounded-2xl border border-rose-200/90 shadow-2xs p-6 space-y-4 max-w-xl mx-auto">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center mx-auto shadow-xs">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          {title || "Document processing failed"}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
          {message || "An unexpected error occurred while parsing the document. Please try again."}
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        {onRetry && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onRetry}
            className="text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span>Retry</span>
          </Button>
        )}

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onUploadAnother || onRetry}
          className="text-xs"
        >
          <Upload className="w-3.5 h-3.5 mr-1" />
          <span>Upload Another Document</span>
        </Button>
      </div>
    </div>
  );
};

