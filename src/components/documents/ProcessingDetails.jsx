import React, { useState } from "react";
import { Sliders, ChevronDown, ChevronUp, CheckCircle, ShieldAlert, Cpu } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";

export const ProcessingDetails = ({ details = {} }) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    fileType = "PDF",
    extractionMethod = "PDF_TEXT",
    ocrUsed = false,
    ocrAvailable = false,
    requirementsCount = 0,
    quality = "MEDIUM",
  } = details;

  // Format extraction method user label
  const getExtractionLabel = () => {
    if (extractionMethod === "OCR") return "Optical Character Recognition (OCR)";
    if (extractionMethod === "DOCX_TEXT") return "DOCX text extraction";
    return "PDF text extraction";
  };

  // Format OCR label strictly according to rules
  const getOcrLabel = () => {
    if (ocrUsed) return "Used";
    if (!ocrAvailable) return "Unavailable / not required";
    return "Not required";
  };

  return (
    <Card className="border-slate-200/90 shadow-2xs">
      <CardHeader
        onClick={() => setIsOpen(!isOpen)}
        className="py-3 px-4 cursor-pointer hover:bg-slate-50/70 transition-colors flex flex-row items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-700" />
          <CardTitle className="text-xs font-bold text-slate-800 tracking-tight">
            Processing details
          </CardTitle>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono">
            {isOpen ? "Hide" : "Inspect extraction telemetry"}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-2 pb-4 px-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in fade-in duration-100">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Document type</span>
            <span className="font-semibold text-slate-800 block mt-0.5">{fileType}</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Extraction method</span>
            <span className="font-semibold text-slate-800 block mt-0.5">{getExtractionLabel()}</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">OCR</span>
            <span className="font-semibold text-slate-800 block mt-0.5">{getOcrLabel()}</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Requirements identified</span>
            <span className="font-semibold text-blue-700 block mt-0.5">{requirementsCount}</span>
          </div>

          <div className="col-span-2 sm:col-span-4 p-2 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-medium">Text extraction quality assessment:</span>
            <span className="font-bold text-blue-800 font-mono uppercase bg-white px-2 py-0.5 rounded border border-blue-200">
              {quality}
            </span>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
