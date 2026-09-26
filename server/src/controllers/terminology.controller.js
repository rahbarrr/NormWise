/**
 * NormWise Terminology Controller (Phase 16)
 * Manages verified technical multilingual terminology in PostgreSQL.
 * Supports Admin review workflow (Approve, Reject, Edit, Search).
 */

import prisma from "../config/db.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { normalizeLanguageCode } from "../config/languages.js";

/**
 * GET /api/terminology
 */
export async function getTerminology(req, res, next) {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = Math.min(100, parseInt(req.query.limit || "20", 10));
    const skip = (page - 1) * limit;

    const { language, termType, isVerified, search } = req.query;

    const where = {};
    if (language && language !== "ALL") {
      where.language = normalizeLanguageCode(language);
    }
    if (termType && termType !== "ALL") {
      where.termType = termType.toUpperCase();
    }
    if (isVerified !== undefined && isVerified !== "ALL") {
      where.isVerified = isVerified === "true";
    }
    if (search && search.trim()) {
      where.OR = [
        { term: { contains: search.trim(), mode: "insensitive" } },
        { normalizedTerm: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.standardTerm.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isVerified: "asc" }, { updatedAt: "desc" }],
      }),
      prisma.standardTerm.count({ where }),
    ]);

    return sendSuccess(res, {
      items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    }, 200);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/terminology
 */
export async function createTerm(req, res, next) {
  try {
    const { term, normalizedTerm, language = "EN", termType = "PRODUCT", category = "GENERAL", source = "MANUAL_INPUT" } = req.body;

    if (!term || !normalizedTerm) {
      return sendError(res, "Both 'term' and 'normalizedTerm' are required.", 400);
    }

    const created = await prisma.standardTerm.create({
      data: {
        term: term.trim(),
        normalizedTerm: normalizedTerm.trim().toLowerCase(),
        language: normalizeLanguageCode(language),
        termType: termType.toUpperCase(),
        category,
        source,
        isVerified: true, // Manual admin entry is verified by default
      },
    });

    return sendSuccess(res, created, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/terminology/:id
 */
export async function updateTerm(req, res, next) {
  try {
    const { id } = req.params;
    const { term, normalizedTerm, language, termType, isVerified, category } = req.body;

    const data = {};
    if (term !== undefined) data.term = term.trim();
    if (normalizedTerm !== undefined) data.normalizedTerm = normalizedTerm.trim().toLowerCase();
    if (language !== undefined) data.language = normalizeLanguageCode(language);
    if (termType !== undefined) data.termType = termType.toUpperCase();
    if (isVerified !== undefined) data.isVerified = Boolean(isVerified);
    if (category !== undefined) data.category = category;

    const updated = await prisma.standardTerm.update({
      where: { id },
      data,
    });

    return sendSuccess(res, updated, 200);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/terminology/:id/approve
 */
export async function approveTerm(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await prisma.standardTerm.update({
      where: { id },
      data: { isVerified: true },
    });
    return sendSuccess(res, updated, 200);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/terminology/:id/reject
 */
export async function rejectTerm(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await prisma.standardTerm.update({
      where: { id },
      data: { isVerified: false },
    });
    return sendSuccess(res, updated, 200);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/terminology/:id
 */
export async function deleteTerm(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.standardTerm.delete({ where: { id } });
    return sendSuccess(res, { deleted: true, id }, 200);
  } catch (err) {
    next(err);
  }
}
