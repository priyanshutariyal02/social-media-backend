import React from "react";
import { NavLink } from "react-router-dom";
import { Home, MessageSquare, Users, LayoutDashboard } from "lucide-react";
import { AuthRequiredPopup, type AuthPopupAction } from "./AuthRequiredPopup";

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  requiresAuth?: boolean;
  action?: AuthPopupAction;
  popupTitle?: string;
  popupMessage?: string;
}

export const Sidebar: React.FC = () => {
  const navItems: NavItem[] = [
    { name: "Feed", path: "/", icon: Home },
    { name: "Community", path: "/tweets", icon: MessageSquare },
    {
      name: "Subscriptions",
      path: "/subscriptions",
      icon: Users,
      requiresAuth: false,
      action: "subscribe",
      popupTitle: "Your Subscriptions",
      popupMessage:
        "Sign in to see all your subscribed channels, track new uploads, and never miss a stream.",
    },
    {
      name: "Creator Studio",
      path: "/dashboard",
      icon: LayoutDashboard,
      requiresAuth: true,
      action: "default",
      popupTitle: "Creator Studio",
      popupMessage:
        "Sign in to access your Creator Studio, upload videos, and track your broadcast analytics.",
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#0b0f19] border-r border-[#1f293d] p-4 hidden md:flex flex-col gap-1 sticky top-[61px] h-[calc(100vh-61px)] z-40">
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 px-3 mb-2">
        Navigation
      </div>
      {navItems.map((item) => {
        const Icon = item.icon;
        const linkElement = (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm"
                  : "text-gray-400 hover:text-gray-100 hover:bg-[#131a2a]"
              }`
            }
          >
            <Icon className="w-4 h-4" />
            <span>{item.name}</span>
          </NavLink>
        );

        if (item.requiresAuth) {
          return (
            <AuthRequiredPopup
              key={item.path}
              action={item.action || "default"}
              title={item.popupTitle}
              message={item.popupMessage}
              position="right"
              className="w-full block"
            >
              {linkElement}
            </AuthRequiredPopup>
          );
        }

        return linkElement;
      })}
    </aside>
  );
};

