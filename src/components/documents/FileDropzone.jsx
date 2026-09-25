import React, { useState, useRef } from "react";
import { UploadCloud, FileText, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import { ValidationMessage } from "../recommend/ValidationMessage";
import { Button } from "../ui/Button";
import { cn } from "../../lib/utils";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const FileDropzone = ({
  onFileSelected,
  onSelectSample,
  sampleDocuments = [],
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const validateAndHandle = (file) => {
    if (!file) {
      setError("Please select a document.");
      return;
    }

    setError("");

    // Validate type
    const lowerName = file.name.toLowerCase();
    const isPdf = lowerName.endsWith(".pdf");
    const isDocx = lowerName.endsWith(".docx");

    if (!isPdf && !isDocx) {
      setError("Only PDF and DOCX files are supported.");
      return;
    }

    // Validate size (10 MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("File size must be 10 MB or less.");
      return;
    }

    onFileSelected(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndHandle(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndHandle(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        type="file"
        ref={inputRef}
        onChange={handleInputChange}
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        id="specification-document-upload-input"
      />

      {/* Main Drag-and-drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-150 select-none bg-white",
          isDragOver
            ? "border-blue-500 bg-blue-50/60 ring-4 ring-blue-500/10"
            : "border-slate-300 hover:border-blue-400 hover:bg-slate-50/50 shadow-2xs"
        )}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-label="Upload specification by dragging and dropping or clicking to browse"
      >
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center mx-auto mb-4 text-blue-700 shadow-xs">
          <UploadCloud className="w-7 h-7" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          Upload a procurement specification
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
          Upload a tender, technical specification or product requirement document.
        </p>

        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Drag & drop your file here</span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-bold text-blue-700 hover:underline">
            Browse files
          </span>
        </div>

        <p className="text-[11px] text-slate-400 mt-4">
          Supported: <strong>PDF, DOCX</strong> • Maximum file size: <strong>10 MB</strong>
        </p>

        <div className="mt-4 pt-4 border-t border-slate-100 max-w-sm mx-auto flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Only upload documents you are authorized to process.</span>
        </div>
      </div>

      {/* Error state */}
      {error && <ValidationMessage message={error} />}

      {/* Quick Demo Sample Specifications */}
      {sampleDocuments.length > 0 && (
        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Or load a demonstration tender specification:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {sampleDocuments.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => onSelectSample(doc)}
                className="text-left p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/30 transition-colors group flex items-start gap-2"
              >
                <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-900">
                    {doc.filename}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {doc.type} • {doc.size} • {doc.pages} pages
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
