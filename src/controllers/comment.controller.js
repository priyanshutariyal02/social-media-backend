import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const comment = await Comment.aggregate([
    { $match: { video: mongoose.Types.ObjectId(videoId) } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
      },
    },
    { $unwind: "$ownerDetails" },
    {
      $project: {
        _id: 1,
        content: 1,
        createdAt: 1,
        "ownerDetails._id": 1,
        "ownerDetails.username": 1,
        "ownerDetails.profileImage": 1,
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: parseInt(limit) },
  ]);
  res
    .status(200)
    .json(new ApiResponse(200, comment, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  const ownerId = req.user?._id;

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: ownerId,
  });

  if (!comment) {
    throw new ApiError(404, "Commnet not add successfully!");
  }

  res
    .status(201)
    .json(new ApiResponse(201, comment, "Add comment successfully!"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const ownerId = req.user.id;

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
  const { commentId } = req.body;
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

export { getVideoComments, addComment, updateComment, deleteComment };
