/**
 * NormWise Structured Retrieval Service (Phase 15)
 * Performs deterministic attribute-level candidate retrieval from PostgreSQL.
 * Matches: Product, Application, Material, Category, Technical characteristics.
 */
import prisma from "../config/db.js";

const DEFAULT_STRUCTURED_LIMIT = parseInt(process.env.STRUCTURED_LIMIT || "20", 10);

/**
 * Retrieves candidate standards matching structured procurement attributes
 *
 * @param {Object} attributes - Normalized requirement attributes
 * @param {number} limit - Maximum number of candidates to return
 * @returns {Promise<Array>} List of candidate standards with match reasons
 */
export async function matchStructuredStandards(attributes = {}, limit = DEFAULT_STRUCTURED_LIMIT) {
  const { product, category, material, application } = attributes;

  // If neither product nor category is identifiable, structured product matching cannot anchor a candidate standard
  if (!product && !category) {
    return [];
  }

  try {
    const whereConditions = [];

    if (product) {
      whereConditions.push({
        OR: [
          { applicableProducts: { has: product } },
          { title: { contains: product, mode: "insensitive" } },
          { standardNumber: { contains: product, mode: "insensitive" } },
        ],
      });
    }

    if (category) {
      whereConditions.push({
        category: { equals: category, mode: "insensitive" },
      });
    }

    if (material) {
      whereConditions.push({
        OR: [
          { materials: { has: material } },
          { title: { contains: material, mode: "insensitive" } },
        ],
      });
    }

    if (application) {
      whereConditions.push({
        OR: [
          { applications: { has: application } },
          { scope: { contains: application, mode: "insensitive" } },
        ],
      });
    }

    // Query standards matching any of the structured conditions
    const candidates = await prisma.standard.findMany({
      where: {
        OR: whereConditions,
      },
      take: limit,
      select: {
        id: true,
        standardNumber: true,
        title: true,
        edition: true,
        revision: true,
        status: true,
        description: true,
        scope: true,
        category: true,
        technicalDomain: true,
        keywords: true,
        applicableProducts: true,
        materials: true,
        applications: true,
      },
    });

    return candidates.map((c) => ({
      ...c,
      retrievalSignals: {
        structuredMatch: true,
      },
    }));
  } catch (error) {
    console.warn("[StructuredMatchService] Structured query error:", error.message);
    return [];
  }
}
