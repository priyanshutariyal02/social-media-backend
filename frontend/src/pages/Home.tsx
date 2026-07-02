import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Video } from "../types";
import { VideoCard, VideoCardSkeleton } from "../components/VideoCard";
import { Sparkles, TrendingUp, Flame, Search, X } from "lucide-react";

export const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryParam = searchParams.get("q") || "";

  const {
    data: videos,
    isLoading,
    isError,
  } = useQuery<Video[]>({
    queryKey: ["videos", queryParam],
    queryFn: async () => {
      const endpoint = queryParam
        ? `/videos?query=${encodeURIComponent(queryParam)}`
        : "/videos";
      const res = await api.get(endpoint);
      return (
        res.data?.data?.videos ||
        res.data?.data?.docs ||
        (Array.isArray(res.data?.data) ? res.data.data : [])
      );
    },
  });

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Category or Search Banner */}
      {queryParam ? (
        <div className="flex items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#131a2a] to-[#1e2a44] border border-cyan-500/30 shadow-xl">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <Search className="w-4 h-4" /> Search Filter Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Results for "{queryParam}"
            </h1>
            <p className="text-sm text-gray-400">
              Showing matching video broadcasts and streams.
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#131a2a] hover:bg-[#1f293d] border border-[#1f293d] text-xs font-semibold text-gray-300 hover:text-white transition-all"
          >
            <X className="w-4 h-4 text-red-400" />
            <span>Clear Search</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#131a2a] via-[#172138] to-[#131a2a] border border-[#1f293d] shadow-xl">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Featured Feed
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Discover Trending Streams
            </h1>
            <p className="text-sm text-gray-400 max-w-lg">
              Watch high-definition tech talks, code walkthroughs, and community
              broadcasts powered by Playtube scalable media architecture.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <div className="p-4 rounded-2xl bg-[#0b0f19]/80 border border-[#1f293d] flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 text-cyan-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-gray-400">Platform Uptime</div>
                <div className="text-sm font-bold text-white">99.99% Ultra</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#0b0f19]/80 border border-[#1f293d] flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-gray-400">Active Creators</div>
                <div className="text-sm font-bold text-white">10K+ Verified</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Videos Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-[#131a2a]/50 border border-[#1f293d]">
          <p className="text-gray-400 text-sm">
            Failed to load video stream feed.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Ensure the backend server is running on port 8000.
          </p>
        </div>
      ) : videos && videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 text-center rounded-2xl bg-[#131a2a]/40 border border-[#1f293d]">
          <h3 className="text-lg font-semibold text-gray-200">
            No Videos Found
          </h3>
          <p className="text-sm text-gray-400 mt-1 max-w-sm">
            {queryParam
              ? `We couldn't find any streams matching "${queryParam}". Try another keyword!`
              : "Be the first creator to upload a video broadcast from the Creator Studio!"}
          </p>
        </div>
      )}
    </div>
  );
};
