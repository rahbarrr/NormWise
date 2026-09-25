/**
 * NormWise Related Standards Service
 * Traverses relational knowledge graph of standards, materials, components, and normative references
 */
import prisma from "../config/db.js";

export async function getRelatedStandards(standardId) {
  const links = await prisma.relatedStandard.findMany({
    where: { standardId },
    include: {
      relatedStandard: true,
    },
  });

  return links.map((link) => ({
    relationshipType: link.relationshipType,
    standardId: link.relatedStandard.id,
    standardNumber: link.relatedStandard.standardNumber,
    title: link.relatedStandard.title,
    status: link.relatedStandard.status,
    description: link.relatedStandard.description,
  }));
}
