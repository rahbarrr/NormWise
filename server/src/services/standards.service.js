import prisma from "../config/db.js";

export const getStandards = async ({ search = "", status = "" } = {}) => {
  const where = {};

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { standardNumber: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  return await prisma.standard.findMany({
    where,
    include: {
      amendments: true,
      _count: {
        select: {
          evidences: true,
          recommendationStandards: true,
          relatedStandards: true,
        },
      },
    },
    orderBy: { standardNumber: "asc" },
  });
};

export const getStandardById = async (idOrNumber) => {
  return await prisma.standard.findFirst({
    where: {
      OR: [{ id: idOrNumber }, { standardNumber: idOrNumber }],
    },
    include: {
      amendments: {
        orderBy: { amendmentNumber: "asc" },
      },
      relatedStandards: {
        include: {
          relatedStandard: true,
        },
      },
      referencedBy: {
        include: {
          standard: true,
        },
      },
    },
  });
};

export const createStandard = async (data) => {
  return await prisma.standard.create({
    data,
  });
};
