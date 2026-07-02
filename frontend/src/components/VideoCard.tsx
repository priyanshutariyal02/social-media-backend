import React from "react";
import { Link } from "react-router-dom";
import type { Video } from "../types";
import { useAuth } from "../context/AuthContext";
import { Eye, Clock } from "lucide-react";

interface VideoCardProps {
  video: Video;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const { user } = useAuth();
  const avatarUrl = video.owner?.avatar;
  const ownerName =
    video.owner?.fullName ||
    (video.owner?.username ? `@${video.owner.username}` : null) ||
    user?.fullName ||
    (user?.username ? `@${user.username}` : null) ||
    "Creator";

  const formatDuration = (seconds: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="group flex flex-col gap-3">
      {/* Thumbnail Container */}
      <Link
        to={`/watch/${video._id}`}
        className="relative aspect-video rounded-2xl overflow-hidden bg-[#131a2a] border border-[#1f293d] group-hover:border-cyan-500/40 transition-all shadow-md"
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Duration badge */}
        <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[11px] font-semibold text-white flex items-center gap-1">
          <Clock className="w-3 h-3 text-cyan-400" />
          {formatDuration(video.duration)}
        </span>
      </Link>

      {/* Metadata */}
      <div className="flex gap-3 px-1">
        <img
          src={avatarUrl}
          alt={ownerName}
          className="w-9 h-9 rounded-full object-cover ring-1 ring-[#1f293d] shrink-0 mt-0.5"
        />
        <div className="flex flex-col min-w-0 flex-1">
          <Link
            to={`/watch/${video._id}`}
            className="text-sm font-semibold text-gray-100 group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug"
          >
            {video.title}
          </Link>
          <span className="text-xs text-gray-400 mt-1 hover:text-gray-200 transition-colors">
            {ownerName}
          </span>
          <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {video.views || 0} views
            </span>
            <span>•</span>
            <span>{formatDate(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VideoCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="aspect-video rounded-2xl bg-[#131a2a] border border-[#1f293d]" />
      <div className="flex gap-3 px-1">
        <div className="w-9 h-9 rounded-full bg-[#131a2a] shrink-0" />
        <div className="flex flex-col flex-1 gap-2 py-1">
          <div className="h-4 bg-[#131a2a] rounded w-11/12" />
          <div className="h-3 bg-[#131a2a] rounded w-2/3" />
        </div>
      </div>
    </div>
  );
};
