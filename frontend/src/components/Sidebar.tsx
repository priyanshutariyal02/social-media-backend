import React from "react";
import { NavLink } from "react-router-dom";
import { Home, MessageSquare, Users, LayoutDashboard } from "lucide-react";

export const Sidebar: React.FC = () => {
  const navItems = [
    { name: "Feed", path: "/", icon: Home },
    { name: "Tweets", path: "/tweets", icon: MessageSquare },
    { name: "Subscriptions", path: "/subscriptions", icon: Users },
    { name: "Creator Studio", path: "/dashboard", icon: LayoutDashboard },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#0b0f19] border-r border-[#1f293d] p-4 hidden md:flex flex-col gap-1 sticky top-[61px] h-[calc(100vh-61px)]">
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 px-3 mb-2">
        Navigation
      </div>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
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
      })}

      <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-[#131a2a] to-[#172033] border border-[#1f293d]">
        <h4 className="text-sm font-semibold text-white mb-1">Go Premium</h4>
        <p className="text-xs text-gray-400 mb-3">
          Unlock 4K streaming and zero ads across your device.
        </p>
        <button className="w-full py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold border border-cyan-500/30 transition-all">
          Explore Features
        </button>
      </div>
    </aside>
  );
};
