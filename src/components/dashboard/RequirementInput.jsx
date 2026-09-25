import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  FileText,
  X,
  Search,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Textarea";
import { EXAMPLE_REQUIREMENTS } from "../../data/mockData";
import { cn } from "../../lib/utils";

export const RequirementInput = ({ initialQuery = "", onAnalyze }) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedFile, setSelectedFile] = useState(null);
  const [inputError, setInputError] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleSelectExample = (exampleText) => {
    setQuery(exampleText);
    setInputError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedExtensions = [".pdf", ".docx", ".doc"];
      const fileName = file.name.toLowerCase();
      const isValid = allowedExtensions.some((ext) => fileName.endsWith(ext));

      if (!isValid) {
        setInputError("Please upload a valid PDF or DOCX technical specification.");
        return;
      }

      setSelectedFile(file);
      setInputError("");
      // If query is empty, provide a prompt reference to the uploaded file
      if (!query.trim()) {
        setQuery(`Technical Specification: ${file.name} (Extracting procurement parameters...)`);
      }
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitAnalysis = (e) => {
    e.preventDefault();
    if (!query.trim() && !selectedFile) {
      setInputError("Please describe a procurement requirement or upload a specification document.");
      return;
    }

    if (onAnalyze) {
      onAnalyze({ query, file: selectedFile });
    } else {
      navigate(`/analyze?q=${encodeURIComponent(query)}&file=${encodeURIComponent(selectedFile ? selectedFile.name : "")}`);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 sm:p-6 md:p-8">
      {/* Hidden file input supporting PDF and DOCX */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        id="spec-upload-input"
      />

      <form onSubmit={handleSubmitAnalysis} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label
            htmlFor="procurement-requirement-input"
            className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2"
          >
            <span>Procurement Requirement Description</span>
            <span className="text-xs font-normal text-slate-500">
              (Technical parameters or product scope)
            </span>
          </label>
          <span className="text-xs text-slate-400">
            Plain text or RFP clause
          </span>
        </div>

        {/* Textarea Input */}
        <div className="relative">
          <Textarea
            id="procurement-requirement-input"
            rows={4}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (inputError) setInputError("");
            }}
            placeholder="Example: Stainless steel pressure cooker, 5 litre, for institutional kitchen use"
            className={cn(
              "text-base sm:text-sm font-sans placeholder:text-slate-400 focus-visible:ring-blue-600",
              inputError && "border-rose-400 focus-visible:ring-rose-500"
            )}
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setInputError("");
              }}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-1 rounded-md"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Uploaded File Chip (if any) */}
        {selectedFile && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-blue-900 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-blue-700 shrink-0" />
              <span className="font-semibold truncate">{selectedFile.name}</span>
              <span className="text-blue-600 shrink-0">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Ready for Parsing
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-blue-100/50"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error message */}
        {inputError && (
          <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>{inputError}</span>
          </p>
        )}

        {/* Actions bar: Analyze + Upload Spec + Helper text */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="font-medium px-5 shadow-xs"
            >
              <span>Analyze Requirement</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleTriggerUpload}
              className="font-medium"
            >
              <UploadCloud className="w-4 h-4 text-slate-600" />
              <span>Upload Specification</span>
            </Button>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>Accepted formats: <strong>PDF, DOCX</strong> (Max 25MB)</span>
          </div>
        </div>
      </form>

      {/* Example Chips Section */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 shrink-0">
            Try an example:
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {EXAMPLE_REQUIREMENTS.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => handleSelectExample(ex.query)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200 transition-colors cursor-pointer group"
                title={`Populate: "${ex.query}"`}
              >
                <span>{ex.label}</span>
                <span className="text-[10px] text-slate-400 group-hover:text-blue-700">
                  ↵
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
