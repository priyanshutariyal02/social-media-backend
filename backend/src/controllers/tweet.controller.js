import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { Like } from "../models/like.models.js";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) {
    throw new ApiError(400, "Tweet content is required");
  }

  const tweet = await Tweet.create({
    content: content.trim(),
    owner: req.user._id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const filter = {};

  if (userId && userId !== "all") {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }
    filter.owner = userId;
  }

  const tweets = await Tweet.find(filter)
    .populate("owner", "username fullName avatar")
    .sort({ createdAt: -1 })
    .lean();

  const currentUserId = req.user?._id;
  const tweetsWithLikes = await Promise.all(
    tweets.map(async (tweet) => {
      const likesCount = await Like.countDocuments({ tweet: tweet._id });
      const commentsCount = await Comment.countDocuments({ tweet: tweet._id });
      const isLiked = currentUserId
        ? !!(await Like.findOne({ tweet: tweet._id, likeBy: currentUserId }))
        : false;
      return { ...tweet, likesCount, commentsCount, isLiked };
    })
  );

  res
    .status(200)
    .json(new ApiResponse(200, tweetsWithLikes, "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }
  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to update this tweet");
  }

  tweet.content = content.trim();
  await tweet.save();

  res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to delete this tweet");
  }

  await Tweet.findByIdAndDelete(tweetId);

  res
    .status(200)
    .json(new ApiResponse(200, null, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
