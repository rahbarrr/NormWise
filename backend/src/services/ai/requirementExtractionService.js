/**
 * Optional AI enrichment for document requirements.
 *
 * The deterministic extractor remains the safety baseline. When an
 * OpenAI-compatible LLM is configured, this service asks it to normalize
 * product/material/application/capacity fields using only the supplied text,
 * then merges only schema-valid values into the deterministic result.
 */
import env from "../../config/env.js";

const allowedFields = ["product", "material", "capacity", "application"];

function clean(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).replace(/\s+/g, " ").trim();
  return text ? text.slice(0, 240) : null;
}

function extractJson(content) {
  const text = String(content || "").trim();
  try { return JSON.parse(text); } catch {}
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

export async function enrichRequirementsWithAi(text, deterministic) {
  const provider = String(env.LLM_PROVIDER || "mock").toLowerCase();
  const apiKey = env.LLM_API_KEY;
  if (!apiKey || !["openai", "openai-compatible"].includes(provider)) {
    return { ...deterministic, ai: { used: false, provider: "none", reason: "LLM_PROVIDER or LLM_API_KEY is not configured" } };
  }

  const baseUrl = String(process.env.LLM_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: env.LLM_MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are NormWise's procurement intake assistant. Extract only facts explicitly present in the user's requirement. Do not invent a product, rating, material, application, certification, standard, or QCO. Normalize synonyms where the meaning is clear. Return JSON with product, material, capacity, application, technicalCharacteristics (array), clarifyingQuestions (array of concise questions for missing decision-critical details), and confidence (0 to 1). Use null for missing fields." },
        { role: "user", content: String(text || "").slice(0, 24000) },
      ],
    }),
  });
  if (!response.ok) throw new Error(`AI requirement extraction failed with HTTP ${response.status}`);
  const payload = await response.json();
  const parsed = extractJson(payload?.choices?.[0]?.message?.content);
  if (!parsed || typeof parsed !== "object") throw new Error("AI requirement extraction returned invalid JSON");

  const merged = { ...deterministic };
  for (const field of allowedFields) {
    const value = clean(parsed[field]);
    if (value) merged[field] = value;
  }
  if (Array.isArray(parsed.technicalCharacteristics)) {
    merged.technicalCharacteristics = [...new Set(parsed.technicalCharacteristics.map(clean).filter(Boolean))].slice(0, 20);
  }
  if (Array.isArray(parsed.clarifyingQuestions)) {
    merged.clarifyingQuestions = [...new Set(parsed.clarifyingQuestions.map(clean).filter(Boolean))].slice(0, 8);
  }
  return {
    ...merged,
    ai: { used: true, provider, model: env.LLM_MODEL, confidence: Number(parsed.confidence || 0) || null },
  };
}
