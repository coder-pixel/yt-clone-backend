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
    .json(
      new ApiResponse(
        200,
        { videos, totalVideos: videos?.length },
        "Videos fetched successfully"
      )
    );
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

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  const video = await Video.findById(videoId)
    .populate("owner", "fullName email username avatar") // populate the owner field with the name and email of the user
    .exec(); // execute the query

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideoById = asyncHandler(async (req, res) => {
  // 1. get the video id from the request params
  const { videoId } = req.params;

  const { title, description } = req.body;
  const videoLocalFilePath = req?.files?.video?.[0]?.path;
  const thumbnailLocalFilePath = req?.files?.thumbnail?.[0]?.path;

  // 2. check if the user is sending any updates
  // basically if the user is not sending anything for the update then we will return a success response
  if (
    !title &&
    !description &&
    !videoLocalFilePath &&
    !thumbnailLocalFilePath
  ) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "No updates required"));
  }

  // 3. check if the video exists
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // 4. if video exists, check if the user is the owner of the video
  if (video?.owner?.toString() !== req?.user?._id?.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  // 5. update the video and thumbnail and other details
  // if user is sending a video file, then we need to upload it to cloudinary, same for the thumbnail
  // Initialize variables to store the uploaded video and thumbnail information
  let videoResponse = null;
  let thumbnail = null;

  // Check if user uploaded a new video file
  if (videoLocalFilePath) {
    // Upload the new video to cloudinary (our cloud storage)
    videoResponse = await uploadOnCloudinary(videoLocalFilePath);

    // TODO: We need to delete the old video from cloudinary to save storage space
    // ---- TODO: Implement this -----

    // Check if user also uploaded a custom thumbnail image
    if (thumbnailLocalFilePath) {
      // Upload the custom thumbnail to cloudinary
      const thumbnailResponse = await uploadOnCloudinary(
        thumbnailLocalFilePath
      );
      thumbnail = thumbnailResponse?.url;

      // TODO: We need to delete the old thumbnail from cloudinary to save storage space
      // ---- TODO: Implement this -----
    } else {
      // If no custom thumbnail was uploaded, automatically generate one from the video
      // This creates a thumbnail image at 3 seconds into the video
      thumbnail = await generateThumbnail(videoResponse?.public_id);
    }
  }

  // If user only uploaded a thumbnail without a video (rare case)
  if (thumbnailLocalFilePath) {
    // Upload just the thumbnail to cloudinary
    const thumbnailResponse = await uploadOnCloudinary(thumbnailLocalFilePath);
    thumbnail = thumbnailResponse?.url;
  }

  // 6. create the video document optionally based on the updates
  const updatedVideoObj = {};

  if (title) updatedVideoObj.title = title;
  if (description) updatedVideoObj.description = description;
  if (videoResponse) updatedVideoObj.videoFile = videoResponse?.url;
  if (thumbnail) updatedVideoObj.thumbnail = thumbnail;

  // 7. update the video document
  const updatedVideo = await Video.findByIdAndUpdate(videoId, updatedVideoObj, {
    new: true, // return the updated video document
  });

  // 8. return the updated video document
  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // 1. check if the video id is provided
  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  // 2. check if the video exists
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // 3. check if the user is the owner of the video
  if (video?.owner?.toString() !== req?.user?._id?.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  // 4. delete the video from the database
  await Video.findByIdAndDelete(videoId);

  // 5. return the success response
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Video deleted successfully"));
});

export {
  publishAVideo,
  getAllVideos,
  getAllUserVideos,
  getVideoById,
  updateVideoById,
  deleteVideoById,
};
