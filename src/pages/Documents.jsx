import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentHeader } from "../components/documents/DocumentHeader";
import { FileDropzone } from "../components/documents/FileDropzone";
import { SelectedFileCard } from "../components/documents/SelectedFileCard";
import { DocumentProcessing } from "../components/documents/DocumentProcessing";
import { DocumentSummary } from "../components/documents/DocumentSummary";
import { ExtractedRequirements } from "../components/documents/ExtractedRequirements";
import { MissingInformation } from "../components/documents/MissingInformation";
import { AmbiguityWarning } from "../components/documents/AmbiguityWarning";
import { DocumentHighlights } from "../components/documents/DocumentHighlights";
import { DocumentPreview } from "../components/documents/DocumentPreview";
import { DocumentMetadata } from "../components/documents/DocumentMetadata";
import { SupportedDocuments } from "../components/documents/SupportedDocuments";
import { DocumentActionBar } from "../components/documents/DocumentActionBar";
import { DocumentError } from "../components/documents/DocumentError";

import { MOCK_DOCUMENTS } from "../data/mockDocuments";

export const Documents = () => {
  const navigate = useNavigate();

  // Workflow step: "upload" | "selected" | "processing" | "review" | "error"
  const [step, setStep] = useState("upload");
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentDocData, setCurrentDocData] = useState(null);

  // Extracted fields & warning states
  const [extractedRequirements, setExtractedRequirements] = useState([]);
  const [missingInfo, setMissingInfo] = useState([]);
  const [ambiguousInfo, setAmbiguousInfo] = useState([]);
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  // Handle uploaded file from picker or drag-drop
  const handleFileSelected = (file) => {
    const matchedMock = MOCK_DOCUMENTS.find(
      (d) => d.filename.toLowerCase() === file.name.toLowerCase()
    ) || {
      ...MOCK_DOCUMENTS[0],
      filename: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.name.endsWith(".docx") ? "DOCX" : "PDF",
    };

    setSelectedFile(file);
    setCurrentDocData(matchedMock);
    setExtractedRequirements(matchedMock.extractedRequirements);
    setMissingInfo(matchedMock.missingInformation || []);
    setAmbiguousInfo(matchedMock.ambiguousInformation || []);
    setStep("selected");
  };

  // Handle sample selection
  const handleSelectSample = (sampleDoc) => {
    setSelectedFile({
      name: sampleDoc.filename,
      size: sampleDoc.size,
      type: sampleDoc.type,
    });
    setCurrentDocData(sampleDoc);
    setExtractedRequirements(sampleDoc.extractedRequirements);
    setMissingInfo(sampleDoc.missingInformation || []);
    setAmbiguousInfo(sampleDoc.ambiguousInformation || []);
    setStep("selected");
  };

  // Start Processing
  const handleStartProcessing = () => {
    setStep("processing");
  };

  // Processing Completed
  const handleProcessingComplete = () => {
    setStep("review");
    showToast("Document processed successfully.");
  };

  // Reset / Remove File
  const handleResetFile = () => {
    setSelectedFile(null);
    setCurrentDocData(null);
    setStep("upload");
    setIsDraftSaved(false);
  };

  // Save modified requirement field value
  const handleSaveFieldValue = (id, newValue) => {
    setExtractedRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, value: newValue } : r))
    );
    showToast("Requirement parameter updated.");
  };

  // Reset modified requirement field value to original
  const handleResetFieldValue = (id) => {
    setExtractedRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, value: r.originalValue } : r))
    );
    showToast("Value reset to original extraction.");
  };

  // Add missing information value
  const handleAddMissingInformation = (missingId, value) => {
    setMissingInfo((prev) => prev.filter((m) => m.id !== missingId));
    setExtractedRequirements((prev) => [
      ...prev,
      {
        id: missingId,
        label: missingId.replace(/_/g, " ").toUpperCase(),
        value,
        originalValue: value,
        confidence: "Medium",
        source: "User added — Review",
        description: "Manually specified during document requirement review.",
      },
    ]);
    showToast("Additional information recorded.");
  };

  // Confirm ambiguous information value
  const handleConfirmAmbiguity = (ambiguousId, confirmedOption) => {
    setAmbiguousInfo((prev) => prev.filter((a) => a.id !== ambiguousId));
    setExtractedRequirements((prev) =>
      prev.map((r) =>
        r.id === "application" || r.id === ambiguousId
          ? { ...r, value: `${r.value} (${confirmedOption})` }
          : r
      )
    );
    showToast(`Confirmed clarification: ${confirmedOption}`);
  };

  // Scroll to field on highlight click
  const handleScrollToField = (fieldId) => {
    const el = document.getElementById(`req-${fieldId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-blue-500", "transition-all");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-blue-500");
      }, 1500);
    }
  };

  // Save Draft
  const handleSaveDraft = () => {
    setIsDraftSaved(true);
    try {
      localStorage.setItem(
        "normwise_document_draft",
        JSON.stringify({
          document: currentDocData,
          requirements: extractedRequirements,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (e) {
      // Local storage fallback
    }
    showToast("Draft saved to procurement library.");
  };

  // Navigate to Analysis
  const handleAnalyze = () => {
    // Synthesize requirement summary query
    const product =
      extractedRequirements.find((r) => r.id === "product")?.value || "Pressure Cooker";
    const material =
      extractedRequirements.find((r) => r.id === "material")?.value || "Stainless Steel";
    const capacity =
      extractedRequirements.find((r) => r.id === "capacity")?.value || "5 litre";
    const application =
      extractedRequirements.find((r) => r.id === "application")?.value || "Institutional Kitchen";

    const synthesizedQuery = `${material} ${product}, ${capacity}, for ${application}`;

    const attributes = {
      product,
      material,
      capacity,
      application,
      technicalCharacteristics:
        extractedRequirements.find((r) => r.id === "technical_characteristics")?.value || "",
    };

    navigate(
      `/analyze?q=${encodeURIComponent(synthesizedQuery)}&file=${encodeURIComponent(
        currentDocData?.filename || ""
      )}`,
      {
        state: {
          requirementText: synthesizedQuery,
          attributes,
          uploadedFileName: currentDocData?.filename,
          isDocumentExtraction: true,
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* 1. Header with Breadcrumb and Manual entry link */}
      <DocumentHeader />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-xl bg-slate-900 text-white text-xs font-medium flex items-center justify-between gap-3 shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
            <span>{toastMessage}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700 shrink-0">
            Document Intelligence
          </span>
        </div>
      )}

      {/* 2. Step: Upload Screen */}
      {step === "upload" && (
        <div className="max-w-4xl mx-auto space-y-6">
          <FileDropzone
            onFileSelected={handleFileSelected}
            onSelectSample={handleSelectSample}
            sampleDocuments={MOCK_DOCUMENTS}
          />
          <SupportedDocuments />
        </div>
      )}

      {/* 3. Step: File Selected State */}
      {step === "selected" && selectedFile && (
        <div className="max-w-4xl mx-auto space-y-6">
          <SelectedFileCard
            fileData={currentDocData || selectedFile}
            onRemove={handleResetFile}
            onProcess={handleStartProcessing}
          />
          <SupportedDocuments />
        </div>
      )}

      {/* 4. Step: Processing Screen (6-8s simulated workflow) */}
      {step === "processing" && (
        <div className="max-w-3xl mx-auto py-4">
          <DocumentProcessing onComplete={handleProcessingComplete} />
        </div>
      )}

      {/* 5. Step: Review Extracted Requirements Screen */}
      {step === "review" && currentDocData && (
        <div className="space-y-6">
          {/* Document Summary Card */}
          <DocumentSummary
            filename={currentDocData.filename}
            pages={currentDocData.pages}
            requirementsCount={extractedRequirements.length}
            status="Ready for review"
          />

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* LEFT COLUMN: Extracted Requirements, Missing Info, Ambiguity */}
            <div className="lg:col-span-8 space-y-6">
              {/* Core Extracted Requirements List */}
              <ExtractedRequirements
                requirements={extractedRequirements}
                onSaveValue={handleSaveFieldValue}
                onResetValue={handleResetFieldValue}
              />

              {/* Missing Information Prompt */}
              <MissingInformation
                missingItems={missingInfo}
                onAddInformation={handleAddMissingInformation}
              />

              {/* Ambiguity Warning */}
              <AmbiguityWarning
                ambiguousItems={ambiguousInfo}
                onConfirmAmbiguity={handleConfirmAmbiguity}
              />

              {/* Mobile View: Document Preview placed below requirements */}
              <div className="lg:hidden">
                <DocumentPreview
                  filename={currentDocData.filename}
                  pages={currentDocData.pages}
                  sampleText={currentDocData.extractedTextSample}
                />
              </div>

              {/* Bottom Action Bar */}
              <DocumentActionBar
                onBack={handleResetFile}
                onSaveDraft={handleSaveDraft}
                onAnalyze={handleAnalyze}
                isDraftSaved={isDraftSaved}
              />
            </div>

            {/* RIGHT COLUMN: Highlights Checklist, Desktop Preview, Metadata */}
            <div className="lg:col-span-4 space-y-6">
              {/* Document Highlights Checklist */}
              <DocumentHighlights
                requirements={extractedRequirements}
                ambiguityCount={ambiguousInfo.length}
                onScrollToField={handleScrollToField}
              />

              {/* Desktop Document Preview */}
              <div className="hidden lg:block">
                <DocumentPreview
                  filename={currentDocData.filename}
                  pages={currentDocData.pages}
                  sampleText={currentDocData.extractedTextSample}
                />
              </div>

              {/* Document Metadata Expandable */}
              <DocumentMetadata documentData={currentDocData} />

              {/* Supported Format Guide */}
              <SupportedDocuments />
            </div>
          </div>
        </div>
      )}

      {/* 6. Step: Error State Fallback */}
      {step === "error" && (
        <DocumentError onRetry={handleResetFile} />
      )}
    </div>
  );
};
