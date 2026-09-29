/**
 * Standard Repository
 * Database access layer for standards table
 */
import prisma from "../config/db.js";

export const findStandardById = async (id) => {
  return await prisma.standard.findUnique({
    where: { id },
  });
};

export const findStandardByNumber = async (standardNumber) => {
  return await prisma.standard.findUnique({
    where: { standardNumber },
  });
};

export const searchStandards = async ({ query, category, limit = 20, offset = 0 }) => {
  const where = {};
  if (category) where.category = category;
  if (query) {
    where.OR = [
      { standardNumber: { contains: query, mode: "insensitive" } },
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  return await prisma.standard.findMany({
    where,
    take: limit,
    skip: offset,
    orderBy: { standardNumber: "asc" },
  });
};

export const countStandards = async () => {
  return await prisma.standard.count();
};
