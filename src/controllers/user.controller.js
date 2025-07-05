import { cookieOptions } from "../config/index.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const _generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken; // saving the refresh token to the user object
    await user.save({ validateBeforeSave: false }); // saving the refresh token to the database, validateBeforeSave is false because we don't want to validate the user before saving the refresh token

    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};

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

export const loginUser = asyncHandler(async (req, res) => {
  // 1. get the user details from the request body
  // 2. check for required fields, if not throw an error
  // 3. check if user exists, if not throw an error
  // 4. check for the password, if not throw an error
  // 5. if everything is fine, then generate the access token and refresh token
  // 6. send tokenin cookie and return the response

  if (!req.body) {
    throw new ApiError(400, "Request body is required");
  }

  // 1. get the user details from the body
  const { email, username, password } = req?.body;

  // 2. check for required fields, if not throw an error
  if (!email && !username) {
    throw new ApiError(400, "Email or username is required");
  }
  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  // 3. check if user exists, if not throw an error
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, "User not found with this email or username");
  }

  // 4. check for the password, if not throw an error
  const isPasswordCorrect = await user.isPasswordCorrect(password); // user -> it is the instance of the User model, that we find above, can't find this method in the User model as custom made methods are to be used from the instances
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid password");
  }

  // 5. if everything is fine, then generate the access token and refresh token
  const { accessToken, refreshToken } = await _generateAccessAndRefreshTokens(
    user?._id
  );

  // 6. send token in cookie and return the response
  const loggedInUser = {
    _id: user?._id,
    fullName: user?.fullName || "",
    username: user?.username || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
    coverImage: user?.coverImage || "",
  };

  // cookie options

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: {
        refreshToken: null,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions) // clearing the access token from the cookie, need to pass the cookie options
    .clearCookie("refreshToken", cookieOptions) // clearing the refresh token from the cookie, need to pass the cookie options
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  // 1. get the refresh token from the cookie
  const incomingRefreshToken =
    req?.cookies?.refreshToken || req?.body?.refreshToken; // req?.body?.refreshToken is for the case when the refresh token is sent in the body, eg: mobile apps

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized");
  }

  // 2. verify the refresh token
  const decoded = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  // 3. check if the user exists
  const user = await User.findById(decoded?.id);
  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  // 4. check if the refresh token is valid
  if (user?.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "refresh token is expired or used");
  }

  // 5. generate the new access token
  const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
    await _generateAccessAndRefreshTokens(user?._id);

  // 6. send the new access token in the cookie
  return res
    .status(200)
    .cookie("accessToken", newAccessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(new ApiResponse(200, null, "Access token refreshed successfully"));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req?.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findById(req?.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false }); // validateBeforeSave is false because we don't want to validate the user before saving the new password

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password changed successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req?.user, "Current user fetched successfully"));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, email } = req?.body;

  if (!fullName && !email) {
    throw new ApiError(400, "Nothing to update");
  }

  const user = await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});

export const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req?.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatarUploadResponse = await uploadOnCloudinary(avatarLocalPath);

  if (!avatarUploadResponse?.url) {
    throw new ApiError(500, "Something went wrong while uploading the avatar");
  }

  const user = await User.findByIdAndUpdate(
    req?.user?._id,
    { $set: { avatar: avatarUploadResponse?.url } },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req?.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image is required");
  }

  const coverImageUploadResponse =
    await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImageUploadResponse?.url) {
    throw new ApiError(
      500,
      "Something went wrong while uploading the cover image"
    );
  }

  const user = await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: {
        coverImage: coverImageUploadResponse?.url,
      },
    },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});
