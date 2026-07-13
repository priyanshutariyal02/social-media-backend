import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import type { ChannelStats, Video } from "../types";
import { VideoCard } from "../components/VideoCard";
import { AuthRequiredPopup } from "../components/AuthRequiredPopup";
import {
  Eye,
  Users,
  Video as VideoIcon,
  ThumbsUp,
  Upload,
  X,
  Loader2,
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Fetch Stats
  const { data: stats, isLoading: isStatsLoading } = useQuery<ChannelStats>({
    queryKey: ["channelStats"],
    queryFn: async () => {
      const res = await api.get("/dashboard/stats");
      return res.data?.data;
    },
  });

  // Fetch Channel Videos
  const { data: channelVideos, isLoading: isVideosLoading } = useQuery<Video[]>(
    {
      queryKey: ["channelVideos"],
      queryFn: async () => {
        const res = await api.get("/dashboard/videos");
        return res.data?.data || [];
      },
    }
  );

  // Upload video mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!videoFile || !thumbnailFile) {
        throw new Error("Video file and thumbnail file are required.");
      }
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("videoFile", videoFile);
      formData.append("thumbnail", thumbnailFile);

      await api.post("/videos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setVideoFile(null);
      setThumbnailFile(null);
      setUploadError(null);
      queryClient.invalidateQueries({ queryKey: ["channelVideos"] });
      queryClient.invalidateQueries({ queryKey: ["channelStats"] });
    },
    onError: (err: any) => {
      setUploadError(
        err?.response?.data?.message || err?.message || "Video upload failed."
      );
    },
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    uploadMutation.mutate();
  };

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Creator Studio
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your broadcasts, track analytics, and publish new video
            streams.
          </p>
        </div>
        <AuthRequiredPopup
          title="Creator Studio Access"
          message="Sign in to publish videos, track analytics, and manage your broadcast channel."
          position="bottom-right"
        >
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-sm shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Publish Video</span>
          </button>
        </AuthRequiredPopup>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-[#131a2a] border border-[#1f293d] flex items-center gap-4 shadow-md">
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Total Channel Views</div>
            <div className="text-2xl font-bold text-white mt-0.5">
              {isStatsLoading ? "..." : stats?.totalViews || 0}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#131a2a] border border-[#1f293d] flex items-center gap-4 shadow-md">
          <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Total Subscribers</div>
            <div className="text-2xl font-bold text-white mt-0.5">
              {isStatsLoading ? "..." : stats?.totalSubscribers || 0}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#131a2a] border border-[#1f293d] flex items-center gap-4 shadow-md">
          <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <VideoIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Total Published Videos</div>
            <div className="text-2xl font-bold text-white mt-0.5">
              {isStatsLoading ? "..." : stats?.totalVideos || 0}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#131a2a] border border-[#1f293d] flex items-center gap-4 shadow-md">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Total Cumulative Likes</div>
            <div className="text-2xl font-bold text-white mt-0.5">
              {isStatsLoading ? "..." : stats?.totalLikes || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Videos Section */}
      <div className="flex flex-col gap-4 mt-2">
        <h2 className="text-lg font-bold text-white">Your Published Streams</h2>

        {isVideosLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-video rounded-2xl bg-[#131a2a] border border-[#1f293d]"
              />
            ))}
          </div>
        ) : channelVideos && channelVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {channelVideos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        ) : (
          <div className="p-16 text-center rounded-3xl bg-[#131a2a]/40 border border-[#1f293d] flex flex-col items-center">
            <VideoIcon className="w-12 h-12 text-gray-600 mb-3" />
            <h3 className="text-base font-semibold text-gray-200">
              No Videos Published
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm">
              Click the "Publish Video" button above to upload your first
              broadcast to Cloudinary and stream it live.
            </p>
          </div>
        )}
      </div>

      {/* Upload Video Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#131a2a] border border-[#1f293d] rounded-3xl p-6 shadow-2xl flex flex-col gap-5 relative">
            <div className="flex items-center justify-between border-b border-[#1f293d] pb-4">
              <h3 className="text-lg font-bold text-white">
                Publish New Video
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#1f293d] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Video Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Building an Agentic AI RAG Engine..."
                  className="w-full bg-[#0b0f19] border border-[#1f293d] rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what this broadcast covers..."
                  className="w-full bg-[#0b0f19] border border-[#1f293d] rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Video File (.mp4)
                  </label>
                  <input
                    type="file"
                    required
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Thumbnail Image (.jpg/.png)
                  </label>
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={(e) =>
                      setThumbnailFile(e.target.files?.[0] || null)
                    }
                    className="w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={uploadMutation.isPending}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-sm shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {uploadMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                <span>
                  {uploadMutation.isPending
                    ? "Uploading to Cloudinary..."
                    : "Publish Broadcast"}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
