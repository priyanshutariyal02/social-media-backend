import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { User } from "../models/user.models.js";

import jwt from "jsonwebtoken";
// if req, res, next: res not in use, so replace res by '_' (userScore), this technique use in production level
export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "");
    if (!token) {
      throw new ApiError(401, "Unauthorized request!");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "Invalid Access Token!");
    }

    // if valid user then:
    req.user = user;
    next();
  } catch (error) {
    console.log("Error in auth.middleware.js: ", error);
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});
