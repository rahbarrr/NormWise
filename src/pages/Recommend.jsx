import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Languages,
} from "lucide-react";
import { RequirementTextarea } from "../components/recommend/RequirementTextarea";
import { ExampleRequirement } from "../components/recommend/ExampleRequirement";
import { FileUpload } from "../components/recommend/FileUpload";
import { RequirementSummary } from "../components/recommend/RequirementSummary";
import { GuidancePanel } from "../components/recommend/GuidancePanel";
import { ValidationMessage } from "../components/recommend/ValidationMessage";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import {
  EXAMPLE_REQUIREMENTS_PHASE2,
  extractSimulatedAttributes,
} from "../data/mockRequirements";
import { runRecommendationEngine } from "../services/api";

export const Recommend = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Primary input states
  const initialQuery = searchParams.get("q") || "";
  const [requirementText, setRequirementText] = useState(initialQuery);
  const [selectedLanguage, setSelectedLanguage] = useState("AUTO");
  const [selectedExampleId, setSelectedExampleId] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Extracted attributes state
  const [extractedAttributes, setExtractedAttributes] = useState(
    initialQuery ? extractSimulatedAttributes(initialQuery) : null
  );

  // Interaction feedback states
  const [validationError, setValidationError] = useState("");
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Update attributes whenever text or file changes if not explicitly overridden
  useEffect(() => {
    if (requirementText.trim() || uploadedFile) {
      const simulated = extractSimulatedAttributes(
        requirementText,
        uploadedFile ? uploadedFile.name : ""
      );
      setExtractedAttributes(simulated);
    } else {
      setExtractedAttributes(null);
      setSelectedExampleId(null);
    }
  }, [requirementText, uploadedFile]);

  // Handle example click
  const handleSelectExample = (example) => {
    setRequirementText(example.text);
    setSelectedExampleId(example.id);
    setExtractedAttributes({ ...example.attributes });
    setValidationError("");
  };

  // Handle text change
  const handleTextChange = (text) => {
    setRequirementText(text);
    setValidationError("");
    if (selectedExampleId) {
      const match = EXAMPLE_REQUIREMENTS_PHASE2.find((e) => e.id === selectedExampleId);
      if (match && match.text !== text) {
        setSelectedExampleId(null);
      }
    }
  };

  // Handle file select
  const handleFileSelect = (file) => {
    setUploadedFile(file);
    setValidationError("");
  };

  // Handle file remove
  const handleFileRemove = () => {
    setUploadedFile(null);
  };

  // Handle attribute inline update
  const handleUpdateAttribute = (key, newValue) => {
    setExtractedAttributes((prev) => ({
      ...prev,
      [key]: newValue,
    }));
  };

  // Handle save draft
  const handleSaveDraft = () => {
    if (!requirementText.trim() && !uploadedFile) {
      setValidationError("Please describe your procurement requirement before saving a draft.");
      return;
    }
    setIsDraftSaved(true);
    setValidationError("");
    setTimeout(() => {
      setIsDraftSaved(false);
    }, 3500);
  };

  // Handle analyze submit
  const handleStartAnalysis = async (e) => {
    e.preventDefault();

    if (!requirementText.trim() && !uploadedFile) {
      setValidationError("Please describe your procurement requirement.");
      return;
    }

    const targetQuery = requirementText.trim()
      ? requirementText
      : `Specification: ${uploadedFile.name}`;

    setIsAnalyzing(true);
    setValidationError("");

    try {
      const apiResult = await runRecommendationEngine(targetQuery, {
        language: selectedLanguage === "AUTO" ? null : selectedLanguage,
      });
      navigate(
        `/analyze?id=${encodeURIComponent(apiResult.recommendationId)}&q=${encodeURIComponent(targetQuery)}&file=${encodeURIComponent(
          uploadedFile ? uploadedFile.name : ""
        )}`,
        {
          state: {
            recommendationId: apiResult.recommendationId,
            apiResult,
            requirementText: targetQuery,
            file: uploadedFile ? { name: uploadedFile.name, size: uploadedFile.size } : null,
            attributes: apiResult.requirement || extractedAttributes,
            detectedLanguage: apiResult.detectedLanguage || selectedLanguage,
          },
        }
      );
    } catch (err) {
      console.warn("API recommendation error, continuing with client state:", err.message);
      navigate(
        `/analyze?q=${encodeURIComponent(targetQuery)}&file=${encodeURIComponent(
          uploadedFile ? uploadedFile.name : ""
        )}`,
        {
          state: {
            requirementText: targetQuery,
            file: uploadedFile ? { name: uploadedFile.name, size: uploadedFile.size } : null,
            attributes: extractedAttributes,
          },
        }
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isAnalyzeDisabled = !requirementText.trim() && !uploadedFile;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Page Title & Subtitle */}
      <div className="pb-2 border-b border-slate-200/80">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
          New Recommendation
        </h2>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          Describe your procurement requirement and NormWise will identify potentially applicable Indian Standards.
        </p>
      </div>

      {/* Draft Saved Toast Notification */}
      {isDraftSaved && (
        <div
          role="status"
          aria-live="polite"
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Draft saved. Your requirement and extracted attributes have been locally preserved.</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-normal">Active session</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN: Requirement Input Card */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-slate-200/90 shadow-xs">
            <CardContent className="p-5 sm:p-7 space-y-6">
              {/* Requirement Language Selector (Section 17 - Phase 16) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Procurement Requirement
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <Languages className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <label htmlFor="req-language" className="text-slate-500 font-medium">Requirement language:</label>
                  <select
                    id="req-language"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none shadow-2xs cursor-pointer"
                  >
                    <option value="AUTO">Auto Detect</option>
                    <option value="EN">English</option>
                    <option value="HI">Hindi (हिन्दी)</option>
                    <option value="MR">Marathi (मराठी)</option>
                    <option value="BN">Bengali (বাংলা)</option>
                    <option value="GU">Gujarati (ગુજરાતી)</option>
                    <option value="TA">Tamil (தமிழ்)</option>
                    <option value="TE">Telugu (తెలుగు)</option>
                    <option value="KN">Kannada (ಕನ್ನಡ)</option>
                    <option value="ML">Malayalam (മലയാളം)</option>
                    <option value="PA">Punjabi (ਪੰਜਾਬੀ)</option>
                    <option value="OR">Odia (ଓଡ଼ିଆ)</option>
                  </select>
                </div>
              </div>

              {/* Textarea Section */}
              <RequirementTextarea
                value={requirementText}
                onChange={handleTextChange}
                maxLength={2000}
                error={!!validationError}
                disabled={isAnalyzing}
              />

              {/* Try an Example */}
              <ExampleRequirement
                selectedId={selectedExampleId}
                onSelect={handleSelectExample}
              />

              {/* File Upload Section */}
              <FileUpload
                file={uploadedFile}
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
              />

              {/* Validation Error Banner */}
              {validationError && (
                <ValidationMessage message={validationError} />
              )}

              {/* Requirement Preview / Summary (Appears when text or file exists) */}
              {extractedAttributes && (
                <div className="pt-2">
                  <RequirementSummary
                    attributes={extractedAttributes}
                    onUpdateAttribute={handleUpdateAttribute}
                  />
                </div>
              )}

              {/* Action Buttons Bar */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handleSaveDraft}
                  disabled={isAnalyzing}
                  className="order-2 sm:order-1 text-slate-700 font-medium"
                >
                  <Bookmark className="w-4 h-4 mr-1.5 text-slate-500" />
                  <span>Save Draft</span>
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleStartAnalysis}
                  disabled={isAnalyzeDisabled || isAnalyzing}
                  isLoading={isAnalyzing}
                  className="order-1 sm:order-2 font-semibold shadow-xs px-6"
                >
                  <span>{isAnalyzing ? "Analyzing requirement..." : "Analyze Requirement →"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Guidance & Trust Panel */}
        <div className="lg:col-span-4 space-y-6">
          <GuidancePanel />
        </div>
      </div>
    </div>
  );
};
