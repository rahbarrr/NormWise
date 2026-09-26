const API_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "/api") + "/admin";

export async function fetchDatasetOverview() {
  const res = await fetch(`${API_BASE}/overview`, {
    headers: { "x-admin-key": "dev-admin-secret" },
  });
  if (!res.ok) throw new Error("Failed to load dataset overview");
  return res.json();
}

export async function fetchImportJobs() {
  const res = await fetch(`${API_BASE}/imports`, {
    headers: { "x-admin-key": "dev-admin-secret" },
  });
  if (!res.ok) throw new Error("Failed to load import jobs");
  return res.json();
}

export async function fetchImportReport(jobId) {
  const res = await fetch(`${API_BASE}/imports/${jobId}/report`, {
    headers: { "x-admin-key": "dev-admin-secret" },
  });
  if (!res.ok) throw new Error("Failed to load import report");
  return res.json();
}

export async function importDatasetFile(file, options = {}) {
  const formData = new FormData();
  formData.append("file", file);
  if (options.sourceName) formData.append("sourceName", options.sourceName);
  if (options.datasetVersion) formData.append("datasetVersion", options.datasetVersion);
  if (options.dryRun !== undefined) formData.append("dryRun", String(options.dryRun));
  if (options.isDemo !== undefined) formData.append("isDemo", String(options.isDemo));

  const res = await fetch(`${API_BASE}/standards/import`, {
    method: "POST",
    headers: { "x-admin-key": "dev-admin-secret" },
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to process dataset file");
  }
  return res.json();
}

export async function validateDatasetFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/standards/validate`, {
    method: "POST",
    headers: { "x-admin-key": "dev-admin-secret" },
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Validation failed");
  }
  return res.json();
}
