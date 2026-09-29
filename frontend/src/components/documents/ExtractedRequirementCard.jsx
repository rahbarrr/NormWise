import React, { useState } from "react";
import { Edit2, RotateCcw, Check, X, FileText, Sparkles } from "lucide-react";
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const ExtractedRequirementCard = ({
  requirement,
  onSaveValue,
  onResetValue,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(requirement.value);

  const isModified = requirement.value !== requirement.originalValue;

  const handleSave = () => {
    onSaveValue(requirement.id, editValue.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(requirement.value);
    setIsEditing(false);
  };

  const getConfidenceBadge = (conf) => {
    switch (conf) {
      case "High":
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            High Confidence
          </span>
        );
      case "Medium":
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            Medium Confidence
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Needs Review
          </span>
        );
    }
  };

  return (
    <div
      id={`req-${requirement.id}`}
      className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors space-y-2.5"
    >
      {/* Top Header: Label, Confidence, Source Reference */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {requirement.label}
          </span>
          {isModified && (
            <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
              Modified
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {getConfidenceBadge(requirement.confidence)}

          <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            Source: {requirement.source}
          </span>
        </div>
      </div>

      {/* Value Display or Inline Editor */}
      {isEditing ? (
        <div className="space-y-2 pt-1">
          <textarea
            rows={2}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-blue-500 bg-blue-50/20 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent leading-relaxed"
          />

          <div className="flex items-center justify-end gap-1.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCancel}
              className="text-xs h-7 px-2.5"
            >
              <X className="w-3 h-3 mr-1" />
              <span>Cancel</span>
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!editValue.trim()}
              className="text-xs h-7 px-2.5"
            >
              <Check className="w-3 h-3 mr-1" />
              <span>Save</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-slate-900 leading-snug">
            {requirement.value}
          </p>

          <div className="flex items-center gap-1 shrink-0">
            {isModified && (
              <button
                type="button"
                onClick={() => onResetValue(requirement.id)}
                className="text-[11px] font-medium text-slate-400 hover:text-slate-600 px-2 py-1 rounded hover:bg-slate-100 flex items-center gap-1 transition-colors"
                title="Reset to original extracted value"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setEditValue(requirement.value);
                setIsEditing(true);
              }}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 px-2.5 py-1 rounded hover:bg-blue-50 flex items-center gap-1 transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
        </div>
      )}

      {requirement.description && (
        <p className="text-[11px] text-slate-400 italic">
          {requirement.description}
        </p>
      )}
    </div>
  );
};
