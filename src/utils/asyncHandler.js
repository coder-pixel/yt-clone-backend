export const asyncHandler = (func) => async (req, res, next) => {
  try {
    await func(req, res, next);
  } catch (err) {
    console.log(err);
    res.status(res.status || 500).json({
      success: false,
      message: err?.message || "Internal Server Error",
    });
  }
};
