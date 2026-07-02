import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Video, Comment } from "../types";
import { useAuth } from "../context/AuthContext";
import {
  ThumbsUp,
  MessageSquare,
  Send,
  Trash2,
  Eye,
  Calendar,
  UserPlus,
  Check,
} from "lucide-react";

export const WatchVideo: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");

  // Fetch video details
  const { data: video, isLoading: isVideoLoading } = useQuery<Video>({
    queryKey: ["video", videoId],
    queryFn: async () => {
      const res = await api.get(`/videos/${videoId}`);
      return res.data?.data;
    },
    enabled: !!videoId,
  });

  // Fetch comments
  const { data: comments } = useQuery<Comment[]>({
    queryKey: ["comments", videoId],
    queryFn: async () => {
      const res = await api.get(`/comments/${videoId}`);
      return res.data?.data?.docs || res.data?.data || [];
    },
    enabled: !!videoId,
  });

  // Like video mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/likes/toggle/v/${videoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video", videoId] });
    },
  });

  // Subscribe channel mutation
  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!video?.owner?._id) return;
      await api.post(`/subscriptions/c/${video.owner._id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video", videoId] });
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      await api.post(`/comments/${videoId}`, { content });
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["comments", videoId] });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await api.delete(`/comments/c/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", videoId] });
    },
  });

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !isAuthenticated) return;
    addCommentMutation.mutate(commentText);
  };

  if (isVideoLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse max-w-5xl mx-auto">
        <div className="aspect-video w-full rounded-3xl bg-[#131a2a]" />
        <div className="h-8 w-3/4 bg-[#131a2a] rounded-xl" />
        <div className="h-16 w-full bg-[#131a2a] rounded-2xl" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="p-12 text-center text-gray-400 bg-[#131a2a] rounded-3xl">
        Video not found or unavailable.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-16">
      {/* Video Player Box */}
      <div className="rounded-3xl overflow-hidden bg-black border border-[#1f293d] shadow-2xl aspect-video relative">
        <video
          src={video.videoFile}
          poster={video.thumbnail}
          controls
          autoPlay
          className="w-full h-full object-contain"
        />
      </div>

      {/* Title and Quick Stats */}
      <div className="flex flex-col gap-4 border-b border-[#1f293d] pb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
          {video.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Creator Profile */}
          <div className="flex items-center gap-4">
            <img
              src={
                video.owner?.avatar ||
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"
              }
              alt={video.owner?.username}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-500/50"
            />
            <div className="flex flex-col">
              <span className="text-base font-bold text-white">
                {video.owner?.fullName || `@${video.owner?.username}`}
              </span>
              <span className="text-xs text-gray-400">
                {video.owner?.subscribersCount || 0} Subscribers
              </span>
            </div>

            {isAuthenticated && user?._id !== video.owner?._id && (
              <button
                onClick={() => subscribeMutation.mutate()}
                className={`ml-2 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
                  video.owner?.isSubscribed
                    ? "bg-[#1f293d] text-gray-300 hover:bg-[#28354f]"
                    : "bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:brightness-110"
                }`}
              >
                {video.owner?.isSubscribed ? (
                  <>
                    <Check className="w-4 h-4" /> Subscribed
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Subscribe
                  </>
                )}
              </button>
            )}
          </div>

          {/* Actions Bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => isAuthenticated && likeMutation.mutate()}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold transition-all ${
                video.isLiked
                  ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400"
                  : "bg-[#131a2a] border-[#1f293d] text-gray-300 hover:bg-[#1f293d]"
              }`}
            >
              <ThumbsUp
                className={`w-4 h-4 ${video.isLiked ? "fill-cyan-400" : ""}`}
              />
              <span>{video.likesCount || 0} Likes</span>
            </button>

            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#131a2a] border border-[#1f293d] text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-cyan-400" />
                {video.views || 0} Views
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                {new Date(video.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Description Box */}
        <div className="p-4 rounded-2xl bg-[#131a2a] border border-[#1f293d] text-sm text-gray-300 whitespace-pre-wrap leading-relaxed mt-2">
          {video.description || "No description provided."}
        </div>
      </div>

      {/* Comments Section */}
      <div className="flex flex-col gap-6 mt-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          <span>Comments ({comments?.length || 0})</span>
        </h3>

        {/* Add Comment Form */}
        {isAuthenticated ? (
          <form onSubmit={handleAddComment} className="flex gap-3">
            <img
              src={user?.avatar}
              alt={user?.username}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
            <div className="flex-1 relative">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a public comment..."
                className="w-full bg-[#131a2a] border border-[#1f293d] rounded-2xl pl-4 pr-12 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || addCommentMutation.isPending}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-cyan-500 text-black hover:brightness-110 disabled:opacity-30 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 rounded-2xl bg-[#131a2a] border border-[#1f293d] text-center text-xs text-gray-400">
            Please sign in to join the conversation.
          </div>
        )}

        {/* Comments Feed */}
        <div className="flex flex-col gap-4 mt-2">
          {comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment._id}
                className="flex gap-3 p-4 rounded-2xl bg-[#131a2a]/60 border border-[#1f293d] group"
              >
                <img
                  src={comment.owner?.avatar}
                  alt={comment.owner?.username}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-gray-200">
                      @{comment.owner?.username}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1 leading-normal break-words">
                    {comment.content}
                  </p>
                </div>

                {user?._id === comment.owner?._id && (
                  <button
                    onClick={() => deleteCommentMutation.mutate(comment._id)}
                    title="Delete Comment"
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 transition-all shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-sm text-gray-500">
              No comments yet. Start the discussion!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
