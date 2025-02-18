import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleLike = async (filter) => {
  const existingLike = await Like.findOne(filter);
  if (existingLike) {
    await Like.findOneAndDelete(filter);
    return { liked: false };
  } else {
    await Like.create(filter);
    return { liked: true };
  }
};

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

  const result = await toggleLike({ video: videoId, likeBy: req.user._id });
  res.status(200).json(new ApiResponse(200, result, "Video like toggled"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const result = await toggleLike({ comment: commentId, likeBy: req.user._id });
  res.status(200).json(new ApiResponse(200, result, "Comment like toggled"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet ID");

  const result = await toggleLike({ tweet: tweetId, likeBy: req.user._id });
  res.status(200).json(new ApiResponse(200, result, "Tweet like toggled"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.find({
    likeBy: req.user.id,
    video: { $ne: null },
  })
    .populate("video", "title thumbnailUrl")
    .select("video");

  res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
