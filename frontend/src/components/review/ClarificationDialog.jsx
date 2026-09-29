import React, { useState } from "react";
import { HelpCircle, X, Send } from "lucide-react";
import { Button } from '../common/Button';

const CLARIFICATION_CATEGORIES = [
  "Product",
  "Material",
  "Application",
  "Technical specification",
  "Certification",
  "Other",
];

export const ClarificationDialog = ({
  isOpen,
  onClose,
  onSubmitClarification,
}) => {
  const [category, setCategory] = useState("Technical specification");
  const [question, setQuestion] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    onSubmitClarification({ category, question });
    setQuestion("");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Request Clarification</h3>
              <p className="text-xs text-slate-500">
                Formulate an information request for the originating procurement unit.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Clarification Category (Optional)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CLARIFICATION_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`text-xs p-2 rounded-lg border text-center font-medium transition-colors ${
                    category === cat
                      ? "bg-blue-50 border-blue-500 text-blue-900 font-bold"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Question / clarification needed <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What information should be clarified? (e.g. Confirm intended maximum operating pressure and food contact grade certificate requirement...)"
              className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors leading-relaxed"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!question.trim()}
              className="text-xs font-semibold"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              <span>Submit Clarification</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
