/**
 * NormWise Currentness Validation Service
 * Validates standard publication state, amendments, and supersession links
 * 
 * IMPORTANT: Currentness validation is determined solely from structured records
 * in the NormWise PostgreSQL repository. It does NOT claim live real-time BIS API scraping.
 */
import prisma from "../config/db.js";

export async function validateCurrentness(standardId) {
  const standard = await prisma.standard.findUnique({
    where: { id: standardId },
    include: {
      amendments: {
        where: { status: "ACTIVE" },
        orderBy: { date: "desc" },
      },
      referencedBy: {
        where: { relationshipType: "SUPERSEDED_BY" },
        include: { standard: true },
      },
      relatedStandards: {
        where: { relationshipType: "SUPERSEDED_BY" },
        include: { relatedStandard: true },
      },
    },
  });

  if (!standard) {
    return {
      status: "UNKNOWN",
      canProceedAsPrimary: false,
      notice: "Standard record not located in database.",
      amendments: [],
      supersededBy: null,
    };
  }

  const isCurrent = standard.status === "CURRENT";
  const isSuperseded = standard.status === "SUPERSEDED";
  const isWithdrawn = standard.status === "WITHDRAWN";
  const isUnderReview = standard.status === "UNDER_REVIEW";
  const isUnknown = standard.status === "UNKNOWN";

  // Check if there is a known successor standard
  const successor = standard.relatedStandards?.[0]?.relatedStandard || null;

  let notice = "Standard is active and current per catalog repository.";
  let canProceedAsPrimary = true;

  if (isWithdrawn) {
    notice = "WITHDRAWN: Standard has been cancelled. Cannot be cited as primary specification.";
    canProceedAsPrimary = false;
  } else if (isSuperseded) {
    notice = `SUPERSEDED: This revision has been superseded${
      successor ? ` by ${successor.standardNumber} (${successor.title})` : ""
    }. Recommend citing latest edition.`;
    canProceedAsPrimary = false;
  } else if (isUnderReview) {
    notice = "UNDER REVIEW: Sectional technical committee is currently evaluating amendments.";
    canProceedAsPrimary = true;
  } else if (isUnknown) {
    notice = "Currentness could not be established from the available source data.";
    canProceedAsPrimary = false;
  }

  return {
    status: standard.status,
    edition: standard.edition,
    revision: standard.revision,
    canProceedAsPrimary,
    notice,
    activeAmendmentsCount: standard.amendments.length,
    amendments: standard.amendments.map((a) => ({
      number: a.amendmentNumber,
      date: a.date,
      description: a.description,
    })),
    supersededBy: successor ? {
      standardId: successor.id,
      standardNumber: successor.standardNumber,
      title: successor.title,
    } : null,
  };
}
