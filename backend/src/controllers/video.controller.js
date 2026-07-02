import { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { Like } from "../models/like.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;
  const filter = { isPublished: true };

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }
    filter.owner = userId;
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, parseInt(limit));

  const videos = await Video.find(filter)
    .populate("owner", "username fullName avatar")
    .sort({ [sortBy]: sortType === "asc" ? 1 : -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean();

  const currentUserId = req.user?._id;
  const videosWithLikes = await Promise.all(
    videos.map(async (video) => {
      const likesCount = await Like.countDocuments({ video: video._id });
      const isLiked = currentUserId
        ? !!(await Like.findOne({ video: video._id, likeBy: currentUserId }))
        : false;
      return { ...video, likesCount, isLiked };
    })
  );

  const totalVideos = await Video.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(200, {
      videos: videosWithLikes,
      pagination: {
        totalVideos,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalVideos / limitNum),
      },
    }, "Videos fetched successfully")
  );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user._id;

  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video file and thumbnail are required");
  }

  const videoUpload = await uploadOnCloudinary(videoLocalPath);
  const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoUpload?.url || !thumbnailUpload?.url) {
    throw new ApiError(500, "Failed to upload media to cloud storage");
  }

  const newVideo = await Video.create({
    videoFile: videoUpload.url,
    thumbnail: thumbnailUpload.url,
    owner: userId,
    title: title.trim(),
    description: description.trim(),
    duration: videoUpload.duration || 0,
    views: 0,
    isPublished: true,
  });

  const populatedVideo = await Video.findById(newVideo._id).populate("owner", "username fullName avatar");

  res.status(201).json(
    new ApiResponse(201, populatedVideo, "Video published successfully")
  );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const video = await Video.findById(videoId).populate("owner", "username fullName avatar");
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  video.views += 1;
  await video.save({ validateBeforeSave: false });

  const videoObj = video.toObject();
  videoObj.likesCount = await Like.countDocuments({ video: video._id });
  videoObj.isLiked = req.user?._id ? !!(await Like.findOne({ video: video._id, likeBy: req.user._id })) : false;

  if (videoObj.owner) {
    videoObj.owner.subscribersCount = await Subscription.countDocuments({ channel: videoObj.owner._id });
    videoObj.owner.isSubscribed = req.user?._id ? !!(await Subscription.findOne({ channel: videoObj.owner._id, subscriber: req.user._id })) : false;
  }

  res.status(200).json(
    new ApiResponse(200, videoObj, "Video fetched successfully")
  );
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check authorization
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to update this video");
  }

  if (title) video.title = title.trim();
  if (description) video.description = description.trim();

  if (thumbnailLocalPath) {
    const oldThumbnail = video.thumbnail;
    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);
    if (thumbnailUpload?.url) {
      video.thumbnail = thumbnailUpload.url;
      await deleteFromCloudinary(oldThumbnail, "image");
    }
  }

  await video.save();

  res.status(200).json(
    new ApiResponse(200, video, "Video updated successfully")
  );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check authorization
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to delete this video");
  }

  // Clean up cloud storage
  await deleteFromCloudinary(video.videoFile, "video");
  await deleteFromCloudinary(video.thumbnail, "image");

  // Remove from database
  await Video.findByIdAndDelete(videoId);

  res.status(200).json(
    new ApiResponse(200, null, "Video deleted successfully")
  );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check authorization
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to update this video");
  }

  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });

  res.status(200).json(
    new ApiResponse(200, video, "Publish status updated successfully")
  );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
