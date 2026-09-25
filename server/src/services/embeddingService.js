/**
 * NormWise Embedding Service
 * Provider-agnostic text vector generation for PostgreSQL/pgvector semantic retrieval
 * 
 * If no embedding provider is configured via environment variables,
 * the service returns null, allowing the recommendation engine to fall back
 * transparently to high-performance PostgreSQL keyword and structured retrieval.
 */

export async function generateEmbedding(text) {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return null;
  }

  const apiKey = process.env.EMBEDDING_API_KEY;
  const provider = (process.env.EMBEDDING_PROVIDER || "openai").toLowerCase();
  const model = process.env.EMBEDDING_MODEL || (provider === "gemini" ? "text-embedding-004" : "text-embedding-3-small");

  if (!apiKey) {
    // Controlled non-fatal state: embeddings are not configured
    return null;
  }

  try {
    if (provider === "openai") {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          input: text.trim().slice(0, 8000),
        }),
      });

      if (!response.ok) {
        console.warn(`[EmbeddingService] OpenAI request failed (${response.status})`);
        return null;
      }

      const json = await response.json();
      return json?.data?.[0]?.embedding || null;
    }

    if (provider === "gemini") {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: { parts: [{ text: text.trim().slice(0, 8000) }] },
        }),
      });

      if (!response.ok) {
        console.warn(`[EmbeddingService] Gemini embedding failed (${response.status})`);
        return null;
      }

      const json = await response.json();
      return json?.embedding?.values || null;
    }

    return null;
  } catch (error) {
    console.warn("[EmbeddingService] Error generating embedding:", error.message);
    return null;
  }
}

export function isEmbeddingConfigured() {
  return Boolean(process.env.EMBEDDING_API_KEY);
}
