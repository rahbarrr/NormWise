/**
 * NormWise API Service Client
 * Connects frontend to Express + PostgreSQL + Prisma REST API
 * Handles fallback gracefully to demonstration data when server is unavailable.
 */
import { MOCK_HISTORY_RECORDS, getHistoryItemById } from "../../utils/mock/mockHistory.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "/api";

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Core HTTP Request Wrapper
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const headers = { ...options.headers };
  
  // Set JSON header only if not FormData and not already set
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // Attach CSRF token on state-changing requests if cookie exists
  const method = (options.method || "GET").toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && !headers["X-CSRF-Token"]) {
    const csrfToken = getCookie("normwise_csrf");
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }
  }

  try {
    const response = await fetch(url, {
      credentials: "include",
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.error?.message || `HTTP error! Status: ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    console.warn(`[NormWise API] Request to ${url} failed:`, error.message);
    throw error;
  }
}

/**
 * Format DB enum status to user-facing UI title case
 */
export function formatStatusToUI(status) {
  if (!status) return "Pending Review";
  const map = {
    PENDING_REVIEW: "Pending Review",
    ACCEPTED: "Accepted",
    UNDER_TECHNICAL_REVIEW: "Under Technical Review",
    CLARIFICATION_REQUESTED: "Clarification Requested",
    NOT_APPLICABLE: "Not Applicable",
  };
  return map[status] || status;
}

/**
 * Format UI status to DB enum
 */
export function formatStatusToDB(status) {
  if (!status || status === "ALL") return "";
  const map = {
    "Pending Review": "PENDING_REVIEW",
    Accepted: "ACCEPTED",
    "Under Technical Review": "UNDER_TECHNICAL_REVIEW",
    "Clarification Requested": "CLARIFICATION_REQUESTED",
    "Not Applicable": "NOT_APPLICABLE",
  };
  return map[status] || status;
}

/**
 * Adapts PostgreSQL Prisma Recommendation for UI components
 */
export function adaptRecommendation(rec) {
  if (!rec) return null;

  const primaryRs = rec.recommendationStandards?.find((rs) => rs.isPrimary) 
    || rec.recommendationStandards?.[0] 
    || null;
  const primaryStd = primaryRs?.standard || null;

  const latestReview = rec.reviews?.[0] || null;

  const scoreBreakdown = {
    productScore: primaryRs?.productScore ?? 0.92,
    applicationScore: primaryRs?.applicationScore ?? 0.85,
    materialScore: primaryRs?.materialScore ?? 0.90,
    technicalScore: primaryRs?.technicalScore ?? 0.70,
    semanticScore: primaryRs?.semanticScore ?? 0.88,
  };

  return {
    ...rec,
    // UI compatibility fields
    id: rec.id,
    requirement: rec.requirementText || rec.requirement || "",
    requirementText: rec.requirementText || rec.requirement || "",
    standard: primaryStd?.standardNumber || rec.standard || "IS 2347:2023",
    standardTitle: primaryStd?.title || rec.standardTitle || "Pressure cookers — Specification",
    confidence: rec.confidence ?? (primaryRs?.matchScore ? Math.round(primaryRs.matchScore * 100) : 94),
    matchScore: primaryRs?.matchScore ?? (rec.confidence ? rec.confidence / 100 : 0.94),
    scoreBreakdown,
    currentnessStatus: primaryStd?.status || "CURRENT",
    engineVersion: rec.engineVersion || "hybrid-v1",
    retrievalMethod: rec.retrievalMethod || "HYBRID",
    originalText: rec.originalText || rec.requirementText || rec.requirement || "",
    detectedLanguage: rec.detectedLanguage || "EN",
    originalLanguage: rec.originalLanguage || rec.detectedLanguage || "EN",
    normalizedText: rec.normalizedText || rec.requirementText || "",
    translationText: rec.translationText || null,
    normalizationMethod: rec.normalizationMethod || "DETERMINISTIC",
    translationMethod: rec.translationMethod || null,
    status: formatStatusToUI(rec.status),
    rawStatus: rec.status,
    reviewer: latestReview?.reviewer?.name || rec.user?.name || "Dr. Ananya Verma",
    reviewerRole: latestReview?.reviewer?.role || "Technical Reviewer",
    createdAt: rec.createdAt ? new Date(rec.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Today",
    rawDate: rec.createdAt,
    saved: Boolean(rec.saved),
    archived: Boolean(rec.archived),
    department: rec.department || "General Procurement Directorate",
    decisionNotes: rec.decisionNotes || latestReview?.notes || "",
    // Retain rich relations
    standards: rec.recommendationStandards?.map((rs) => ({
      ...rs.standard,
      matchConfidence: rs.matchConfidence,
      matchScore: rs.matchScore,
      productScore: rs.productScore,
      applicationScore: rs.applicationScore,
      materialScore: rs.materialScore,
      technicalScore: rs.technicalScore,
      semanticScore: rs.semanticScore,
      retrievedBy: rs.retrievedBy,
      reason: rs.reason,
      isPrimary: rs.isPrimary,
    })) || [],
    alternatives: rec.recommendationStandards?.filter((rs) => !rs.isPrimary)?.map((rs) => ({
      id: rs.standard?.id || rs.id,
      standardId: rs.standardId,
      standardNumber: rs.standard?.standardNumber,
      code: rs.standard?.standardNumber,
      title: rs.standard?.title,
      status: rs.standard?.status || "CURRENT",
      matchScore: rs.matchScore ?? (rs.matchConfidence ? rs.matchConfidence / 100 : 0.75),
      matchConfidence: rs.matchConfidence ?? 75,
      scoreBreakdown: {
        productScore: rs.productScore,
        applicationScore: rs.applicationScore,
        materialScore: rs.materialScore,
        technicalScore: rs.technicalScore,
        semanticScore: rs.semanticScore,
      },
      retrievedBy: rs.retrievedBy || ["lexical"],
      reason: rs.reason || "Alternative candidate standard",
    })) || [],
    evidence: rec.evidence || [],
    review: latestReview,
    auditEvents: (rec.auditEvents || []).map((e) => ({
      id: e.id,
      timestamp: new Date(e.createdAt).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      action: e.action.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
      actor: e.actor?.name || "System Actor",
      details: e.details,
    })),
  };
}

// ----------------------------------------------------
// Recommendations API
// ----------------------------------------------------

export async function getRecommendations(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    if (params.limit) query.set("limit", params.limit);
    if (params.search) query.set("search", params.search);
    if (params.status) query.set("status", formatStatusToDB(params.status));
    if (params.savedOnly) query.set("savedOnly", "true");

    const endpoint = `/recommendations${query.toString() ? `?${query.toString()}` : ""}`;
    const res = await apiRequest(endpoint);

    if (res?.success && res?.data) {
      const items = (res.data.items || []).map(adaptRecommendation);
      return {
        items,
        pagination: res.data.pagination,
        statistics: res.data.statistics,
        source: "api",
      };
    }
    throw new Error("Invalid API response format");
  } catch (error) {
    console.info("Using local fallback demonstration records for recommendations.");
    let filtered = [...MOCK_HISTORY_RECORDS];
    if (params.status && params.status !== "ALL") {
      filtered = filtered.filter((r) => r.status.toLowerCase() === params.status.toLowerCase());
    }
    if (params.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter((r) =>
        r.requirement.toLowerCase().includes(s) ||
        r.standard.toLowerCase().includes(s) ||
        r.id.toLowerCase().includes(s)
      );
    }
    return {
      items: filtered,
      pagination: { total: filtered.length, page: 1, limit: filtered.length, totalPages: 1 },
      statistics: {
        total: MOCK_HISTORY_RECORDS.length,
        accepted: MOCK_HISTORY_RECORDS.filter((r) => r.status === "Accepted").length,
        underReview: MOCK_HISTORY_RECORDS.filter((r) => r.status === "Under Technical Review").length,
        clarificationRequested: MOCK_HISTORY_RECORDS.filter((r) => r.status === "Clarification Requested").length,
      },
      source: "fallback",
    };
  }
}

export async function getRecommendation(id) {
  try {
    const res = await apiRequest(`/recommendations/${id}`);
    if (res?.success && res?.data) {
      return adaptRecommendation(res.data);
    }
    throw new Error("Invalid recommendation response");
  } catch (error) {
    const fallback = getHistoryItemById(id);
    return adaptRecommendation(fallback);
  }
}

export async function runRecommendationEngine(requirementText) {
  const res = await apiRequest("/recommend", {
    method: "POST",
    body: JSON.stringify({ query: requirementText }),
  });
  return res.data;
}

/** Normalize the verified POST /api/recommend response for the existing UI. */
export function adaptBackendRecommendation(response) {
  if (!response) return null;
  const primary = response.primary_standard || null;
  const confidenceScore = Number(response.confidence?.score || 0);
  const confidenceState = response.confidence?.state || "no_confident_match";
  const evidence = (response.evidence || []).map((item) => ({
    id: item.id,
    category: item.evidence_type || item.evidenceType || "Evidence",
    clause: item.clause_reference || null,
    clauseTitle: item.source_reference || item.source_type || null,
    status: "Source provided",
    excerpt: item.evidence_text || null,
    sourceUrl: item.source_url || null,
    pageNumber: item.page_number || null,
  }));
  const candidates = (response.candidates || []).map((item) => ({
    id: item.id,
    standardId: item.id,
    standardNumber: item.is_number,
    code: item.is_number,
    title: item.title,
    status: item.status || "UNKNOWN",
    matchScore: Number(item.score || 0),
    matchConfidence: Math.round(Number(item.score || 0) * 100),
    reason: "Candidate returned by the backend retrieval ranker.",
  }));
  const related = (response.related_standards || []).map((item) => ({
    id: item.id,
    standardNumber: item.related_standard?.is_number || item.related_standard_number || item.is_number,
    title: item.related_standard?.title || item.title,
    status: item.related_standard?.status || item.status || "UNKNOWN",
    relationshipType: item.relationship_type || item.relationshipType,
    notes: item.relationship_reason || item.relationshipReason,
  }));
  const alternatives = candidates.filter((item) => item.standardNumber !== primary?.is_number);

  return {
    id: response.recommendation_id,
    recommendationId: response.recommendation_id,
    requirement: response.query || "",
    originalText: response.query || "",
    normalizedText: response.normalized_query || "",
    recommendedStandard: primary?.is_number || null,
    standardTitle: primary?.title || null,
    confidence: Math.round(confidenceScore * 100),
    confidenceState,
    currentnessStatus: primary?.status || "UNKNOWN",
    certification: primary?.certification || null,
    status: primary ? (confidenceState === "high_confidence" ? "High confidence" : "Review required") : "No confident match",
    rawStatus: confidenceState,
    reviewRequired: confidenceState === "review_required",
    rankingMethod: response.ranking_method || null,
    alternatives,
    alliedStandards: related,
    evidence,
    attributes: {
      product: primary?.product || null,
      material: primary?.material || null,
      application: primary?.application || null,
    },
    matchReasons: primary ? ["Matched against real standards returned by the backend."] : [],
    scoreBreakdown: null,
    summary: null,
    isDemoDataset: false,
  };
}

export async function getBackendHealth() {
  return apiRequest("/health");
}

export async function getBackendReadiness() {
  return apiRequest("/health/ready");
}

export async function createRecommendation(data) {
  try {
    const res = await apiRequest("/recommendations", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data;
  } catch (error) {
    console.error("Failed to create recommendation via API:", error);
    throw error;
  }
}

export async function toggleSaveRecommendation(id) {
  try {
    const res = await apiRequest(`/recommendations/${id}/save`, {
      method: "PATCH",
    });
    return res.data;
  } catch (error) {
    console.warn("Falling back to local toggleSave");
    return { id, saved: true };
  }
}

export async function archiveRecommendation(id) {
  try {
    const res = await apiRequest(`/recommendations/${id}/archive`, {
      method: "PATCH",
    });
    return res.data;
  } catch (error) {
    console.warn("Falling back to local archive");
    return { id, archived: true };
  }
}

// ----------------------------------------------------
// Standards API
// ----------------------------------------------------

export async function getStandards(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.status) query.set("status", params.status);

    const res = await apiRequest(`/standards${query.toString() ? `?${query.toString()}` : ""}`);
    return res.data;
  } catch (error) {
    return [
      { standardNumber: "IS 2347:2023", title: "Pressure cookers — Specification", status: "CURRENT" },
      { standardNumber: "IS 10322 (Part 5/Sec 3):2012", title: "Luminaires for road and street lighting", status: "CURRENT" },
      { standardNumber: "IS 302 (Part 1):2024", title: "Safety of household and similar electrical appliances", status: "CURRENT" },
    ];
  }
}

export async function getStandard(id) {
  const res = await apiRequest(`/standards/${encodeURIComponent(id)}`);
  return res.data;
}

// ----------------------------------------------------
// Evidence API
// ----------------------------------------------------

export async function getEvidence(recommendationId) {
  try {
    const res = await apiRequest(`/recommendations/${recommendationId}/evidence`);
    return res.data;
  } catch (error) {
    return [];
  }
}

export async function createEvidence(recommendationId, data) {
  const res = await apiRequest(`/recommendations/${recommendationId}/evidence`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

// ----------------------------------------------------
// Review & Decisions API
// ----------------------------------------------------

export async function getReview(recommendationId) {
  try {
    const res = await apiRequest(`/recommendations/${recommendationId}/review`);
    return res.data;
  } catch (error) {
    return null;
  }
}

export async function updateReview(recommendationId, data) {
  const res = await apiRequest(`/recommendations/${recommendationId}/review`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function acceptRecommendation(id, data = {}) {
  const res = await apiRequest(`/recommendations/${id}/accept`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function requestTechnicalReview(id, data = { reason: "Requires technical evaluation" }) {
  const res = await apiRequest(`/recommendations/${id}/request-review`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function requestClarification(id, data = { question: "Clarification required on requirements" }) {
  const res = await apiRequest(`/recommendations/${id}/request-clarification`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function markNotApplicable(id, data = { reason: "Standard does not apply", explanation: "Marked by reviewer" }) {
  const res = await apiRequest(`/recommendations/${id}/not-applicable`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

// ----------------------------------------------------
// Audit Trail API
// ----------------------------------------------------

export async function getAuditEvents(recommendationId) {
  try {
    const res = await apiRequest(`/recommendations/${recommendationId}/audit`);
    return res.data;
  } catch (error) {
    return [];
  }
}

// ----------------------------------------------------
// Document Processing API (Phase 11)
// ----------------------------------------------------

export async function uploadDocumentFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiRequest("/documents/upload", {
    method: "POST",
    body: formData,
  });
  return res.data;
}

export async function processDocument(id) {
  const res = await apiRequest(`/documents/${id}/process`, {
    method: "POST",
  });
  return res.data;
}

export async function getDocumentStatus(id) {
  const res = await apiRequest(`/documents/${id}/status`);
  return res.data;
}

export async function getDocumentRequirements(id) {
  const res = await apiRequest(`/documents/${id}/requirements`);
  return res.data;
}

export async function updateDocumentRequirements(id, data) {
  const res = await apiRequest(`/documents/${id}/requirements`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function recommendFromDocument(id, data = {}) {
  const res = await apiRequest(`/documents/${id}/recommend`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function createDocument(data) {
  const res = await apiRequest("/documents", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function getDocument(id) {
  const res = await apiRequest(`/documents/${id}`);
  return res.data;
}

export async function updateDocumentStatus(id, processingStatus) {
  const res = await apiRequest(`/documents/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ processingStatus }),
  });
  return res.data;
}

