import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl font-bold mb-4 text-[#442e1c]">Welcome to KindKite 🪁</h1>
      <p className="text-lg mb-6 max-w-xl text-center text-[#5e4633]">
        KindKite helps nonprofits discover top-fit, low-effort grants with AI support. Explore your personalized dashboard below.
      </p>
      <div className="flex flex-col gap-4">
        <Link
          to="/dashboard"
          className="bg-[#3d6b44] hover:bg-opacity-90 text-white px-8 py-4 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg"
        >
          View Dashboard
        </Link>
        <Link
          to="/admin/grants"
          className="bg-[#6b3d3d] hover:bg-opacity-90 text-white px-8 py-4 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg"
        >
          Admin Dashboard
        </Link>
      </div>
      
      {/* Version info */}
      <div className="absolute bottom-4 right-4 text-sm text-gray-500">
        Version 1.0
      </div>
    </div>
  );
};

export default Home;
