import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-[#f5ead7] to-[#f8dfc3]">
      <h1 className="text-4xl font-bold mb-4 text-[#442e1c]">Welcome to KindKite 🪁</h1>
      <p className="text-lg mb-8 max-w-xl text-center text-[#5e4633]">
        KindKite helps nonprofits discover top-fit, low-effort grants with AI support. Explore your personalized dashboard below.
      </p>
      <Link
        to="/org"
        className="bg-[#3d6b44] hover:bg-opacity-90 text-white px-8 py-4 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg"
      >
        View Dashboard
      </Link>
    </div>
  );
};

export default Home;
