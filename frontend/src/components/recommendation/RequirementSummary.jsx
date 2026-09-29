import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit2, Languages, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

/**
 * RequirementSummary (Phase 16 Multilingual)
 * Displays the original requirement verbatim, detected language badge,
 * and an expandable "SEARCH REPRESENTATION" panel showing normalized terms.
 */
export const RequirementSummary = ({
  requirement,
  originalText,
  detectedLanguage = "EN",
  languageName,
  normalizedText,
  searchText,
  attributes,
}) => {
  const navigate = useNavigate();
  const [isSearchRepExpanded, setIsSearchRepExpanded] = useState(false);

  const displayOriginal = originalText || requirement || "";
  const displaySearch = searchText || normalizedText || "";
  const langCode = (detectedLanguage || "EN").toUpperCase();

  const getLanguageLabel = () => {
    if (languageName) return languageName;
    const map = {
      EN: "English",
      HI: "Hindi",
      MR: "Marathi",
      BN: "Bengali",
      GU: "Gujarati",
      TA: "Tamil",
      TE: "Telugu",
      KN: "Kannada",
      ML: "Malayalam",
      PA: "Punjabi",
      OR: "Odia",
      UNKNOWN: "Language Unspecified",
    };
    return map[langCode] || "English";
  };

  const handleEditRequirement = () => {
    navigate(`/recommend?q=${encodeURIComponent(displayOriginal)}`);
  };

  const attributeList = [
    { label: "Product", value: attributes?.product || "Standard Product" },
    { label: "Material", value: attributes?.material || "Standard Grade" },
    { label: "Capacity", value: attributes?.capacity || "Standard Capacity" },
    { label: "Application", value: attributes?.application || "Institutional Use" },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-3.5">
      {/* Top Bar with Language Badge and Edit */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            ORIGINAL REQUIREMENT
          </span>
          {/* Section 20 - Language Badge (compact text label, no country flags) */}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Languages className="w-3 h-3 text-blue-600" />
            <span>{getLanguageLabel()}</span>
          </span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleEditRequirement}
          className="text-xs h-7 px-2 text-slate-500 hover:text-blue-700 self-start sm:self-auto font-medium"
        >
          <Edit2 className="w-3 h-3 mr-1" />
          <span>Edit Requirement</span>
        </Button>
      </div>

      {/* Verbatim Original Requirement Text (Section 18) */}
      <p className="text-sm sm:text-base font-semibold text-slate-900 leading-snug font-sans">
        "{displayOriginal}"
      </p>

      {/* Expandable Search Representation (Section 19) */}
      {displaySearch && displaySearch !== displayOriginal && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsSearchRepExpanded((prev) => !prev)}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span>SEARCH REPRESENTATION</span>
            {isSearchRepExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {isSearchRepExpanded && (
            <div className="mt-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs space-y-1 animate-in fade-in duration-150">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Normalized for standards search
              </span>
              <p className="font-mono text-slate-800 text-xs font-medium">
                {displaySearch}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Structured attributes tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {attributeList.map((attr, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              {attr.label}
            </span>
            <span className="font-semibold text-slate-800 block truncate font-sans">
              {attr.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
