/**
 * Frontend API Service for Certification & QCO Compliance Rules Engine
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function getComplianceRules() {
  try {
    const res = await fetch(`${API_BASE_URL}/compliance/rules`);
    if (!res.ok) {
      throw new Error(`Failed to fetch compliance rules: ${res.statusText}`);
    }
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error("[complianceApi] Error fetching compliance rules:", err);
    return [];
  }
}

export async function getComplianceRule(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/compliance/rules/${encodeURIComponent(id)}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch compliance rule: ${res.statusText}`);
    }
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error("[complianceApi] Error fetching rule by ID:", err);
    throw err;
  }
}

export async function evaluateCompliance(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/compliance/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`Failed to evaluate compliance: ${res.statusText}`);
    }
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error("[complianceApi] Error evaluating compliance:", err);
    throw err;
  }
}

export async function getRecommendationCompliance(recommendationId) {
  try {
    const res = await fetch(`${API_BASE_URL}/recommendations/${encodeURIComponent(recommendationId)}/compliance`);
    if (!res.ok) {
      throw new Error(`Failed to fetch recommendation compliance: ${res.statusText}`);
    }
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error("[complianceApi] Error fetching recommendation compliance:", err);
    return null;
  }
}
