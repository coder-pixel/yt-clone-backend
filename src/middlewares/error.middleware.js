import { ApiError } from "../utils/APIError.js";

export const errorHandler = (err, req, res, next) => {
  console.error("🔥 Global Error Handler:", err);

  // const status = err?.status || 500;
  // const message = err?.message || "Internal Server Error from middleware";

  const status = err instanceof ApiError ? err?.statusCode : 500; // err?.statusCode -> added for AppError class in utils/AppError.ts
  const message =
    err instanceof ApiError ? err?.message : "Something went wrong";

  res.status(status).json({
    error: true,
    message,
    // statusCode: status  => can add more stuff here, to make error object moew meaningfull
  });
};
