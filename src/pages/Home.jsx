import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-[#f5ead7] to-[#f8dfc3]">
      <h1 className="text-4xl font-bold mb-4 text-[#442e1c]">Welcome to KindKite 🪁</h1>
      <p className="text-lg mb-8 max-w-xl text-center text-[#5e4633]">
        KindKite helps nonprofits discover top-fit, low-effort grants with AI support. Explore your personalized dashboard below.
      </p>

      {/* Main Navigation */}
      <div className="flex flex-col gap-4 w-full max-w-md">
        {/* Pilot Organization Access */}
        <Link
          to="/pilot"
          className="bg-[#3d6b44] hover:bg-opacity-90 text-white px-8 py-4 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg flex flex-col items-center"
        >
          <span className="font-semibold">Pilot Organization Access</span>
          <span className="text-sm opacity-80">View your curated grant opportunities</span>
        </Link>

        {/* Dashboard Access */}
        <Link
          to="/dashboard"
          className="bg-[#4d3d6b] hover:bg-opacity-90 text-white px-8 py-4 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg flex flex-col items-center"
        >
          <span className="font-semibold">AI-Powered Dashboard</span>
          <span className="text-sm opacity-80">Discover and analyze new grants</span>
        </Link>

        {/* Admin Access */}
        <Link
          to="/admin/grants"
          className="bg-[#6b3d3d] hover:bg-opacity-90 text-white px-8 py-4 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg flex flex-col items-center"
        >
          <span className="font-semibold">Admin Dashboard</span>
          <span className="text-sm opacity-80">Manage grants and organizations</span>
        </Link>
      </div>
      
      {/* Version info */}
      <div className="absolute bottom-4 right-4 text-sm text-[#5e4633]">
        Version 1.0
      </div>
    </div>
  );
};

export default Home;
