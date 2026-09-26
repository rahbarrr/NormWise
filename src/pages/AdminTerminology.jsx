import React, { useState, useEffect, useCallback } from "react";
import {
  Languages,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import {
  getTerminologyApi,
  createTerminologyApi,
  updateTerminologyApi,
  approveTerminologyApi,
  rejectTerminologyApi,
  deleteTerminologyApi,
} from "../services/api";

const LANGUAGE_LABELS = {
  ALL: "All Languages",
  EN: "English",
  HI: "Hindi (हिन्दी)",
  MR: "Marathi (मराठी)",
  BN: "Bengali (বাংলা)",
  GU: "Gujarati (ગુજરાતી)",
  TA: "Tamil (தமிழ்)",
  TE: "Telugu (తెలుగు)",
  KN: "Kannada (ಕನ್ನಡ)",
  ML: "Malayalam (മലയാളം)",
  PA: "Punjabi (ਪੰਜਾਬੀ)",
  OR: "Odia (ଓଡ଼ିଆ)",
};

const TERM_TYPES = ["ALL", "PRODUCT", "MATERIAL", "APPLICATION", "TECHNICAL", "UNIT", "ABBREVIATION"];

export function AdminTerminology() {
  const [terms, setTerms] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedLanguage, setSelectedLanguage] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedVerified, setSelectedVerified] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);
  const [formData, setFormData] = useState({
    term: "",
    normalizedTerm: "",
    language: "HI",
    termType: "PRODUCT",
    category: "GENERAL",
    source: "MANUAL_VERIFIED",
  });
  const [isSaving, setIsSaving] = useState(false);

  const loadTerms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getTerminologyApi({
        page: pagination.page,
        limit: pagination.limit,
        language: selectedLanguage,
        termType: selectedType,
        isVerified: selectedVerified,
        search: searchQuery,
      });

      setTerms(res.items || []);
      setPagination(res.pagination || { total: 0, page: 1, limit: 20, pages: 1 });
    } catch (err) {
      console.error("Failed to load terminology:", err);
      setError(err.message || "Failed to load terminology records.");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, selectedLanguage, selectedType, selectedVerified, searchQuery]);

  useEffect(() => {
    loadTerms();
  }, [loadTerms]);

  const handleApprove = async (id) => {
    try {
      await approveTerminologyApi(id);
      loadTerms();
    } catch (err) {
      alert(`Approval failed: ${err.message}`);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectTerminologyApi(id);
      loadTerms();
    } catch (err) {
      alert(`Rejection failed: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this terminology record?")) return;
    try {
      await deleteTerminologyApi(id);
      loadTerms();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!formData.term.trim() || !formData.normalizedTerm.trim()) {
      alert("Both source term and normalized term are required.");
      return;
    }

    try {
      setIsSaving(true);
      if (editingTerm) {
        await updateTerminologyApi(editingTerm.id, formData);
      } else {
        await createTerminologyApi(formData);
      }
      setIsAddModalOpen(false);
      setEditingTerm(null);
      setFormData({
        term: "",
        normalizedTerm: "",
        language: "HI",
        termType: "PRODUCT",
        category: "GENERAL",
        source: "MANUAL_VERIFIED",
      });
      loadTerms();
    } catch (err) {
      alert(`Failed to save terminology: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (termItem) => {
    setEditingTerm(termItem);
    setFormData({
      term: termItem.term,
      normalizedTerm: termItem.normalizedTerm,
      language: termItem.language,
      termType: termItem.termType,
      category: termItem.category || "GENERAL",
      source: termItem.source || "MANUAL_VERIFIED",
    });
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6 px-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Languages className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Multilingual Terminology Governance
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            Manage and verify technical terminology across 11 Indian languages. Verified terms anchor deterministic retrieval without translation drift.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadTerms}
            className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              setEditingTerm(null);
              setFormData({
                term: "",
                normalizedTerm: "",
                language: "HI",
                termType: "PRODUCT",
                category: "GENERAL",
                source: "MANUAL_VERIFIED",
              });
              setIsAddModalOpen(true);
            }}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Technical Term</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search source or normalized term..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Language Filter */}
          <div>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {TERM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === "ALL" ? "All Term Types" : t}
                </option>
              ))}
            </select>
          </div>

          {/* Verified Status Filter */}
          <div>
            <select
              value={selectedVerified}
              onChange={(e) => setSelectedVerified(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Verification States</option>
              <option value="true">Verified Only</option>
              <option value="false">Pending Review Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Terminology Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading && (
          <div className="p-8 text-center text-xs text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
            Loading terminology dataset...
          </div>
        )}

        {!loading && error && (
          <div className="p-6 text-center text-xs text-rose-600 bg-rose-50 border-b border-rose-200">
            <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-rose-500" />
            {error}
          </div>
        )}

        {!loading && !error && terms.length === 0 && (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">No terminology records found</p>
            <p className="text-slate-400">Add verified technical terms or adjust search filters.</p>
          </div>
        )}

        {!loading && !error && terms.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Source Term (Indic)</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Normalized Canonical (English)</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {terms.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 font-sans">
                      {item.term}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {item.language}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      {item.normalizedTerm}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                        {item.termType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {item.source || "MANUAL_VERIFIED"}
                    </td>
                    <td className="py-3 px-4">
                      {item.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Pending Review</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {item.isVerified ? (
                        <button
                          onClick={() => handleReject(item.id)}
                          title="Mark Pending / Unverified"
                          className="p-1 text-slate-400 hover:text-amber-600 rounded transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApprove(item.id)}
                          title="Approve Term"
                          className="p-1 text-slate-400 hover:text-emerald-600 rounded transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(item)}
                        title="Edit Term"
                        className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Delete Record"
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingTerm ? "Edit Technical Term" : "Add Verified Technical Term"}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Source Technical Term (in Indic script) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. स्टेनलेस स्टील or પ્રેશર કૂકર"
                  value={formData.term}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Normalized Canonical Term (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. stainless steel or pressure cooker"
                  value={formData.normalizedTerm}
                  onChange={(e) => setFormData({ ...formData, normalizedTerm: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Language *</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    {Object.entries(LANGUAGE_LABELS)
                      .filter(([c]) => c !== "ALL")
                      .map(([code, label]) => (
                        <option key={code} value={code}>
                          {label}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Term Type *</label>
                  <select
                    value={formData.termType}
                    onChange={(e) => setFormData({ ...formData, termType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    {TERM_TYPES.filter((t) => t !== "ALL").map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Kitchenware, Civil & Piping, Electrical"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  {isSaving ? "Saving..." : editingTerm ? "Update Term" : "Add Term"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
