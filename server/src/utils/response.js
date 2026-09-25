/**
 * NormWise - Standardized API Response Utilities
 */

export const sendSuccess = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

export const sendError = (res, message, statusCode = 500, details = null) => {
  const errorObj = { message };
  if (details && process.env.NODE_ENV === "development") {
    errorObj.details = details;
  }

  return res.status(statusCode).json({
    success: false,
    error: errorObj,
  });
};
