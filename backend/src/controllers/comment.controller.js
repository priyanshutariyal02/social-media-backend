import mongoose from "mongoose";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, parseInt(limit));

  const comments = await Comment.find({ video: videoId, parentComment: null })
    .populate("owner", "username fullName avatar")
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean();

  const commentsWithRepliesCount = await Promise.all(
    comments.map(async (comm) => {
      const repliesCount = await Comment.countDocuments({ parentComment: comm._id });
      return { ...comm, repliesCount };
    })
  );

  res
    .status(200)
    .json(new ApiResponse(200, commentsWithRepliesCount, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  const ownerId = req.user?._id;

  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }

  const comment = await Comment.create({
    content: content.trim(),
    video: videoId,
    owner: ownerId,
  });

  if (!comment) {
    throw new ApiError(500, "Comment could not be added");
  }

  const populatedComment = await Comment.findById(comment._id).populate(
    "owner",
    "username fullName avatar"
  );

  res
    .status(201)
    .json(new ApiResponse(201, populatedComment, "Comment added successfully!"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const ownerId = req.user._id;

  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, owner: ownerId },
    { content },
    { new: true }
  );

  if (!comment) {
    throw new ApiError(404, "Comment not found or unauthorized");
  }

  res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const ownerId = req.user._id;

  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    owner: ownerId,
  });

  if (!comment) {
    throw new ApiError(404, "Comment not found or unauthorized");
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted successfully"));
});

const getTweetComments = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const comments = await Comment.find({ tweet: tweetId })
    .populate("owner", "username fullName avatar")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, comments, "Tweet comments fetched successfully"));
});

const addTweetComment = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;
  const ownerId = req.user?._id;

  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }

  const comment = await Comment.create({
    content: content.trim(),
    tweet: tweetId,
    owner: ownerId,
  });

  const populatedComment = await Comment.findById(comment._id).populate(
    "owner",
    "username fullName avatar"
  );

  res
    .status(201)
    .json(new ApiResponse(201, populatedComment, "Reply added successfully!"));
});

const getCommentReplies = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const replies = await Comment.find({ parentComment: commentId })
    .populate("owner", "username fullName avatar")
    .sort({ createdAt: 1 });

  res
    .status(200)
    .json(new ApiResponse(200, replies, "Replies fetched successfully"));
});

const addCommentReply = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const ownerId = req.user?._id;

  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }

  const parentComment = await Comment.findById(commentId);
  if (!parentComment) {
    throw new ApiError(404, "Parent comment not found");
  }

  const reply = await Comment.create({
    content: content.trim(),
    video: parentComment.video,
    parentComment: commentId,
    owner: ownerId,
  });

  const populatedReply = await Comment.findById(reply._id).populate(
    "owner",
    "username fullName avatar"
  );

  res
    .status(201)
    .json(new ApiResponse(201, populatedReply, "Reply added successfully!"));
});

export {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
  getTweetComments,
  addTweetComment,
  getCommentReplies,
  addCommentReply,
};
