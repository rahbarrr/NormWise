/**
 * NormWise API Service Client
 * Connects frontend to Express + PostgreSQL + Prisma REST API
 * Handles fallback gracefully to demonstration data when server is unavailable.
 */
import { MOCK_HISTORY_RECORDS, getHistoryItemById } from "../data/mockHistory.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Core HTTP Request Wrapper
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
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

  const primaryStd = rec.recommendationStandards?.find((rs) => rs.isPrimary)?.standard 
    || rec.recommendationStandards?.[0]?.standard 
    || null;

  const latestReview = rec.reviews?.[0] || null;

  return {
    ...rec,
    // UI compatibility fields
    id: rec.id,
    requirement: rec.requirementText || rec.requirement || "",
    requirementText: rec.requirementText || rec.requirement || "",
    standard: primaryStd?.standardNumber || rec.standard || "IS 2347:2023",
    standardTitle: primaryStd?.title || rec.standardTitle || "Pressure cookers — Specification",
    confidence: rec.confidence ?? 94,
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
      reason: rs.reason,
      isPrimary: rs.isPrimary,
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
// Document Metadata API
// ----------------------------------------------------

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
