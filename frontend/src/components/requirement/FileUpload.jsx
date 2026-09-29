import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { UploadCloud, FileText, ArrowRight } from "lucide-react";
import { UploadedFileCard } from "./UploadedFileCard";
import { ValidationMessage } from "./ValidationMessage";
import { cn } from '../../utils';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const FileUpload = ({ file, onFileSelect, onFileRemove }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState("");
  const inputRef = useRef(null);

  const validateAndProcessFile = (selectedFile) => {
    if (!selectedFile) return;

    setFileError("");

    // Validate extension / MIME
    const allowedExtensions = [".pdf", ".docx"];
    const fileName = selectedFile.name.toLowerCase();
    const isAllowedExt = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!isAllowedExt) {
      setFileError("Only PDF and DOCX files are supported.");
      return;
    }

    // Validate size (10 MB)
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setFileError("File size must be 10 MB or less.");
      return;
    }

    onFileSelect(selectedFile);
  };

  const handleInputChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      validateAndProcessFile(selected);
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
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndProcessFile(droppedFile);
    }
  };

  const handleTriggerBrowse = () => {
    inputRef.current?.click();
  };

  const handleReplace = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    inputRef.current?.click();
  };

  const handleRemove = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setFileError("");
    onFileRemove();
  };

  return (
    <div className="space-y-3">
      {/* Divider */}
      <div className="relative py-2 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <span className="relative bg-white px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
          OR
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 tracking-tight">
            Upload a technical specification
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Upload a procurement specification or tender document and extract relevant requirements.
          </p>
        </div>
        <Link
          to="/documents"
          className="text-xs text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center gap-1 self-start sm:self-auto shrink-0 hover:underline"
        >
          <span>Open Document Intelligence</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Hidden native input */}
      <input
        type="file"
        ref={inputRef}
        onChange={handleInputChange}
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        id="technical-specification-upload"
      />

      {/* File Card or Drop Zone */}
      {file ? (
        <UploadedFileCard
          file={file}
          onRemove={handleRemove}
          onReplace={handleReplace}
        />
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleTriggerBrowse}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-150 select-none",
            isDragOver
              ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20"
              : "border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20"
          )}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleTriggerBrowse();
            }
          }}
          aria-label="Upload technical specification by dragging and dropping or browsing files"
        >
          <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-3 text-blue-700">
            <UploadCloud className="w-6 h-6" />
          </div>

          <p className="text-sm font-semibold text-slate-800">
            Drag & drop your file here
          </p>
          <p className="text-xs text-blue-700 font-medium mt-1">
            or browse files
          </p>

          <p className="text-[11px] text-slate-400 mt-3">
            Supported: <strong>PDF, DOCX</strong> • Maximum file size: <strong>10 MB</strong>
          </p>
        </div>
      )}

      {/* Error message */}
      {fileError && <ValidationMessage message={fileError} />}
    </div>
  );
};
