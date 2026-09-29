/**
 * Document Repository
 * Database access layer for documents table
 */
import prisma from "../config/db.js";

export const findDocumentById = async (id) => {
  return await prisma.document.findUnique({
    where: { id },
  });
};

export const createDocumentRecord = async (data) => {
  return await prisma.document.create({
    data,
  });
};

export const updateDocumentStatus = async (id, status, error = null) => {
  return await prisma.document.update({
    where: { id },
    data: {
      processingStatus: status,
      processingError: error,
      updatedAt: new Date(),
    },
  });
};
