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
  CornerDownRight,
  Loader2,
} from "lucide-react";

const VideoCommentRepliesSection: React.FC<{ commentId: string; videoId: string }> = ({
  commentId,
  videoId,
}) => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState("");

  const { data: replies, isLoading } = useQuery<any[]>({
    queryKey: ["commentReplies", commentId],
    queryFn: async () => {
      const res = await api.get(`/comments/r/${commentId}`);
      return res.data?.data || [];
    },
  });

  const addReplyMutation = useMutation({
    mutationFn: async (text: string) => {
      await api.post(`/comments/r/${commentId}`, { content: text });
    },
    onSuccess: () => {
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ["commentReplies", commentId] });
      queryClient.invalidateQueries({ queryKey: ["videoComments", videoId] });
    },
  });

  const deleteReplyMutation = useMutation({
    mutationFn: async (replyId: string) => {
      await api.delete(`/comments/c/${replyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commentReplies", commentId] });
      queryClient.invalidateQueries({ queryKey: ["videoComments", videoId] });
    },
  });

  const handlePostReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !isAuthenticated) return;
    addReplyMutation.mutate(replyText);
  };

  return (
    <div className="mt-3 pt-3 border-t border-[#1f293d] pl-8 flex flex-col gap-3">
      {/* Reply Input */}
      {isAuthenticated ? (
        <form onSubmit={handlePostReply} className="flex gap-2 items-center">
          <img
            src={user?.avatar}
            alt={user?.username}
            className="w-6 h-6 rounded-full object-cover shrink-0"
          />
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Add a reply..."
            className="flex-1 bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-1.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={!replyText.trim() || addReplyMutation.isPending}
            className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs disabled:opacity-40 transition-all flex items-center gap-1 shrink-0"
          >
            {addReplyMutation.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Send className="w-3 h-3" />
            )}
            <span>Reply</span>
          </button>
        </form>
      ) : (
        <div className="text-[11px] text-gray-500 italic">Sign in to reply.</div>
      )}

      {/* Replies List */}
      <div className="flex flex-col gap-2.5">
        {isLoading ? (
          <div className="text-[11px] text-gray-500 py-1 animate-pulse">Loading replies...</div>
        ) : replies && replies.length > 0 ? (
          replies.map((reply) => (
            <div
              key={reply._id}
              className="flex gap-2.5 p-2.5 rounded-xl bg-[#0b0f19]/60 border border-[#1f293d]/60 group"
            >
              <CornerDownRight className="w-3.5 h-3.5 text-gray-600 shrink-0 mt-0.5" />
              <img
                src={reply.owner?.avatar || user?.avatar}
                alt={reply.owner?.username || user?.username}
                className="w-6 h-6 rounded-full object-cover shrink-0"
              />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-gray-200">
                    @{reply.owner?.username || user?.username}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {new Date(reply.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-1 leading-normal break-words">
                  {reply.content}
                </p>
              </div>

              {user?._id === (reply.owner?._id || user?._id) && (
                <button
                  onClick={() => deleteReplyMutation.mutate(reply._id)}
                  className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all px-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="text-[11px] text-gray-600 py-1 pl-6">No replies yet.</div>
        )}
      </div>
    </div>
  );
};

export const WatchVideo: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [openReplyCommentId, setOpenReplyCommentId] = useState<string | null>(null);

  // Fetch video details
  const { data: video, isLoading: isVideoLoading } = useQuery<Video>({
    queryKey: ["video", videoId],
    queryFn: async () => {
      const res = await api.get(`/videos/${videoId}`);
      return res.data?.data;
    },
    enabled: !!videoId,
  });

  // Fetch video comments
  const { data: comments, isLoading: isCommentsLoading } = useQuery<Comment[]>({
    queryKey: ["videoComments", videoId],
    queryFn: async () => {
      const res = await api.get(`/comments/${videoId}`);
      return res.data?.data || [];
    },
    enabled: !!videoId,
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/likes/toggle/v/${videoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video", videoId] });
    },
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      await api.post(`/subscriptions/c/${targetUserId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video", videoId] });
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      await api.post(`/comments/${videoId}`, { content: text });
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["videoComments", videoId] });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await api.delete(`/comments/c/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videoComments", videoId] });
    },
  });

  if (isVideoLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse max-w-5xl mx-auto">
        <div className="aspect-video bg-[#131a2a] rounded-3xl" />
        <div className="h-8 bg-[#131a2a] rounded w-2/3" />
        <div className="h-24 bg-[#131a2a] rounded w-full" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="text-center py-16 text-gray-400">
        Video not found or unavailable.
      </div>
    );
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !isAuthenticated) return;
    addCommentMutation.mutate(commentText);
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-12">
      {/* Video Player */}
      <div className="relative aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-[#1f293d]">
        <video
          src={video.videoFile}
          poster={video.thumbnail}
          controls
          autoPlay
          className="w-full h-full object-contain"
        />
      </div>

      {/* Video Details Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-white leading-snug">
          {video.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1f293d]">
          {/* Creator Profile */}
          <div className="flex items-center gap-4">
            <img
              src={video.owner?.avatar || user?.avatar}
              alt={video.owner?.username}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#1f293d]"
            />
            <div>
              <h3 className="text-base font-bold text-white">
                {video.owner?.fullName || user?.fullName || `@${video.owner?.username || user?.username}`}
              </h3>
              <p className="text-xs text-gray-400">
                {video.owner?.subscribersCount || 0} Subscribers
              </p>
            </div>

            {/* Subscribe Button */}
            {user?._id !== video.owner?._id && (
              <button
                onClick={() =>
                  isAuthenticated && subscribeMutation.mutate(video.owner._id)
                }
                disabled={subscribeMutation.isPending}
                className={`ml-2 px-5 py-2 rounded-full font-bold text-xs transition-all flex items-center gap-1.5 shadow-md ${
                  video.owner?.isSubscribed
                    ? "bg-[#1f293d] text-gray-200 hover:bg-[#28354f]"
                    : "bg-cyan-500 text-black hover:bg-cyan-400"
                }`}
              >
                {video.owner?.isSubscribed ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Subscribed</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Subscribe</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Actions & Analytics */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => isAuthenticated && likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs transition-all border ${
                video.isLiked
                  ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                  : "bg-[#131a2a] border-[#1f293d] text-gray-300 hover:border-gray-500"
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
          {isCommentsLoading ? (
            <div className="text-sm text-gray-500 py-4 animate-pulse">Loading comments...</div>
          ) : comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment._id}
                className="flex flex-col p-4 rounded-2xl bg-[#131a2a]/60 border border-[#1f293d] group"
              >
                <div className="flex gap-3">
                  <img
                    src={comment.owner?.avatar || user?.avatar}
                    alt={comment.owner?.username}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-gray-200">
                        @{comment.owner?.username || user?.username}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1 leading-normal break-words">
                      {comment.content}
                    </p>

                    <div className="flex items-center gap-4 mt-2.5">
                      <button
                        onClick={() =>
                          setOpenReplyCommentId(
                            openReplyCommentId === comment._id ? null : comment._id
                          )
                        }
                        className={`flex items-center gap-1.5 text-xs transition-colors ${
                          openReplyCommentId === comment._id
                            ? "text-cyan-400 font-semibold"
                            : "text-gray-400 hover:text-cyan-400"
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{comment.repliesCount ? `${comment.repliesCount} Replies` : "Reply"}</span>
                      </button>
                    </div>
                  </div>

                  {user?._id === (comment.owner?._id || user?._id) && (
                    <button
                      onClick={() => deleteCommentMutation.mutate(comment._id)}
                      title="Delete Comment"
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 transition-all shrink-0 self-start"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Nested Replies Section */}
                {openReplyCommentId === comment._id && (
                  <VideoCommentRepliesSection
                    commentId={comment._id}
                    videoId={video._id}
                  />
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
