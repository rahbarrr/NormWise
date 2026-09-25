/**
 * NormWise Candidate Retrieval Service
 * Hybrid retrieval engine combining PostgreSQL full-text keyword matching,
 * structured metadata field overlap, and pgvector semantic search.
 */
import prisma from "../config/db.js";
import { generateEmbedding } from "./embeddingService.js";
import { RETRIEVAL_LIMITS } from "../config/recommendationConfig.js";

/**
 * Retrieve candidates using keyword and full-text search in PostgreSQL
 */
export async function retrieveKeywordCandidates(requirementText, extractedAttributes = {}) {
  const { product, material, application } = extractedAttributes;

  // Extract terms for search
  const terms = requirementText
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2)
    .slice(0, 10);

  if (terms.length === 0) {
    return [];
  }

  // Build full-text tsquery
  const tsQueryStr = terms.join(" | ");

  try {
    // 1. Full-text search + metadata query
    const results = await prisma.$queryRaw`
      SELECT 
        s.id,
        s."standardNumber",
        s.title,
        s.edition,
        s.revision,
        s.status,
        s.description,
        s.scope,
        s.keywords,
        s."applicableProducts",
        s.materials,
        s.applications,
        ts_rank(
          to_tsvector('english', coalesce(s.title, '') || ' ' || coalesce(s.description, '') || ' ' || coalesce(s.scope, '')),
          to_tsquery('english', ${tsQueryStr})
        ) AS rank
      FROM standards s
      WHERE 
        to_tsvector('english', coalesce(s.title, '') || ' ' || coalesce(s.description, '') || ' ' || coalesce(s.scope, '')) @@ to_tsquery('english', ${tsQueryStr})
        OR s."standardNumber" ILIKE ANY(${terms.map((t) => `%${t}%`)})
        OR s.keywords && ${terms}::text[]
        OR (${product ? product : ""} != '' AND s."applicableProducts" @> ARRAY[${product ? product : ""}]::text[])
        OR (${material ? material : ""} != '' AND s.materials @> ARRAY[${material ? material : ""}]::text[])
        OR (${application ? application : ""} != '' AND s.applications @> ARRAY[${application ? application : ""}]::text[])
      ORDER BY rank DESC
      LIMIT ${RETRIEVAL_LIMITS.KEYWORD_LIMIT};
    `;

    return results;
  } catch (error) {
    // Fallback to Prisma findMany if raw FTS query encounters specific grammar edge-case
    console.warn("[RetrievalService] Raw FTS fallback to Prisma ORM:", error.message);
    const orConditions = terms.map((term) => ({
      OR: [
        { standardNumber: { contains: term, mode: "insensitive" } },
        { title: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { scope: { contains: term, mode: "insensitive" } },
        { keywords: { has: term.toLowerCase() } },
      ],
    }));

    if (product) orConditions.push({ applicableProducts: { has: product } });
    if (material) orConditions.push({ materials: { has: material } });
    if (application) orConditions.push({ applications: { has: application } });

    return await prisma.standard.findMany({
      where: { OR: orConditions },
      take: RETRIEVAL_LIMITS.KEYWORD_LIMIT,
    });
  }
}

/**
 * Retrieve candidates using pgvector cosine similarity (when embeddings are configured)
 */
export async function retrieveSemanticCandidates(requirementText) {
  const queryVector = await generateEmbedding(requirementText);
  if (!queryVector || !Array.isArray(queryVector)) {
    return [];
  }

  try {
    const vectorStr = `[${queryVector.join(",")}]`;
    const results = await prisma.$queryRaw`
      SELECT 
        s.id,
        s."standardNumber",
        s.title,
        s.edition,
        s.revision,
        s.status,
        s.description,
        s.scope,
        s.keywords,
        s."applicableProducts",
        s.materials,
        s.applications,
        1 - (s.embedding <=> ${vectorStr}::vector) AS semantic_similarity
      FROM standards s
      WHERE s.embedding IS NOT NULL
      ORDER BY s.embedding <=> ${vectorStr}::vector
      LIMIT ${RETRIEVAL_LIMITS.SEMANTIC_LIMIT};
    `;

    return results.map((row) => ({
      ...row,
      semanticSimilarity: parseFloat(row.semantic_similarity || "0"),
    }));
  } catch (error) {
    console.warn("[RetrievalService] pgvector query skipped or unconfigured:", error.message);
    return [];
  }
}

/**
 * Hybrid Multi-Signal Retrieval
 * Merges keyword and semantic results with deduplication
 */
export async function retrieveCandidates(requirementText, extractedAttributes = {}) {
  const [keywordResults, semanticResults] = await Promise.all([
    retrieveKeywordCandidates(requirementText, extractedAttributes),
    retrieveSemanticCandidates(requirementText),
  ]);

  const candidateMap = new Map();

  // Merge Keyword Candidates
  for (const item of keywordResults) {
    candidateMap.set(item.id, {
      ...item,
      retrievalSignals: {
        keywordRank: item.rank ? parseFloat(item.rank) : 0.5,
        semanticSimilarity: 0,
        source: ["keyword"],
      },
    });
  }

  // Merge Semantic Candidates
  for (const item of semanticResults) {
    if (candidateMap.has(item.id)) {
      const existing = candidateMap.get(item.id);
      existing.retrievalSignals.semanticSimilarity = item.semanticSimilarity;
      existing.retrievalSignals.source.push("semantic");
    } else {
      candidateMap.set(item.id, {
        ...item,
        retrievalSignals: {
          keywordRank: 0,
          semanticSimilarity: item.semanticSimilarity,
          source: ["semantic"],
        },
      });
    }
  }

  return Array.from(candidateMap.values());
}
