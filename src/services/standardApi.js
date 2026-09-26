/**
 * NormWise Standard & Knowledge Graph API Client (Phase 12)
 * Connects frontend to Express + PostgreSQL endpoints for connected standards,
 * directional relationships, and knowledge graph traversal.
 */
import { apiRequest } from "./api.js";

/**
 * Fetch detailed standard profile by ID or standardNumber
 */
export async function getStandard(id) {
  try {
    const res = await apiRequest(`/standards/${encodeURIComponent(id)}`);
    return res.data;
  } catch (error) {
    console.warn(`[standardApi] getStandard failed for ${id}, using fallback:`, error.message);
    // Graceful demo fallback
    return {
      id: id,
      standardNumber: id.includes("IS") ? id : "IS 2347:2023",
      title: "Domestic Pressure Cookers — Specification",
      edition: "2023",
      revision: "Seventh Revision",
      status: "CURRENT",
      description: "DEMO RECORD: Specifies requirements for domestic and commercial pressure cookers.",
      scope: "Covers food-grade pressure cooking equipment and mandatory safety relief mechanisms.",
      applicableProducts: ["Pressure Cooker", "Cookware"],
      materials: ["Stainless Steel Grade 304", "Aluminum Alloy"],
      applications: ["Institutional Kitchen", "Domestic Pantry"],
      amendments: [
        { amendmentNumber: "Amendment No. 1", date: "2024-03-15", description: "Testing procedures for secondary relief valves." }
      ],
      isDemoData: true,
    };
  }
}

/**
 * Fetch related / allied standards connected to a standard
 * @param {string} standardId - Standard ID or standardNumber
 * @param {object} filters - { direction: "ALL" | "OUTGOING" | "INCOMING", type: string }
 */
export async function getRelatedStandards(standardId, filters = {}) {
  try {
    const query = new URLSearchParams();
    if (filters.direction) query.set("direction", filters.direction);
    if (filters.type && filters.type !== "ALL") query.set("type", filters.type);

    const endpoint = `/standards/${encodeURIComponent(standardId)}/related${
      query.toString() ? `?${query.toString()}` : ""
    }`;
    const res = await apiRequest(endpoint);
    return res.data;
  } catch (error) {
    console.warn(`[standardApi] getRelatedStandards failed for ${standardId}:`, error.message);
    // Graceful fallback with clearly marked demo data
    return {
      standard: {
        id: standardId,
        standardNumber: standardId.includes("IS") ? standardId : "IS 2347:2023",
        title: "Domestic Pressure Cookers — Specification",
        status: "CURRENT",
      },
      total: 3,
      isDemoDataset: true,
      relatedStandards: [
        {
          relationshipId: "rel-demo-1",
          relationshipType: "MATERIAL",
          direction: "OUTGOING",
          notes: "Demo relationship — verify against authoritative BIS source: Stainless steel plate/sheet specification.",
          status: "DEMO",
          evidenceAvailable: true,
          standard: {
            id: "std-6911",
            standardNumber: "IS 6911:2017",
            title: "Stainless steel plate, sheet and strip — Specification",
            status: "CURRENT",
            amendmentCount: 0,
          },
        },
        {
          relationshipId: "rel-demo-2",
          relationshipType: "COMPONENT",
          direction: "OUTGOING",
          notes: "Demo relationship — verify against authoritative BIS source: Food-grade rubber sealing gaskets.",
          status: "DEMO",
          evidenceAvailable: false,
          standard: {
            id: "std-7466",
            standardNumber: "IS 7466:1994",
            title: "Rubber gaskets for domestic pressure cookers — Specification",
            status: "CURRENT",
            amendmentCount: 0,
          },
        },
        {
          relationshipId: "rel-demo-3",
          relationshipType: "NORMATIVE_REFERENCE",
          direction: "OUTGOING",
          notes: "Demo relationship — verify against authoritative BIS source: Rules for numerical rounding.",
          status: "DEMO",
          evidenceAvailable: false,
          standard: {
            id: "std-2",
            standardNumber: "IS 2:2022",
            title: "Rules for rounding off numerical values",
            status: "CURRENT",
            amendmentCount: 0,
          },
        },
      ],
    };
  }
}

/**
 * Fetch knowledge graph structure for standard
 * @param {string} standardId - Standard ID or standardNumber
 * @param {number} depth - Traversal depth (1, 2, or 3)
 * @param {object} filters - { type: string }
 */
export async function getStandardGraph(standardId, depth = 1, filters = {}) {
  try {
    const query = new URLSearchParams();
    query.set("depth", Math.min(3, Math.max(1, parseInt(depth, 10) || 1)));
    if (filters.type && filters.type !== "ALL") query.set("type", filters.type);

    const endpoint = `/standards/${encodeURIComponent(standardId)}/graph?${query.toString()}`;
    const res = await apiRequest(endpoint);
    return res.data;
  } catch (error) {
    console.warn(`[standardApi] getStandardGraph failed for ${standardId}:`, error.message);
    // Graph fallback
    return {
      rootStandardId: standardId,
      rootStandardNumber: standardId.includes("IS") ? standardId : "IS 2347:2023",
      depth: 1,
      maxDepthAllowed: 3,
      isDemoDataset: true,
      nodes: [
        {
          id: "root",
          standardNumber: standardId.includes("IS") ? standardId : "IS 2347:2023",
          title: "Domestic Pressure Cookers — Specification",
          status: "CURRENT",
          isRoot: true,
          level: 0,
        },
        {
          id: "std-6911",
          standardNumber: "IS 6911:2017",
          title: "Stainless steel plate, sheet and strip",
          status: "CURRENT",
          isRoot: false,
          level: 1,
        },
        {
          id: "std-7466",
          standardNumber: "IS 7466:1994",
          title: "Rubber gaskets for domestic pressure cookers",
          status: "CURRENT",
          isRoot: false,
          level: 1,
        },
      ],
      edges: [
        {
          id: "edge-1",
          source: "root",
          sourceStandardNumber: "IS 2347:2023",
          target: "std-6911",
          targetStandardNumber: "IS 6911:2017",
          relationshipType: "MATERIAL",
          notes: "Demo relationship — verify against authoritative BIS source.",
          status: "DEMO",
        },
        {
          id: "edge-2",
          source: "root",
          sourceStandardNumber: "IS 2347:2023",
          target: "std-7466",
          targetStandardNumber: "IS 7466:1994",
          relationshipType: "COMPONENT",
          notes: "Demo relationship — verify against authoritative BIS source.",
          status: "DEMO",
        },
      ],
    };
  }
}
