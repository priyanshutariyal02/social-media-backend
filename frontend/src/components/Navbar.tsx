import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Play, Search, LogOut, Video, LogIn, X, Loader2 } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch live search results
  const { data: searchResults, isLoading: isSearchLoading } = useQuery<any[]>({
    queryKey: ["navbarSearch", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const res = await api.get(
        `/videos?query=${encodeURIComponent(searchQuery.trim())}&limit=5`
      );
      return (
        res.data?.data?.videos ||
        res.data?.data?.docs ||
        (Array.isArray(res.data?.data) ? res.data.data : [])
      );
    },
    enabled: searchQuery.trim().length > 0 && isSearchOpen,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0b0f19]/90 backdrop-blur-md border-b border-[#1f293d] px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Play className="w-5 h-5 text-black fill-black ml-0.5" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
            Play<span className="text-cyan-400">tube</span>
          </span>
        </Link>

        {/* Search Bar */}
        <div ref={searchRef} className="hidden md:flex flex-1 max-w-md relative">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search videos, creators, streams..."
              className="w-full bg-[#131a2a] border border-[#1f293d] rounded-full pl-10 pr-9 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Live Search Results Dropdown */}
          {isSearchOpen && searchQuery.trim() && (
            <div className="absolute top-12 left-0 right-0 bg-[#131a2a] border border-[#1f293d] rounded-2xl shadow-2xl p-3 z-50 flex flex-col gap-2 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#1f293d]/60">
                <span>Matching Streams</span>
                {isSearchLoading && (
                  <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                )}
              </div>

              {searchResults && searchResults.length > 0 ? (
                <>
                  {searchResults.map((video: any) => (
                    <div
                      key={video._id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        navigate(`/watch/${video._id}`);
                      }}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#1f293d] cursor-pointer transition-colors group"
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-14 h-8 rounded-lg object-cover bg-black shrink-0"
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-semibold text-gray-100 group-hover:text-cyan-400 truncate">
                          {video.title}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {video.owner?.fullName || `@${video.owner?.username}`} •{" "}
                          {video.views || 0} views
                        </span>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
                    }}
                    className="mt-1 w-full py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold text-center transition-colors"
                  >
                    View all results for "{searchQuery}"
                  </button>
                </>
              ) : !isSearchLoading ? (
                <div className="py-6 text-center text-xs text-gray-500">
                  No videos found matching "{searchQuery}".
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#131a2a] hover:bg-[#1f293d] border border-[#1f293d] text-xs font-medium text-cyan-400 transition-colors"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Studio</span>
              </Link>

              <div className="flex items-center gap-2 pl-2 border-l border-[#1f293d]">
                <img
                  src={
                    user?.avatar ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"
                  }
                  alt={user?.username}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-500/40"
                />
                <span className="text-sm font-medium text-gray-200 hidden lg:inline">
                  @{user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/auth"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-semibold text-sm shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
