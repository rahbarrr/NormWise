import prisma from "../config/db.js";

export const createDocument = async (data) => {
  const {
    recommendationId,
    filename,
    fileType = "application/pdf",
    fileSize = "0",
    pageCount = 1,
    processingStatus = "UPLOADED",
  } = data;

  const createData = {
    filename,
    fileType,
    fileSize: String(fileSize || "0"),
    pageCount: Number(pageCount || 1),
    processingStatus,
  };

  if (recommendationId) {
    createData.recommendation = { connect: { id: recommendationId } };
  }

  return await prisma.document.create({
    data: createData,
  });
};

export const getDocumentById = async (id) => {
  return await prisma.document.findUnique({
    where: { id },
    include: {
      recommendation: {
        select: {
          id: true,
          product: true,
          status: true,
        },
      },
    },
  });
};

export const updateDocumentStatus = async (id, processingStatus) => {
  return await prisma.document.update({
    where: { id },
    data: { processingStatus },
  });
};
