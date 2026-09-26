/**
 * NormWise Candidate Retrieval Service (Phase 15)
 * Hybrid multi-signal retrieval engine combining:
 * 1. Structured attribute matching (product, category, application, material)
 * 2. PostgreSQL lexical full-text search (tsquery, ts_rank, ILIKE, keyword arrays)
 * 3. pgvector semantic cosine similarity search
 */
import prisma from "../config/db.js";
import { generateRequirementEmbedding } from "./embeddingService.js";
import { searchSimilarStandards } from "./vectorSearchService.js";
import { matchStructuredStandards } from "./structuredMatchService.js";
import { RETRIEVAL_LIMITS } from "../config/recommendationConfig.js";

/**
 * Retrieve candidates using keyword and lexical full-text search in PostgreSQL
 */
export async function retrieveLexicalCandidates(requirementText, extractedAttributes = {}) {
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
        s.category,
        s."technicalDomain",
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

    return results.map((r) => ({
      ...r,
      retrievalSignals: {
        lexicalRank: r.rank ? parseFloat(r.rank) : 0.5,
      },
    }));
  } catch (error) {
    // Fallback to Prisma ORM if raw FTS query encounters specific grammar edge-case
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

    const fallbackResults = await prisma.standard.findMany({
      where: { OR: orConditions },
      take: RETRIEVAL_LIMITS.KEYWORD_LIMIT,
    });

    return fallbackResults.map((r) => ({
      ...r,
      retrievalSignals: {
        lexicalRank: 0.5,
      },
    }));
  }
}

// Alias for backwards-compatibility
export const retrieveKeywordCandidates = retrieveLexicalCandidates;

/**
 * Retrieve candidates using pgvector cosine similarity
 */
export async function retrieveVectorCandidates(requirementText) {
  const queryVector = await generateRequirementEmbedding(requirementText);
  if (!queryVector || !Array.isArray(queryVector)) {
    return [];
  }

  return await searchSimilarStandards(queryVector, RETRIEVAL_LIMITS.SEMANTIC_LIMIT);
}

// Alias for backwards-compatibility
export const retrieveSemanticCandidates = retrieveVectorCandidates;

/**
 * Retrieve candidates using deterministic structured matching
 */
export async function retrieveStructuredCandidates(extractedAttributes = {}) {
  return await matchStructuredStandards(extractedAttributes, RETRIEVAL_LIMITS.KEYWORD_LIMIT);
}

/**
 * Hybrid Multi-Signal Candidate Generation & Merging
 * Merges candidates from:
 * A. Structured search
 * B. Lexical search
 * C. Vector search
 * Deduplicates by standardId and tracks retrievedBy: string[]
 */
export async function retrieveCandidates(requirementText, extractedAttributes = {}) {
  const [structuredResults, lexicalResults, vectorResults] = await Promise.all([
    retrieveStructuredCandidates(extractedAttributes),
    retrieveLexicalCandidates(requirementText, extractedAttributes),
    retrieveVectorCandidates(requirementText),
  ]);

  const candidateMap = new Map();

  // 1. Merge Structured Candidates
  for (const item of structuredResults) {
    const stdId = item.id || item.standardId;
    candidateMap.set(stdId, {
      ...item,
      id: stdId,
      standardId: stdId,
      retrievedBy: ["structured"],
      retrievalSignals: {
        structuredMatch: true,
        lexicalRank: 0,
        semanticSimilarity: 0,
      },
    });
  }

  // 2. Merge Lexical Candidates
  for (const item of lexicalResults) {
    const stdId = item.id || item.standardId;
    if (candidateMap.has(stdId)) {
      const existing = candidateMap.get(stdId);
      if (!existing.retrievedBy.includes("lexical")) {
        existing.retrievedBy.push("lexical");
      }
      existing.retrievalSignals.lexicalRank = item.retrievalSignals?.lexicalRank || 0.5;
    } else {
      candidateMap.set(stdId, {
        ...item,
        id: stdId,
        standardId: stdId,
        retrievedBy: ["lexical"],
        retrievalSignals: {
          structuredMatch: false,
          lexicalRank: item.retrievalSignals?.lexicalRank || 0.5,
          semanticSimilarity: 0,
        },
      });
    }
  }

  // 3. Merge Vector Candidates
  for (const item of vectorResults) {
    const stdId = item.id || item.standardId;
    const similarity = item.retrievalSignals?.semanticSimilarity || item.similarity || 0;
    if (candidateMap.has(stdId)) {
      const existing = candidateMap.get(stdId);
      if (!existing.retrievedBy.includes("vector")) {
        existing.retrievedBy.push("vector");
      }
      existing.retrievalSignals.semanticSimilarity = similarity;
    } else {
      candidateMap.set(stdId, {
        ...item,
        id: stdId,
        standardId: stdId,
        retrievedBy: ["vector"],
        retrievalSignals: {
          structuredMatch: false,
          lexicalRank: 0,
          semanticSimilarity: similarity,
        },
      });
    }
  }

  return Array.from(candidateMap.values());
}
