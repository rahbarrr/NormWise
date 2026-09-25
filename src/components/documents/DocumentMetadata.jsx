import React, { useState } from "react";
import { Info, ChevronDown, ChevronUp, FileCode } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";

export const DocumentMetadata = ({ documentData }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!documentData) return null;

  return (
    <Card className="border-slate-200/90 shadow-2xs">
      <CardHeader
        onClick={() => setIsOpen(!isOpen)}
        className="py-3 px-4 cursor-pointer hover:bg-slate-50/70 transition-colors flex flex-row items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-700" />
          <CardTitle className="text-xs font-bold text-slate-800 tracking-tight">
            Document Information
          </CardTitle>
        </div>

        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-2 pb-4 px-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs animate-in fade-in duration-100">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Filename</span>
            <span className="font-semibold text-slate-800 truncate block mt-0.5" title={documentData.filename}>
              {documentData.filename}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">File Type</span>
            <span className="font-semibold text-slate-800 block mt-0.5">{documentData.type || "PDF"}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">File Size</span>
            <span className="font-semibold text-slate-800 block mt-0.5">{documentData.size}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Pages</span>
            <span className="font-semibold text-slate-800 block mt-0.5">{documentData.pages} Pages</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Uploaded</span>
            <span className="font-semibold text-slate-800 block mt-0.5">{documentData.uploadTime || "Demo timestamp"}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Processing Status</span>
            <span className="font-semibold text-emerald-700 block mt-0.5">{documentData.status || "Completed"}</span>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