// ----------------------------------------------------
// Multilingual & Terminology API (Phase 16)
// ----------------------------------------------------

export async function detectLanguageApi(text) {
  const res = await apiRequest("/language/detect", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
  return res.data;
}

export async function normalizeLanguageApi(text, language) {
  const res = await apiRequest("/language/normalize", {
    method: "POST",
    body: JSON.stringify({ text, language }),
  });
  return res.data;
}

export async function getTerminologyApi(params = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", params.page);
  if (params.limit) query.set("limit", params.limit);
  if (params.language) query.set("language", params.language);
  if (params.termType) query.set("termType", params.termType);
  if (params.isVerified !== undefined) query.set("isVerified", params.isVerified);
  if (params.search) query.set("search", params.search);

  const res = await apiRequest(`/terminology${query.toString() ? `?${query.toString()}` : ""}`);
  return res.data;
}

export async function createTerminologyApi(data) {
  const res = await apiRequest("/terminology", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateTerminologyApi(id, data) {
  const res = await apiRequest(`/terminology/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function approveTerminologyApi(id) {
  const res = await apiRequest(`/terminology/${id}/approve`, {
    method: "POST",
  });
  return res.data;
}

export async function rejectTerminologyApi(id) {
  const res = await apiRequest(`/terminology/${id}/reject`, {
    method: "POST",
  });
  return res.data;
}

export async function deleteTerminologyApi(id) {
  const res = await apiRequest(`/terminology/${id}`, {
    method: "DELETE",
  });
  return res.data;
}

// ----------------------------------------------------
// Evaluation & Benchmarking API (Phase 17)
// ----------------------------------------------------

export async function triggerEvaluationRunApi(payload = {}) {
  const res = await apiRequest("/admin/evaluation/run", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res;
}

export async function getEvaluationRunsApi() {
  const res = await apiRequest("/admin/evaluation/runs");
  return res.runs || [];
}

export async function getEvaluationRunDetailsApi(id) {
  const res = await apiRequest(`/admin/evaluation/runs/${id}`);
  return res.run;
}

export async function exportEvaluationReportApi(id, format = "json") {
  if (format === "markdown" || format === "md") {
    const res = await fetch(`/api/admin/evaluation/${id}/report?format=markdown`);
    return await res.text();
  }
  const res = await apiRequest(`/admin/evaluation/${id}/report`);
  return res;
}

export async function getAvailableCasesApi() {
  const res = await apiRequest("/admin/evaluation/cases");
  return res.cases || [];
}

export async function evaluateSingleCaseApi(casePayload) {
  const res = await apiRequest("/admin/evaluation/case", {
    method: "POST",
    body: JSON.stringify(casePayload),
  });
  return res.result;
}

export async function submitHumanFeedbackApi(resultId, feedback = {}) {
  const res = await apiRequest(`/admin/evaluation/results/${resultId}/feedback`, {
    method: "POST",
    body: JSON.stringify(feedback),
  });
  return res.result;
}

export async function compareRetrievalStrategiesApi(payload = {}) {
  const res = await apiRequest("/admin/evaluation/compare-retrieval", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.comparison;
}

// ==========================================
// Phase 18: Authentication & Security APIs
// ==========================================

export async function loginApi({ email, password }) {
  const res = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return res.data;
}

export async function registerApi({ name, email, password }) {
  const res = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  return res;
}

export async function logoutApi() {
  const res = await apiRequest("/auth/logout", {
    method: "POST",
  });
  return res;
}

export async function getMeApi() {
  const res = await apiRequest("/auth/me");
  return res.data;
}

export async function getCsrfTokenApi() {
  const res = await apiRequest("/auth/csrf");
  return res.data;
}

export async function changePasswordApi({ currentPassword, newPassword, revokeOtherSessions = false }) {
  const res = await apiRequest("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword, revokeOtherSessions }),
  });
  return res.data;
}

export async function listUsersApi() {
  const res = await apiRequest("/admin/users");
  return res.data;
}

export async function updateUserRoleApi(userId, role) {
  const res = await apiRequest(`/admin/users/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
  return res.data;
}

export async function updateUserStatusApi(userId, isActive) {
  const res = await apiRequest(`/admin/users/${userId}/status`, {
    method: "PUT",
    body: JSON.stringify({ isActive }),
  });
  return res.data;
}

export async function getSecurityCheckApi() {
  const res = await apiRequest("/admin/security/check");
  return res.data;
}

export async function getSystemHealthApi() {
  const res = await apiRequest("/admin/system/health");
  return res;
}




