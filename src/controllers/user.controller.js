import { User } from "../models/user.model.js";
import { ApiError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const registerUser = asyncHandler(async (req, res) => {
  //   1. get user details from the request body
  //   2. check for the required fields
  //   3. Check if the user already exists?
  //   4. check for required images
  //   5. upload the images to the cloudinary
  //   6. create new user object
  //   7. save the user to the database
  //   8. remove password and refresh token from the response
  //   9. return the response
  //   1. get user details from the request body
  const { fullName, email, password, username } = req.body;
  //   2. check for the required fields
  //   if (
  //     !username?.trim() ||
  //     !fullName?.trim() ||
  //     !email?.trim() ||
  //     !password?.trim()
  //   ) {
  //     throw new ApiError(400, "All fields are required");
  //   }
  if (
    [fullName, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  //   3. Check if the user already exists?
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    throw new ApiError(409, "User already exists with this username or email");
  }
  // 4. check for required images
  const avatarLocalPath = req?.files?.avatar?.[0]?.path; // path of the avatar file uploaded by the user and stored in the local server
  const coverImageLocalPath = req?.files?.coverImage?.[0]?.path; // path of the cover image file uploaded by the user and stored in the local server
  // check for the avatar required field
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }
  // 5. upload the images to the cloudinary
  const avatarUploadResponse = await uploadOnCloudinary(avatarLocalPath); // uploading the avatar to the cloudinary
  //only upload the cover image if it is provided
  let coverImage = null;
  if (coverImageLocalPath) {
    const coverImageUploadResponse =
      await uploadOnCloudinary(coverImageLocalPath);
    coverImage = coverImageUploadResponse?.url;
  }
  // 6. create new user object
  const newUserObj = {
    fullName,
    email,
    username: username?.toLowerCase(),
    password,
    avatar: avatarUploadResponse?.url,
    coverImage: coverImage || "", // if the cover image is not provided, then set it to an empty string
  };
  // 7. save the user to the database
  const user = await User.create(newUserObj);
  // 8. remove password and refresh token from the response
  // making another api call , just to be extra sure that user is created,
  // also removing the password and refresh token from the response
  const createdUser = await User.findById(user?._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  // 9. return the response
  // res.status(201).json(createdUser);
  const response = new ApiResponse(
    201,
    createdUser,
    "User registered successfully"
  );
  response.send(res);
});
