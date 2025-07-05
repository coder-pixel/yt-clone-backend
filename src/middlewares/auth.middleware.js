import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/APIError.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // 1. check if the token is present in the cookie
    const token =
      req?.cookies?.accessToken || // accessToken is the name of the cookie, this is the cookie that we set in the login route
      req?.header("Authorization")?.replace("Bearer ", ""); // it is for the case when cookie doesn;t have token, so we check in the header - in the case of mobile apps, we send the token in the header

    if (!token) {
      throw new ApiError(401, "Unauthorized");
    }

    // 2. verify the token and getbthe
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // 3. if the token is valid, then get the user details from the database
    const user = await User.findById(decoded?.id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    // 4. if the user is found, then add the user details to the request object
    req.user = user;

    // 5. if the user is found, then call the next middleware
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
