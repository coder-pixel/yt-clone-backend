import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/APIError.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/APIResponse.js";
export const getAllVideos = asyncHandler(async (req, res) => {});

export const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const videoLocalFilePath = req?.files?.video?.[0]?.path;
  const thumbnailLocalFilePath = req?.files?.thumbnail?.[0]?.path;

  if (
    !title ||
    !description ||
    !videoLocalFilePath ||
    !thumbnailLocalFilePath
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (!req?.user) {
    throw new ApiError(401, "Please login to publish a video");
  }

  // upload the video and thumbnail to cloudinary
  const videoResponse = await uploadOnCloudinary(videoLocalFilePath);
  const thumbnailResponse = await uploadOnCloudinary(thumbnailLocalFilePath);

  const videoFile = videoResponse?.url;
  const duration = videoResponse?.duration;

  const thumbnail = thumbnailResponse?.url;

  // create the video document
  const videoDoc = {
    videoFile,
    thumbnail,
    title,
    description,
    duration,
    owner: req?.user?._id,
  };

  // save the video document to the database
  const video = await Video.create(videoDoc);

  // return the video document
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video published successfully"));
});
