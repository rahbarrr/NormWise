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
import { ProcessingDetails } from "../components/documents/ProcessingDetails";

import {
  uploadDocumentFile,
  processDocument,
  updateDocumentRequirements,
  recommendFromDocument,
} from "../services/api.js";

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Telemetry details for ProcessingDetails component
  const [processingTelemetry, setProcessingTelemetry] = useState(null);

  // Structured Error State
  const [errorState, setErrorState] = useState({
    errorType: "PROCESSING_FAILURE",
    title: "",
    message: "",
  });

  // Toast notification
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  // Convert raw extracted requirements to UI requirement items
  const formatRequirementsToUI = (reqs = {}, fullDoc = {}) => {
    const sourceRefs = reqs.sourceReferences || {};

    const items = [
      {
        id: "product",
        label: "PRODUCT",
        value: reqs.product || "Pressure Cooker",
        originalValue: reqs.product || "Pressure Cooker",
        confidence: reqs.product ? "High" : "Needs Review",
        source: sourceRefs.product?.snippet || (sourceRefs.product?.page ? `Page ${sourceRefs.product.page}` : "Source location unavailable"),
        description: "Primary equipment category identified from specification clauses.",
      },
      {
        id: "material",
        label: "MATERIAL",
        value: reqs.material || "Stainless Steel",
        originalValue: reqs.material || "Stainless Steel",
        confidence: reqs.material ? "High" : "Needs Review",
        source: sourceRefs.material?.snippet || (sourceRefs.material?.page ? `Page ${sourceRefs.material.page}` : "Source location unavailable"),
        description: "Alloy composition or material specification designated for fabrication.",
      },
      {
        id: "capacity",
        label: "CAPACITY",
        value: reqs.capacity || "5 litre",
        originalValue: reqs.capacity || "5 litre",
        confidence: reqs.capacity ? "High" : "Needs Review",
        source: sourceRefs.capacity?.snippet || (sourceRefs.capacity?.page ? `Page ${sourceRefs.capacity.page}` : "Source location unavailable"),
        description: "Nominal operational rating, volumetric threshold, or capacity dimension.",
      },
      {
        id: "application",
        label: "APPLICATION",
        value: reqs.application || "Institutional Kitchen",
        originalValue: reqs.application || "Institutional Kitchen",
        confidence: reqs.application ? "High" : "Needs Review",
        source: sourceRefs.application?.snippet || (sourceRefs.application?.page ? `Page ${sourceRefs.application.page}` : "Source location unavailable"),
        description: "Operating context, deployment environment, or tender end-use criteria.",
      },
    ];

    if (Array.isArray(reqs.technicalCharacteristics) && reqs.technicalCharacteristics.length > 0) {
      items.push({
        id: "technical_characteristics",
        label: "TECHNICAL CHARACTERISTICS",
        value: reqs.technicalCharacteristics.join(", "),
        originalValue: reqs.technicalCharacteristics.join(", "),
        confidence: "Medium",
        source: "Source location unavailable",
        description: "Key operational parameters and auxiliary technical features.",
      });
    }

    return items;
  };

  // Handle uploaded file from picker or drag-drop
  const handleFileSelected = (file) => {
    // 1. Validation checks
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const originalName = file.name || "";
    const ext = originalName.slice(originalName.lastIndexOf(".")).toLowerCase();

    if (file.size > MAX_SIZE) {
      setErrorState({
        errorType: "PROCESSING_FAILURE",
        title: "File Exceeds Maximum Size",
        message: `File "${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)} MB. The maximum supported upload limit is 10 MB.`,
      });
      setStep("error");
      return;
    }

    if (file.size === 0) {
      setErrorState({
        errorType: "PROCESSING_FAILURE",
        title: "Empty File Detected",
        message: `File "${file.name}" has 0 bytes. Please select a valid document.`,
      });
      setStep("error");
      return;
    }

    if (ext !== ".pdf" && ext !== ".docx") {
      setErrorState({
        errorType: "PROCESSING_FAILURE",
        title: "Unsupported File Format",
        message: `"${ext || "Unknown"}" is not a supported file type. Only PDF (.pdf) and Microsoft Word (.docx) documents are permitted.`,
      });
      setStep("error");
      return;
    }

    setSelectedFile(file);
    setCurrentDocData({
      filename: file.name,
      originalFilename: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: ext === ".docx" ? "DOCX" : "PDF",
      pages: 1,
      status: "Ready to process",
    });
    setStep("selected");
  };

  // Handle sample selection
  const handleSelectSample = (sampleDoc) => {
    setSelectedFile({
      name: sampleDoc.filename,
      size: sampleDoc.size,
      type: sampleDoc.type,
      isSample: true,
    });
    setCurrentDocData(sampleDoc);
    setExtractedRequirements(sampleDoc.extractedRequirements);
    setMissingInfo(sampleDoc.missingInformation || []);
    setAmbiguousInfo(sampleDoc.ambiguousInformation || []);
    setProcessingTelemetry({
      fileType: sampleDoc.type,
      extractionMethod: sampleDoc.type === "DOCX" ? "DOCX_TEXT" : "PDF_TEXT",
      ocrUsed: false,
      ocrAvailable: true,
      requirementsCount: sampleDoc.extractedRequirements.length,
      quality: "HIGH",
    });
    setStep("selected");
  };

  // Start Processing Pipeline
  const handleStartProcessing = async () => {
    setStep("processing");

    // Case A: Sample Document demonstration fallback
    if (!selectedFile || selectedFile.isSample) {
      setTimeout(() => {
        setStep("review");
        showToast("Document processed successfully.");
      }, 3500);
      return;
    }

    // Case B: Real Upload and Processing via Express Backend
    try {
      // 1. Upload File
      const uploadRes = await uploadDocumentFile(selectedFile);
      const documentId = uploadRes.documentId;

      // 2. Trigger Extraction Pipeline
      const processRes = await processDocument(documentId);

      // Handle Failures
      if (processRes.status === "FAILED") {
        if (
          processRes.isScannedPdfWithoutOcr ||
          (processRes.error && processRes.error.toLowerCase().includes("scanned")) ||
          (processRes.error && processRes.error.toLowerCase().includes("ocr"))
        ) {
          setErrorState({
            errorType: "OCR_FAILURE",
            title: "OCR Processing Unavailable",
            message: processRes.error || "This document appears to be scanned, but OCR processing is not available.",
          });
        } else {
          setErrorState({
            errorType: "PROCESSING_FAILURE",
            title: "Document processing failed",
            message: processRes.error || "Document processing failed. Please verify the document format and content.",
          });
        }
        setStep("error");
        return;
      }

      const reqs = processRes.requirements || {};

      // Check if usable requirements were found
      if (!reqs.hasUsableRequirements && !reqs.product && !reqs.material) {
        setErrorState({
          errorType: "NO_REQUIREMENTS",
          title: "No usable procurement requirements were identified.",
          message: "Try a more detailed specification or enter the requirement manually.",
        });
        setStep("error");
        return;
      }

      // Map structured requirements
      const formattedReqs = formatRequirementsToUI(reqs, processRes);
      setExtractedRequirements(formattedReqs);

      // Map ambiguities
      const mappedAmbiguities = (reqs.ambiguities || []).map((a, idx) => ({
        id: a.field || `ambiguity-${idx}`,
        field: a.field,
        title: a.type === "MULTIPLE" ? `Multiple ${a.field} references detected` : `${a.field} unclear`,
        message: a.message,
        severity: a.severity || "WARNING",
        options: a.field === "material" ? ["Stainless Steel", "Aluminum"] : ["Institutional Kitchen", "Industrial"],
      }));
      setAmbiguousInfo(mappedAmbiguities);

      // Map missing items
      const missing = [];
      if (!reqs.application) {
        missing.push({
          id: "application",
          label: "Intended Application",
          description: "Operating environment or procurement purpose was not clearly specified in the text.",
        });
      }
      setMissingInfo(missing);

      // Update document metadata state
      setCurrentDocData({
        documentId: processRes.documentId,
        filename: uploadRes.originalFilename || selectedFile.name,
        originalFilename: uploadRes.originalFilename || selectedFile.name,
        type: uploadRes.fileType,
        size: `${(Number(uploadRes.fileSize) / (1024 * 1024)).toFixed(1)} MB`,
        pages: processRes.pageCount || 1,
        uploadTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "Requirements extracted",
        extractedTextSample: reqs.requirementText || "",
        extractionMethod: processRes.extractionMethod,
        quality: processRes.quality,
        ocrUsed: Boolean(processRes.ocrUsed),
      });

      // Save telemetry
      setProcessingTelemetry({
        fileType: uploadRes.fileType,
        extractionMethod: processRes.extractionMethod,
        ocrUsed: Boolean(processRes.ocrUsed),
        ocrAvailable: Boolean(processRes.ocrUsed) || true,
        requirementsCount: formattedReqs.length,
        quality: processRes.quality || "MEDIUM",
      });

      setStep("review");
      showToast("Document processed successfully.");
    } catch (err) {
      console.error("[NormWise] Document processing error:", err);
      setErrorState({
        errorType: "PROCESSING_FAILURE",
        title: "Document processing failed",
        message: err.message || "An unexpected error occurred while communicating with the document service.",
      });
      setStep("error");
    }
  };

  // Reset / Remove File
  const handleResetFile = () => {
    setSelectedFile(null);
    setCurrentDocData(null);
    setStep("upload");
    setIsDraftSaved(false);
    setErrorState({ errorType: "PROCESSING_FAILURE", title: "", message: "" });
  };

  // Save modified requirement field value
  const handleSaveFieldValue = async (id, newValue) => {
    setExtractedRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, value: newValue } : r))
    );

    // Sync to backend if documentId exists
    if (currentDocData?.documentId) {
      try {
        await updateDocumentRequirements(currentDocData.documentId, {
          [id]: newValue,
        });
      } catch (err) {
        console.warn("Could not sync requirement edit to backend:", err.message);
      }
    }

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

  // Navigate to Recommendation Analysis
  const handleAnalyze = async () => {
    setIsAnalyzing(true);

    const product =
      extractedRequirements.find((r) => r.id === "product")?.value || "Pressure Cooker";
    const material =
      extractedRequirements.find((r) => r.id === "material")?.value || "Stainless Steel";
    const capacity =
      extractedRequirements.find((r) => r.id === "capacity")?.value || "5 litre";
    const application =
      extractedRequirements.find((r) => r.id === "application")?.value || "Institutional Kitchen";
    const technicalCharacteristics =
      extractedRequirements.find((r) => r.id === "technical_characteristics")?.value || "";

    const synthesizedQuery = `${material} ${product}, ${capacity}, for ${application}`;

    const attributes = {
      product,
      material,
      capacity,
      application,
      technicalCharacteristics: technicalCharacteristics ? [technicalCharacteristics] : [],
    };

    // If connected to real document in backend:
    let recommendationId = null;
    if (currentDocData?.documentId) {
      try {
        const recommendRes = await recommendFromDocument(currentDocData.documentId, {
          requirements: {
            product,
            material,
            capacity,
            application,
            technicalCharacteristics: technicalCharacteristics ? [technicalCharacteristics] : [],
            requirementText: synthesizedQuery,
          },
        });
        recommendationId = recommendRes?.recommendationId;
      } catch (err) {
        console.warn("Direct document recommendation call failed, falling back to query analysis:", err.message);
      }
    }

    setIsAnalyzing(false);

    // Navigate to /analyze -> /results
    const queryParams = new URLSearchParams();
    queryParams.set("q", synthesizedQuery);
    if (recommendationId) queryParams.set("id", recommendationId);
    if (currentDocData?.filename) queryParams.set("file", currentDocData.filename);

    navigate(`/analyze?${queryParams.toString()}`, {
      state: {
        recommendationId,
        requirementText: synthesizedQuery,
        attributes,
        uploadedFileName: currentDocData?.filename,
        isDocumentExtraction: true,
      },
    });
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

      {/* 4. Step: Processing Screen */}
      {step === "processing" && (
        <div className="max-w-3xl mx-auto py-4">
          <DocumentProcessing onComplete={() => setStep("review")} />
        </div>
      )}

      {/* 5. Step: Review Extracted Requirements Screen */}
      {step === "review" && currentDocData && (
        <div className="space-y-6">
          {/* Document Summary Card */}
          <DocumentSummary
            filename={currentDocData.filename || currentDocData.originalFilename}
            pages={currentDocData.pages || 1}
            requirementsCount={extractedRequirements.length}
            status="Ready for review"
          />

          {/* Collapsible Processing Details */}
          {processingTelemetry && (
            <ProcessingDetails details={processingTelemetry} />
          )}

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
                  fileType={currentDocData.type}
                  pages={currentDocData.pages}
                  sampleText={currentDocData.extractedTextSample}
                  fileBlob={selectedFile instanceof File ? selectedFile : null}
                />
              </div>

              {/* Bottom Action Bar */}
              <DocumentActionBar
                onBack={handleResetFile}
                onSaveDraft={handleSaveDraft}
                onAnalyze={handleAnalyze}
                isDraftSaved={isDraftSaved}
                isLoading={isAnalyzing}
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
                  fileType={currentDocData.type}
                  pages={currentDocData.pages}
                  sampleText={currentDocData.extractedTextSample}
                  fileBlob={selectedFile instanceof File ? selectedFile : null}
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
        <DocumentError
          errorType={errorState.errorType}
          title={errorState.title}
          message={errorState.message}
          onRetry={handleResetFile}
          onUploadAnother={handleResetFile}
        />
      )}
    </div>
  );
};
