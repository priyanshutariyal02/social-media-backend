import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Tweet } from "../types";
import { useAuth } from "../context/AuthContext";
import { MessageSquare, Send, ThumbsUp, Trash2 } from "lucide-react";

export const Tweets: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  const { data: tweets, isLoading } = useQuery<Tweet[]>({
    queryKey: ["tweets"],
    queryFn: async () => {
      const res = await api.get("/tweets/user/all");
      return res.data?.data || [];
    },
  });

  const createTweetMutation = useMutation({
    mutationFn: async (tweetContent: string) => {
      await api.post("/tweets", { content: tweetContent });
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["tweets"] });
    },
  });

  const deleteTweetMutation = useMutation({
    mutationFn: async (tweetId: string) => {
      await api.delete(`/tweets/${tweetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tweets"] });
    },
  });

  const likeTweetMutation = useMutation({
    mutationFn: async (tweetId: string) => {
      await api.post(`/likes/toggle/t/${tweetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tweets"] });
    },
  });

  const handleCreateTweet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !isAuthenticated) return;
    createTweetMutation.mutate(content);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-12">
      {/* Header banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#131a2a] to-[#172138] border border-[#1f293d] flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-cyan-400" />
            <span>Creator Stream & Tweets</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Share quick updates, announcements, and thoughts with your subscribers.
          </p>
        </div>
      </div>

      {/* Post Tweet Input */}
      {isAuthenticated && (
        <form
          onSubmit={handleCreateTweet}
          className="p-5 rounded-3xl bg-[#131a2a] border border-[#1f293d] flex flex-col gap-3 shadow-lg"
        >
          <div className="flex gap-3">
            <img
              src={user?.avatar}
              alt={user?.username}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening in your stream today?"
              className="w-full bg-[#0b0f19] border border-[#1f293d] rounded-2xl p-3.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#1f293d]">
            <span className="text-xs text-gray-500">
              {content.length}/280 characters
            </span>
            <button
              type="submit"
              disabled={!content.trim() || createTweetMutation.isPending}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-xs shadow-md hover:brightness-110 disabled:opacity-40 transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Tweet</span>
            </button>
          </div>
        </form>
      )}

      {/* Tweets Feed */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex flex-col gap-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-[#131a2a] border border-[#1f293d]" />
            ))}
          </div>
        ) : tweets && tweets.length > 0 ? (
          tweets.map((tweet) => (
            <div
              key={tweet._id}
              className="p-5 rounded-2xl bg-[#131a2a] border border-[#1f293d] flex flex-col gap-3 group hover:border-cyan-500/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      tweet.owner?.avatar ||
                      user?.avatar ||
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"
                    }
                    alt={tweet.owner?.username}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {tweet.owner?.fullName || user?.fullName || `@${tweet.owner?.username || user?.username}`}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {new Date(tweet.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {user?._id === (tweet.owner?._id || user?._id) && (
                  <button
                    onClick={() => deleteTweetMutation.mutate(tweet._id)}
                    className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap pl-12">
                {tweet.content}
              </p>

              <div className="flex items-center gap-4 pl-12 pt-1">
                <button
                  onClick={() => isAuthenticated && likeTweetMutation.mutate(tweet._id)}
                  className={`flex items-center gap-1.5 text-xs transition-colors ${
                    tweet.isLiked ? "text-cyan-400 font-semibold" : "text-gray-400 hover:text-cyan-400"
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${tweet.isLiked ? "fill-cyan-400" : ""}`} />
                  <span>{tweet.likesCount || 0}</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-sm text-gray-500 bg-[#131a2a]/50 rounded-3xl border border-[#1f293d]">
            No tweets posted yet. Share your first update above!
          </div>
        )}
      </div>
    </div>
  );
};
