/**
 * NormWise Vector Search Service (Phase 15)
 * Performs pgvector cosine distance similarity search over cached standard embeddings.
 */
import prisma from "../config/db.js";

const DEFAULT_VECTOR_LIMIT = parseInt(process.env.VECTOR_CANDIDATE_LIMIT || "20", 10);

/**
 * Searches candidate standards by cosine similarity to query vector
 * 
 * @param {number[]} queryEmbedding - Vector embedding of the requirement text
 * @param {number} limit - Maximum number of candidates to retrieve
 * @returns {Promise<Array>} List of standards with similarity score
 */
export async function searchSimilarStandards(queryEmbedding, limit = DEFAULT_VECTOR_LIMIT) {
  if (!queryEmbedding || !Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
    return [];
  }

  try {
    const vectorStr = `[${queryEmbedding.join(",")}]`;

    const results = await prisma.$queryRawUnsafe(
      `
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
        ROUND((1 - (se.embedding <=> $1::vector))::numeric, 4)::float AS similarity
      FROM standard_embeddings se
      JOIN standards s ON s.id = se."standardId"
      WHERE se.embedding IS NOT NULL
      ORDER BY se.embedding <=> $1::vector ASC
      LIMIT $2;
      `,
      vectorStr,
      limit
    );

    return results.map((row) => ({
      ...row,
      retrievalSignals: {
        semanticSimilarity: Math.max(0, Math.min(1, row.similarity || 0)),
      },
    }));
  } catch (error) {
    console.warn("[VectorSearchService] Vector search encountered an error, falling back gracefully:", error.message);
    return [];
  }
}
