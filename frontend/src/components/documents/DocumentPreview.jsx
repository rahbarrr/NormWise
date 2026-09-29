import React, { useState, useEffect } from "react";
import { FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileCode } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';

export const DocumentPreview = ({
  filename = "pressure_cooker_specification.pdf",
  fileType = "PDF",
  pages = 1,
  sampleText = "",
  fileBlob = null,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [pdfUrl, setPdfUrl] = useState(null);

  const isDocx = (fileType || "").toUpperCase() === "DOCX" || (filename || "").toLowerCase().endsWith(".docx");

  useEffect(() => {
    if (fileBlob && !isDocx && fileBlob.type === "application/pdf") {
      const url = URL.createObjectURL(fileBlob);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [fileBlob, isDocx]);

  return (
    <Card className="border-slate-200/90 shadow-2xs overflow-hidden">
      <CardHeader className="py-2.5 px-4 bg-slate-50/80 border-b border-slate-200 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-700" />
          <CardTitle className="text-xs font-bold text-slate-800 tracking-tight">
            Document Preview
          </CardTitle>
        </div>

        {/* Page & Zoom Controls (Only active for text/PDF preview) */}
        {!isDocx && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded hover:bg-slate-200/70 disabled:opacity-40"
              title="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="font-mono text-[11px] px-1 text-slate-700">
              Page {currentPage} of {pages || 1}
            </span>

            <button
              type="button"
              disabled={currentPage >= (pages || 1)}
              onClick={() => setCurrentPage((p) => Math.min(pages || 1, p + 1))}
              className="p-1 rounded hover:bg-slate-200/70 disabled:opacity-40"
              title="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <span className="text-slate-300 mx-1">|</span>

            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(80, z - 10))}
              className="p-1 rounded hover:bg-slate-200/70 text-slate-500"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="font-mono text-[10px] text-slate-500">{zoomLevel}%</span>

            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(140, z + 10))}
              className="p-1 rounded hover:bg-slate-200/70 text-slate-500"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 bg-slate-100/50 space-y-3">
        {isDocx ? (
          <div className="bg-white rounded-lg border border-dashed border-slate-300 p-8 text-center space-y-2">
            <FileCode className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-xs font-semibold text-slate-700">
              Document preview is not available in this MVP.
            </h4>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Text extraction and requirement analysis have processed the contents of <span className="font-mono text-slate-700">{filename}</span>.
            </p>
          </div>
        ) : pdfUrl ? (
          <div className="bg-white rounded-lg border border-slate-300 overflow-hidden shadow-xs h-[260px]">
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&page=${currentPage}`}
              title="PDF Preview"
              className="w-full h-full border-none"
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-300 shadow-xs p-5 min-h-[200px] text-xs text-slate-700 font-serif leading-relaxed relative overflow-hidden">
            <div className="border-b border-slate-100 pb-2 mb-3 font-sans flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate max-w-[180px]">{filename}</span>
              <span className="font-mono uppercase">{fileType} EXTRACT</span>
            </div>

            <p className="line-clamp-6 text-slate-600 font-sans text-xs">
              {sampleText ||
                "Tender Specification: Pressure cooking equipment constructed from food-grade austenitic stainless steel sheet with nominal operating capacity of 5 litres. Must include multi-tier spring safety valves and heat-resistant handles for institutional pantry and commercial kitchen installation."}
            </p>

            <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-sans text-slate-400">
              <span>Extracted Text Preview</span>
              <span>Page {currentPage} of {pages || 1}</span>
            </div>
          </div>
        )}

        <p className="text-[11px] text-slate-400 text-center leading-normal">
          {isDocx ? "DOCX document parsed via native OpenXML extraction." : "Preview rendered from uploaded document text."}
        </p>
      </CardContent>
    </Card>
  );
};

