/**
 * NormWise Standards Identifier & Metadata Normalization Service
 * Handles deterministic normalization of Indian Standards (IS) identifiers,
 * status terminology, and domain terminology without inventing data.
 */

/**
 * Normalizes raw standard numbers across punctuation and spacing variations.
 * Ensures distinct Parts and Sections are strictly preserved.
 *
 * Examples:
 * - "IS 2347:2023" -> canonical: "IS 2347:2023", search: "IS2347:2023"
 * - "IS-2347:2023" -> canonical: "IS 2347:2023"
 * - "IS2347:2023"  -> canonical: "IS 2347:2023"
 * - "IS 10322 (Part 5/Sec 3):2012" -> preserves Part 5 / Sec 3
 * - "IS 10322-5-3:2012" -> canonical: "IS 10322 (Part 5/Sec 3):2012"
 */
export function normalizeStandardNumber(rawInput) {
  if (!rawInput || typeof rawInput !== "string") {
    return {
      canonical: "",
      display: "",
      searchKey: "",
      family: "IS",
      baseNumber: "",
      part: null,
      section: null,
      year: null,
      isValid: false,
    };
  }

  const raw = rawInput.trim();
  if (raw.length < 3) {
    return {
      canonical: raw,
      display: raw,
      searchKey: raw.toUpperCase().replace(/[^A-Z0-9]/g, ""),
      family: "IS",
      baseNumber: "",
      part: null,
      section: null,
      year: null,
      isValid: false,
    };
  }

  // 1. Identify Prefix Family (IS, ISO, IEC, etc.)
  let family = "IS";
  let rest = raw;
  const familyMatch = raw.match(/^(IS\/ISO|IS\/IEC|IS|ISO|IEC|BIS)\s*[-/]?\s*/i);
  if (familyMatch) {
    family = familyMatch[1].toUpperCase();
    rest = raw.slice(familyMatch[0].length).trim();
  }

  // 2. Extract Year if present at end (e.g. :2023, /2023, -2023, (2023))
  let year = null;
  const yearMatch = rest.match(/[:\-/(\s]+((?:19|20)\d{2})\)?$/);
  if (yearMatch) {
    year = yearMatch[1];
    rest = rest.slice(0, yearMatch.index).trim();
  }

  // 3. Extract Part and Section
  let part = null;
  let section = null;

  // Patterns like "(Part 5/Sec 3)", "Part 5 Sec 3", "Pt 5 Sec 3", "-5-3"
  const partSecComplexMatch = rest.match(/[-/\s(]+(?:Part|Pt\.?)\s*(\d+)\s*[/\\-\s]\s*(?:Sec|Section)\s*(\d+)\)?/i);
  if (partSecComplexMatch) {
    part = partSecComplexMatch[1];
    section = partSecComplexMatch[2];
    rest = rest.slice(0, partSecComplexMatch.index).trim();
  } else {
    // Patterns like "-5-3" e.g. "10322-5-3"
    const dashPartSecMatch = rest.match(/[-/](\d+)[-/](\d+)$/);
    if (dashPartSecMatch && !rest.includes("Part")) {
      part = dashPartSecMatch[1];
      section = dashPartSecMatch[2];
      rest = rest.slice(0, dashPartSecMatch.index).trim();
    } else {
      // Check Part only
      const partOnlyMatch = rest.match(/[-/\s(]+(?:Part|Pt\.?)\s*(\d+)\)?/i);
      if (partOnlyMatch) {
        part = partOnlyMatch[1];
        rest = rest.slice(0, partOnlyMatch.index).trim();
      }

      // Check Sec only
      const secOnlyMatch = rest.match(/[-/\s(]+(?:Sec|Section)\s*(\d+)\)?/i);
      if (secOnlyMatch) {
        section = secOnlyMatch[1];
        rest = rest.slice(0, secOnlyMatch.index).trim();
      }
    }
  }

  // 4. Extract Base Number (digits)
  const baseNumMatch = rest.match(/^(\d+)/);
  const baseNumber = baseNumMatch ? baseNumMatch[1] : rest.replace(/[^A-Z0-9]/gi, "");

  // 5. Construct Canonical & Display Representations
  let subClause = "";
  if (part && section) {
    subClause = ` (Part ${part}/Sec ${section})`;
  } else if (part) {
    subClause = ` (Part ${part})`;
  } else if (section) {
    subClause = ` (Sec ${section})`;
  }

  const yearSuffix = year ? `:${year}` : "";
  const canonical = `${family} ${baseNumber}${subClause}${yearSuffix}`.trim();
  const display = canonical;

  // Search key: normalized compact string without spaces or special characters
  let searchKeyParts = [family, baseNumber];
  if (part) searchKeyParts.push(`P${part}`);
  if (section) searchKeyParts.push(`S${section}`);
  if (year) searchKeyParts.push(year);
  const searchKey = searchKeyParts.join("");

  return {
    canonical,
    display,
    searchKey,
    family,
    baseNumber,
    part,
    section,
    year,
    isValid: Boolean(baseNumber),
  };
}

/**
 * Normalizes input status string into standard NormWise enum values.
 * Unknown strings map safely to UNKNOWN.
 */
export function normalizeStatus(rawStatus) {
  if (!rawStatus || typeof rawStatus !== "string") {
    return "UNKNOWN";
  }

  const s = rawStatus.toLowerCase().trim();

  // Active / Current
  if (
    s === "current" ||
    s === "active" ||
    s === "valid" ||
    s === "in force" ||
    s === "published" ||
    s === "reaffirmed"
  ) {
    return "CURRENT";
  }

  // Superseded
  if (
    s === "superseded" ||
    s === "replaced" ||
    s === "revised" ||
    s === "obsolete edition" ||
    s.startsWith("superseded by")
  ) {
    return "SUPERSEDED";
  }

  // Withdrawn
  if (
    s === "withdrawn" ||
    s === "cancelled" ||
    s === "repealed" ||
    s === "deleted"
  ) {
    return "WITHDRAWN";
  }

  // Under Review
  if (
    s === "under review" ||
    s === "under revision" ||
    s === "review" ||
    s === "draft" ||
    s === "proposed" ||
    s === "revision in progress"
  ) {
    return "UNDER_REVIEW";
  }

  return "UNKNOWN";
}

/**
 * Normalizes terminology / keywords without technical distortion.
 */
export function normalizeTerm(term) {
  if (!term || typeof term !== "string") return "";
  return term
    .toLowerCase()
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/[^\w\s/]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Normalizes clean title string
 */
export function normalizeTitle(rawTitle) {
  if (!rawTitle || typeof rawTitle !== "string") return "";
  return rawTitle
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*--\s*/g, " — ");
}

export const standardNormalizationService = {
  normalizeStandardNumber,
  normalizeStatus,
  normalizeTerm,
  normalizeTitle,
};
