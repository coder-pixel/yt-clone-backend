import { v2 as cloudinary } from "cloudinary";

import asyncHandler from "../utils/asyncHandler.js";
import { generateThumbnail, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/APIError.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/APIResponse.js";

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const videoLocalFilePath = req?.files?.video?.[0]?.path;
  const thumbnailLocalFilePath = req?.files?.thumbnail?.[0]?.path;

  if (!title || !description || !videoLocalFilePath) {
    throw new ApiError(400, "All fields are required");
  }

  if (!req?.user) {
    throw new ApiError(401, "Please login to publish a video");
  }

  // upload the video and thumbnail to cloudinary
  const videoResponse = await uploadOnCloudinary(videoLocalFilePath);

  let thumbnail = null;
  if (thumbnailLocalFilePath) {
    const thumbnailResponse = await uploadOnCloudinary(thumbnailLocalFilePath);
    thumbnail = thumbnailResponse?.url;
  } else {
    // generate a thumbnail
    thumbnail = await generateThumbnail(videoResponse?.public_id);
    console.log({ thumbnail });
  }

  const videoFile = videoResponse?.url;
  const duration = videoResponse?.duration;

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

// responsible for fetching all the videos
const getAllVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({}) // fetch all the videos
    .populate("owner", "fullName email username avatar") // populate the owner field with the name and email of the user
    .exec(); // execute the query

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

// resposible for fetching all the videos created by the logged in user
const getAllUserVideos = asyncHandler(async (req, res) => {
  const { user } = req;

  // need to fetch all the videos created by the user -> owner: user?._id
  const videos = await Video.find({ owner: user?._id });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videos, totalVideos: videos?.length },
        "Videos fetched successfully"
      )
    );
});

export { publishAVideo, getAllVideos, getAllUserVideos };
