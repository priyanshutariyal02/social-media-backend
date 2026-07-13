import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogIn,
  UserPlus,
  ThumbsUp,
  MessageSquare,
  X,
  Sparkles,
} from "lucide-react";

export type AuthPopupAction =
  | "subscribe"
  | "like"
  | "comment"
  | "reply"
  | "tweet"
  | "default";

interface AuthRequiredPopupProps {
  children: React.ReactNode;
  action?: AuthPopupAction;
  title?: string;
  message?: string;
  position?: "top" | "bottom" | "left" | "right" | "top-right" | "bottom-right";
  className?: string;
}

export const AuthRequiredPopup: React.FC<AuthRequiredPopupProps> = ({
  children,
  action = "default",
  title,
  message,
  position = "bottom",
  className = "",
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close popover on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Intercept clicks if user is not logged in
  const handleCapture = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(true);
    }
  };

  const getActionDetails = () => {
    switch (action) {
      case "subscribe":
        return {
          icon: <UserPlus className="w-5 h-5 text-cyan-400" />,
          title: title || "Want to subscribe to this channel?",
          message: message || "Sign in to subscribe to this channel.",
        };
      case "like":
        return {
          icon: <ThumbsUp className="w-5 h-5 text-cyan-400" />,
          title: title || "Like this post?",
          message: message || "Sign in to make your opinion count.",
        };
      case "comment":
      case "reply":
        return {
          icon: <MessageSquare className="w-5 h-5 text-cyan-400" />,
          title: title || "Want to join the conversation?",
          message: message || "Sign in to continue",
        };
      case "tweet":
        return {
          icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
          title: title || "Want to share an update?",
          message: message || "Sign in to continue",
        };
      default:
        return {
          icon: <LogIn className="w-5 h-5 text-cyan-400" />,
          title: title || "Authentication Required",
          message:
            message ||
            "Please sign in first to perform this action and unlock all features of Playtube.",
        };
    }
  };

  const details = getActionDetails();

  // Position classes mapping
  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "bottom-full left-0 mb-2.5";
      case "top-right":
        return "bottom-full right-0 mb-2.5";
      case "bottom":
        return "top-full left-0 mt-2.5";
      case "bottom-right":
        return "top-full right-0 mt-2.5";
      case "left":
        return "right-full top-0 mr-2.5";
      case "right":
        return "left-full top-0 ml-2.5";
      default:
        return "top-full left-0 mt-2.5";
    }
  };

  return (
    <div ref={popoverRef} className={`relative inline-flex ${className}`}>
      <div onClickCapture={handleCapture} className="w-full inline-flex">
        {children}
      </div>

      {/* Popover Card */}
      {isOpen && !isAuthenticated && (
        <div
          className={`absolute ${getPositionClasses()} z-[100] w-72 sm:w-80 rounded-2xl bg-[#131a2a]/95 backdrop-blur-2xl border border-cyan-500/40 p-4.5 shadow-2xl shadow-black/90 animate-in fade-in-0 zoom-in-95 duration-200 py-2 px-4 flex flex-col gap-3 text-center`}
        >
          {/* Title & Description */}
          <div className="">
            <h4 className="text-base font-bold text-white leading-snug">
              {details.title}
            </h4>
            <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
              {details.message}
            </p>
          </div>

          {/* Action Buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              navigate("/auth");
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition-all transform active:scale-[0.98]"
          >
            <span>Sign in</span>
          </button>
        </div>
      )}
    </div>
  );
};
