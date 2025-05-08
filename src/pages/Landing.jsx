import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-[#f5ead7] to-[#f8dfc3] relative">
      {/* Hero Section */}
      <div className="w-full max-w-3xl text-center py-12">
        <h1 className="text-5xl font-bold mb-4 text-[#442e1c]">Welcome to KindKite 🪁</h1>
        <p className="text-xl mb-8 text-[#5e4633]">
          Empowering organizations to make a difference through streamlined grant management and impactful giving.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <a
            href="https://tally.so/r/w8QxXp"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#3d6b44] hover:bg-opacity-90 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Join the Waitlist
          </a>
          <Link
            to="/"
            className="bg-white text-[#442e1c] px-8 py-4 rounded-xl text-lg font-semibold border border-[#f2e4d5] hover:bg-[#f5ead7] transition-all transform hover:scale-105 shadow"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full max-w-4xl grid md:grid-cols-3 gap-8 mb-16">
        <div className="p-6 rounded-xl bg-white shadow flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-2 text-[#3d6b44]">Streamlined Grant Management</h3>
          <p className="text-[#5e4633] text-center">
            Simplify your grant application and management process with our intuitive platform.
          </p>
        </div>
        <div className="p-6 rounded-xl bg-white shadow flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-2 text-[#3d6b44]">Impact Tracking</h3>
          <p className="text-[#5e4633] text-center">
            Measure and visualize the impact of your grants with comprehensive analytics.
          </p>
        </div>
        <div className="p-6 rounded-xl bg-white shadow flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-2 text-[#3d6b44]">Community Focus</h3>
          <p className="text-[#5e4633] text-center">
            Connect with like-minded organizations and build a stronger community together.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full max-w-2xl text-center mb-20">
        <h2 className="text-3xl font-bold mb-4 text-[#442e1c]">Ready to Get Started?</h2>
        <p className="text-lg text-[#5e4633] mb-6">
          Join our waitlist to be among the first to experience KindKite's platform.
        </p>
        <a
          href="https://tally.so/r/w8QxXp"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[#3d6b44] hover:bg-opacity-90 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
        >
          Join the Waitlist
        </a>
      </div>

      {/* Version info */}
      <div className="absolute bottom-4 right-4 text-sm text-[#5e4633] opacity-80">
        Version 1.0
      </div>
    </div>
  );
};

export default Landing; 