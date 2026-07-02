import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  if (channelId.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  const existingSub = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (existingSub) {
    await Subscription.findByIdAndDelete(existingSub._id);
    return res
      .status(200)
      .json(new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully"));
  }

  await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, { subscribed: true }, "Subscribed successfully"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const channelId = req.params.channelId || req.params.subscriberId;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberDetails",
      },
    },
    {
      $unwind: "$subscriberDetails",
    },
    {
      $project: {
        _id: "$subscriberDetails._id",
        username: "$subscriberDetails.username",
        fullName: "$subscriberDetails.fullName",
        avatar: "$subscriberDetails.avatar",
        createdAt: 1,
      },
    },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, subscribers, "Channel subscribers fetched successfully"));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const subscriberId = req.params.subscriberId || req.params.channelId;
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }

  const channels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelDetails",
      },
    },
    {
      $unwind: "$channelDetails",
    },
    {
      $project: {
        _id: "$channelDetails._id",
        username: "$channelDetails.username",
        fullName: "$channelDetails.fullName",
        avatar: "$channelDetails.avatar",
        createdAt: 1,
      },
    },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, channels, "Subscribed channels fetched successfully"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };