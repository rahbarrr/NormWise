/**
 * NormWise Embedding Service (Phase 15)
 * Provider-agnostic text vector generation for PostgreSQL/pgvector semantic retrieval.
 * Includes content-hash based caching to avoid redundant computation.
 *
 * If no embedding provider is configured via environment variables,
 * the service returns null, allowing the recommendation engine to fall back
 * transparently to high-performance PostgreSQL keyword and structured retrieval.
 */
import crypto from "crypto";
import prisma from "../config/db.js";

export function isEmbeddingConfigured() {
  return Boolean(process.env.EMBEDDING_API_KEY);
}

/**
 * Computes deterministic SHA-256 hash of text content for caching
 */
export function computeContentHash(text) {
  return crypto.createHash("sha256").update(text.trim()).digest("hex");
}

/**
 * Constructs standard searchable text blob for embedding
 */
export function getStandardSearchableText(standard) {
  const parts = [
    standard.standardNumber || "",
    standard.title || "",
    standard.scope || "",
    standard.category || "",
    standard.technicalDomain || "",
  ].filter(Boolean);

  return parts.join(" ");
}

/**
 * Generates vector embedding from text using configured provider
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

/**
 * Generates requirement embedding (called once per request)
 */
export async function generateRequirementEmbedding(requirementText) {
  return await generateEmbedding(requirementText);
}

/**
 * Generates and caches embedding for a single standard record
 */
export async function generateStandardEmbedding(standard) {
  if (!standard || !standard.id) return null;

  const searchableText = getStandardSearchableText(standard);
  const contentHash = computeContentHash(searchableText);
  const modelName = process.env.EMBEDDING_MODEL || "text-embedding-3-small";

  // Check cache
  const cached = await prisma.standardEmbedding.findUnique({
    where: { standardId: standard.id },
  });

  if (cached && cached.contentHash === contentHash && cached.modelName === modelName) {
    // Content has not changed, reuse cached embedding
    return {
      standardId: standard.id,
      cached: true,
      contentHash,
    };
  }

  const embeddingVector = await generateEmbedding(searchableText);
  if (!embeddingVector) {
    return null;
  }

  // Store in standard_embeddings table using pgvector formatting
  const vectorStr = `[${embeddingVector.join(",")}]`;

  await prisma.$executeRawUnsafe(
    `
    INSERT INTO standard_embeddings ("id", "standardId", "modelName", "contentHash", "embedding", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), $1, $2, $3, $4::vector, NOW(), NOW())
    ON CONFLICT ("standardId")
    DO UPDATE SET
      "modelName" = EXCLUDED."modelName",
      "contentHash" = EXCLUDED."contentHash",
      "embedding" = EXCLUDED."embedding",
      "updatedAt" = NOW();
    `,
    standard.id,
    modelName,
    contentHash,
    vectorStr
  );

  return {
    standardId: standard.id,
    cached: false,
    contentHash,
  };
}

/**
 * Batch generate embeddings for all standards in repository
 */
export async function batchGenerateStandardEmbeddings(limit = 100) {
  if (!isEmbeddingConfigured()) {
    console.log("[EmbeddingService] Embeddings not configured. Skipping batch generation.");
    return { processed: 0, updated: 0, skipped: 0 };
  }

  const standards = await prisma.standard.findMany({
    take: limit,
    select: {
      id: true,
      standardNumber: true,
      title: true,
      scope: true,
      category: true,
      technicalDomain: true,
    },
  });

  let updated = 0;
  let skipped = 0;

  for (const std of standards) {
    const res = await generateStandardEmbedding(std);
    if (res?.cached) {
      skipped++;
    } else if (res) {
      updated++;
    }
  }

  return {
    processed: standards.length,
    updated,
    skipped,
  };
}
