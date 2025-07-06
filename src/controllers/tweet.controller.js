import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/APIResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import FormatApi from "../utils/FormatApi.js";

const createTweet = asyncHandler(async (req, res) => {
  const { _id: userId } = req?.user;
  const { content } = req?.body;

  // 1. check if the user id is provided
  if (!userId) {
    throw new ApiError(400, "User not found");
  }

  // 2. check if the content is provided
  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  // 3. create the tweet
  const tweet = await Tweet.create({
    content,
    owner: userId,
  });

  //  4. return the response
  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfully"));
});

const getAllTweetsForAUser = asyncHandler(async (req, res) => {
  const { userId } = req?.params;

  // 1. check if the user id is provided
  if (!userId) {
    throw new ApiError(400, "User not found");
  }

  // 2. fetch all the tweets for the user
  const tweets = await Tweet.find({ owner: userId });

  // 3. return the response
  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const getAllTweets = asyncHandler(async (req, res) => {
  // 1. fetch all tweets
  //   const tweets = new FormatApi(Tweet.find({}), req)
  //     .filter()
  //     .sort()
  //     .paginate()
  //     .selectFields();

  const tweets = await Tweet.find({});
  const totalCount = await Tweet.countDocuments();

  // 2. return the response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { tweets, totalCount },
        "Tweets fetched successfully"
      )
    );
});

export { createTweet, getAllTweetsForAUser, getAllTweets };
