import React from "react";
import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { Home } from "./pages/Home";
import { Auth } from "./pages/Auth";
import { WatchVideo } from "./pages/WatchVideo";
import { Tweets } from "./pages/Tweets";
import { Dashboard } from "./pages/Dashboard";
import { Subscriptions } from "./pages/Subscriptions";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 min-w-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/watch/:videoId" element={<WatchVideo />} />
            <Route path="/tweets" element={<Tweets />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute fallbackType="card">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
