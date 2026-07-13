import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  UserCheck,
  Play,
  ArrowRight,
  Loader2,
  UserCircle,
} from "lucide-react";

interface SubscribedChannel {
  _id: string;
  username: string;
  fullName: string;
  avatar: string;
  createdAt: string;
}

export const Subscriptions: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] p-6 text-center max-w-lg mx-auto animate-in fade-in-50 duration-300">
        {/* Exact YouTube Subscriptions Logged-out Icon */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-6">
          {/* Top small folder tab */}
          <div className="absolute top-3 w-16 h-5 bg-gray-200 rounded-t-xl shadow-sm" />
          {/* Main card outline with dark inner video screen */}
          <div className="absolute top-6 w-28 h-20 bg-white rounded-2xl p-1.5 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full bg-[#0b0f19] rounded-xl flex items-center justify-center">
              <Play className="w-8 h-8 text-white fill-white translate-x-0.5" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-3">
          Don’t miss new videos
        </h2>
        <p className="text-sm sm:text-base text-gray-300 mt-2.5 leading-relaxed">
          Sign in to see updates from your favorite Playtube channels
        </p>

        <Link
          to="/auth"
          state={{ from: location }}
          className="mt-6 px-6 py-2 rounded-full border border-[#3f4b66] hover:border-cyan-400 bg-transparent hover:bg-cyan-500/10 text-cyan-400 hover:text-cyan-300 font-semibold text-sm shadow-md transition-all flex items-center gap-2"
        >
          <UserCircle className="w-5 h-5 text-cyan-400" />
          <span>Sign in</span>
        </Link>
      </div>
    );
  }

  // Fetch channels subscribed to by current user
  const {
    data: channels,
    isLoading,
    isError,
  } = useQuery<SubscribedChannel[]>({
    queryKey: ["subscribedChannels", user?._id],
    queryFn: async () => {
      if (!user?._id) return [];
      const res = await api.get(`/subscriptions/c/${user._id}`);
      return res.data?.data || [];
    },
    enabled: !!user?._id,
  });

  // Toggle subscription mutation
  const unsubscribeMutation = useMutation({
    mutationFn: async (channelId: string) => {
      await api.post(`/subscriptions/c/${channelId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscribedChannels"] });
    },
  });

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-16">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#131a2a] via-[#172138] to-[#131a2a] border border-[#1f293d] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-inner">
            <Users className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Subscribed Channels
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage your favorite creators and stay connected with their latest broadcasts.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/")}
          className="px-5 py-2.5 rounded-xl bg-[#0b0f19] hover:bg-[#1f293d] border border-[#1f293d] text-gray-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-2 self-start sm:self-center shrink-0"
        >
          <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
          <span>Explore Feed</span>
        </button>
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-56 rounded-2xl bg-[#131a2a] border border-[#1f293d]"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-[#131a2a]/60 border border-[#1f293d]">
          <p className="text-gray-400 text-sm">
            Failed to load your subscribed channels.
          </p>
        </div>
      ) : channels && channels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {channels.map((channel) => (
            <div
              key={channel._id}
              className="p-6 rounded-3xl bg-[#131a2a] border border-[#1f293d] hover:border-cyan-500/40 transition-all flex flex-col items-center text-center gap-4 group shadow-lg"
            >
              <Link
                to={`/?userId=${channel._id}&q=${encodeURIComponent(channel.username)}`}
                className="relative"
              >
                <img
                  src={
                    channel.avatar ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
                  }
                  alt={channel.username}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-[#1f293d] group-hover:ring-cyan-500/50 group-hover:scale-105 transition-all shadow-xl"
                />
              </Link>

              <div className="flex flex-col min-w-0 w-full">
                <h3 className="text-base font-bold text-white truncate">
                  {channel.fullName || channel.username}
                </h3>
                <span className="text-xs text-gray-400 truncate mt-0.5">
                  @{channel.username}
                </span>
              </div>

              <div className="flex flex-col gap-2 w-full mt-auto pt-2">
                <button
                  onClick={() => unsubscribeMutation.mutate(channel._id)}
                  disabled={unsubscribeMutation.isPending}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1f293d] hover:bg-red-500/20 hover:text-red-400 text-gray-200 font-bold text-xs transition-all flex items-center justify-center gap-2 border border-transparent hover:border-red-500/30"
                >
                  {unsubscribeMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 text-cyan-400 group-hover:text-red-400" />
                      <span>Subscribed</span>
                    </>
                  )}
                </button>

                <Link
                  to={`/?userId=${channel._id}&q=${encodeURIComponent(channel.username)}`}
                  className="w-full py-2 px-3 rounded-xl bg-[#0b0f19] hover:bg-[#162033] text-gray-400 hover:text-cyan-400 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>View Videos</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 text-center rounded-3xl bg-[#131a2a]/50 border border-[#1f293d] max-w-xl mx-auto my-6">
          <div className="w-16 h-16 rounded-3xl bg-[#0b0f19] border border-[#1f293d] flex items-center justify-center text-gray-500 mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">
            No Subscriptions Yet
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
            You haven't subscribed to any creators yet. Explore the home feed to find streams and click subscribe on your favorite channels!
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Explore Home Feed</span>
          </button>
        </div>
      )}
    </div>
  );
};
