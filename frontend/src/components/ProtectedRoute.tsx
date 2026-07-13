import React from "react";
import { Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2, Lock, LogIn } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackType?: "redirect" | "card";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallbackType = "redirect",
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallbackType === "card") {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center max-w-md mx-auto animate-in fade-in-50 duration-300">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-xl">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">
            Authentication Required
          </h2>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            Please sign in to your account to view this page and unlock full
            access to Creator Studio and Subscriptions.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2.5 rounded-xl bg-[#131a2a] hover:bg-[#1f293d] border border-[#1f293d] text-gray-300 hover:text-white text-xs font-semibold transition-all"
            >
              Go Back
            </button>
            <Link
              to="/auth"
              state={{ from: location }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign in to Continue</span>
            </Link>
          </div>
        </div>
      );
    }
    // Default: cleanly redirect to /auth, preserving the intended destination in location state
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

